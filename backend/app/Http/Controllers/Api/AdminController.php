<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\CounselingRequest;
use App\Models\CounselingRecord;
use App\Models\Message;
use App\Models\User;
use App\Models\WellnessResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class AdminController extends Controller
{
    /**
     * List all users (filterable by role and search).
     */
    public function listUsers(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->has('role')) {
            $query->where('role', $request->query('role'));
        }

        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate($request->integer('per_page', 15));

        return $this->success($users, 'Users retrieved');
    }

    /**
     * Display a single user.
     */
    public function showUser(Request $request, int $id): JsonResponse
    {
        $user = User::find($id);

        if (! $user) {
            return $this->error('User not found.', 404);
        }

        return $this->success($user, 'User retrieved');
    }

    /**
     * Update a user's role, active status, or profile fields (admin only).
     */
    public function updateUser(Request $request, int $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error('User not found.', 404);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'role' => ['sometimes', 'in:student,counselor,admin'],
            'phone' => ['nullable', 'string', 'max:30'],
            'avatar' => ['nullable', 'string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $user->update($validated);

        return $this->success($user, 'User updated');
    }

    /**
     * Activate or deactivate a user account.
     */
    public function toggleActive(Request $request, int $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error('User not found.', 404);
        }

        if ($user->id === $request->user()->id) {
            return $this->error('You cannot deactivate your own account.', 422);
        }

        $user->update(['is_active' => ! $user->is_active]);

        return $this->success($user, $user->is_active ? 'User activated' : 'User deactivated');
    }

    /**
     * Delete a user account (soft handled by cascade).
     */
    public function deleteUser(Request $request, int $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error('User not found.', 404);
        }

        if ($user->id === $request->user()->id) {
            return $this->error('You cannot delete your own account.', 422);
        }

        $user->delete();

        return $this->success(null, 'User deleted');
    }

    /**
     * Return platform-wide statistics.
     */
    public function stats(Request $request): JsonResponse
    {
        $stats = [
            'total_users' => User::count(),
            'total_students' => User::where('role', User::ROLE_STUDENT)->count(),
            'total_counselors' => User::where('role', User::ROLE_COUNSELOR)->count(),
            'total_admins' => User::where('role', User::ROLE_ADMIN)->count(),
            'total_counseling_requests' => CounselingRequest::count(),
            'pending_counseling_requests' => CounselingRequest::where('status', CounselingRequest::STATUS_PENDING)->count(),
            'total_appointments' => Appointment::count(),
            'upcoming_appointments' => Appointment::where('status', '!=', Appointment::STATUS_COMPLETED)
                ->where('status', '!=', Appointment::STATUS_CANCELLED)
                ->where('scheduled_at', '>=', now())
                ->count(),
            'total_counseling_records' => CounselingRecord::count(),
            'total_wellness_resources' => WellnessResource::count(),
            'published_wellness_resources' => WellnessResource::where('is_published', true)->count(),
            'total_messages' => Message::count(),
        ];

        return $this->success($stats, 'System statistics retrieved');
    }
}