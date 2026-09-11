<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SendMessageRequest;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * Send a message to another user.
     */
    public function send(SendMessageRequest $request): JsonResponse
    {
        $validated = $request->validated();

        if ($validated['receiver_id'] === $request->user()->id) {
            return $this->error('You cannot send a message to yourself.', 422);
        }

        $message = Message::create([
            'sender_id' => $request->user()->id,
            'receiver_id' => $validated['receiver_id'],
            'appointment_id' => $validated['appointment_id'] ?? null,
            'content' => $validated['content'],
            'sent_at' => now(),
        ]);

        return $this->success($message->load(['sender:id,name,avatar', 'receiver:id,name,avatar']), 'Message sent', 201);
    }

    /**
     * List messages between the authenticated user and another user.
     */
    public function conversation(Request $request, int $userId): JsonResponse
    {
        if ($userId === $request->user()->id) {
            return $this->error('Invalid user.', 422);
        }

        $query = Message::with(['sender:id,name,avatar', 'receiver:id,name,avatar'])
            ->where(function ($q) use ($request, $userId) {
                $q->where('sender_id', $request->user()->id)
                    ->where('receiver_id', $userId);
            })
            ->orWhere(function ($q) use ($request, $userId) {
                $q->where('sender_id', $userId)
                    ->where('receiver_id', $request->user()->id);
            })
            ->orderBy('sent_at');

        $messages = $query->paginate($request->integer('per_page', 50));

        return $this->success($messages, 'Conversation retrieved');
    }

    /**
     * List all conversations for the authenticated user.
     */
    public function conversations(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $latest = Message::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->with(['sender:id,name,avatar', 'receiver:id,name,avatar'])
            ->latest('sent_at')
            ->get()
            ->unique(fn ($m) => $m->sender_id === $userId ? $m->receiver_id : $m->sender_id)
            ->values();

        $unreadCounts = Message::where('receiver_id', $userId)
            ->where('is_read', false)
            ->selectRaw('sender_id, count(*) as unread_total')
            ->groupBy('sender_id')
            ->pluck('unread_total', 'sender_id');

        foreach ($latest as $message) {
            $peer = $message->sender_id === $userId ? $message->receiver_id : $message->sender_id;
            $message->setAttribute('unread_count', (int) ($unreadCounts[$peer] ?? 0));
            $message->setAttribute('contact', $message->sender_id === $userId ? $message->receiver : $message->sender);
        }

        return $this->success($latest, 'Conversations retrieved');
    }

    /**
     * List active users the authenticated user can start a conversation with.
     */
    public function contacts(Request $request): JsonResponse
    {
        $contacts = User::where('id', '!=', $request->user()->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'avatar', 'role']);

        return $this->success($contacts, 'Contacts retrieved');
    }

    /**
     * Mark messages as read for a target user.
     */
    public function markRead(Request $request, int $userId): JsonResponse
    {
        $request->user()
            ->messagesReceived()
            ->where('sender_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return $this->success(null, 'Messages marked as read');
    }
}