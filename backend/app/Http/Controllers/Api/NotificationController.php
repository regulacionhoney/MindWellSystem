<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * List notifications for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return $this->success($notifications, 'Notifications retrieved');
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $notification = $request->user()
            ->notifications()
            ->find($id);

        if (! $notification) {
            return $this->error('Notification not found.', 404);
        }

        $notification->update(['is_read' => true]);

        return $this->success($notification, 'Notification marked as read');
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()
            ->notifications()
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return $this->success(null, 'All notifications marked as read');
    }

    /**
     * Delete a notification.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $notification = $request->user()
            ->notifications()
            ->find($id);

        if (! $notification) {
            return $this->error('Notification not found.', 404);
        }

        $notification->delete();

        return $this->success(null, 'Notification deleted');
    }
}