<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SendMessageRequest;
use App\Models\Message;
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

        $messages = Message::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->with(['sender:id,name,avatar', 'receiver:id,name,avatar'])
            ->latest('sent_at')
            ->get()
            ->unique(fn ($m) => $m->sender_id === $userId ? $m->receiver_id : $m->sender_id)
            ->values();

        return $this->success($messages, 'Conversations retrieved');
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