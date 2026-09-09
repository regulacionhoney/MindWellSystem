<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\CounselingRequest;
use App\Models\Message;
use App\Models\Notification;
use App\Models\WellnessResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Return role-specific dashboard data.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = match ($user->role) {
            'student' => $this->studentDashboard($user),
            'counselor' => $this->counselorDashboard($user),
            'admin' => $this->adminDashboard(),
            default => [],
        };

        return $this->success($data, 'Dashboard data retrieved');
    }

    /**
     * Student dashboard.
     */
    private function studentDashboard($user): array
    {
        return [
            'upcoming_appointments' => Appointment::where('student_id', $user->id)
                ->where('status', Appointment::STATUS_CONFIRMED)
                ->where('scheduled_at', '>=', now())
                ->orderBy('scheduled_at')
                ->limit(5)
                ->get(['id', 'counselor_id', 'scheduled_at', 'duration_minutes', 'status']),
            'counseling_requests' => CounselingRequest::where('user_id', $user->id)
                ->latest()
                ->limit(5)
                ->get(),
            'unread_notifications' => $user->notifications()->where('is_read', false)->count(),
            'recommended_resources' => WellnessResource::where('is_published', true)
                ->latest()
                ->limit(3)
                ->get(['id', 'title', 'category', 'image_url']),
        ];
    }

    /**
     * Counselor dashboard.
     */
    private function counselorDashboard($user): array
    {
        return [
            'upcoming_appointments' => Appointment::where('counselor_id', $user->id)
                ->where('status', Appointment::STATUS_CONFIRMED)
                ->where('scheduled_at', '>=', now())
                ->orderBy('scheduled_at')
                ->limit(5)
                ->get(['id', 'student_id', 'scheduled_at', 'duration_minutes', 'status']),
            'pending_requests' => CounselingRequest::where('status', CounselingRequest::STATUS_PENDING)
                ->latest()
                ->limit(5)
                ->get(['id', 'user_id', 'category', 'urgency', 'status', 'created_at']),
            'total_appointments' => Appointment::where('counselor_id', $user->id)->count(),
            'total_records' => $user->records()->count(),
            'unread_messages' => Message::where('receiver_id', $user->id)->where('is_read', false)->count(),
        ];
    }

    /**
     * Admin dashboard.
     */
    private function adminDashboard(): array
    {
        return [
            'total_users' => \App\Models\User::count(),
            'total_counseling_requests' => CounselingRequest::count(),
            'pending_counseling_requests' => CounselingRequest::where('status', CounselingRequest::STATUS_PENDING)->count(),
            'total_appointments' => Appointment::count(),
            'upcoming_appointments' => Appointment::where('status', Appointment::STATUS_CONFIRMED)
                ->where('scheduled_at', '>=', now())
                ->count(),
            'total_wellness_resources' => WellnessResource::count(),
        ];
    }
}