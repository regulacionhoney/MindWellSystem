<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAppointmentRequest;
use App\Http\Requests\UpdateAppointmentRequest;
use App\Models\Appointment;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class AppointmentController extends Controller
{
    /**
     * List appointments based on role.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Appointment::with(['counselor:id,name,email,avatar', 'student:id,name,email,avatar', 'request:id,category,status'])
            ->latest('scheduled_at');

        if ($user->isStudent()) {
            $query->where('student_id', $user->id);
        } elseif ($user->isCounselor()) {
            $query->where('counselor_id', $user->id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        $appointments = $query->paginate($request->integer('per_page', 15));

        return $this->success($appointments, 'Appointments retrieved');
    }

    /**
     * Store a newly created appointment (counselor/admin).
     */
    public function store(StoreAppointmentRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $appointment = Appointment::create([
            'request_id' => $validated['request_id'] ?? null,
            'counselor_id' => $request->user()->isAdmin() && isset($validated['counselor_id'])
                ? $validated['counselor_id']
                : $request->user()->id,
            'student_id' => $validated['student_id'],
            'scheduled_at' => $validated['scheduled_at'],
            'duration_minutes' => $validated['duration_minutes'],
            'status' => Appointment::STATUS_CONFIRMED,
            'notes' => $validated['notes'] ?? null,
        ]);

        Notification::create([
            'user_id' => $appointment->student_id,
            'title' => 'New appointment scheduled',
            'message' => 'A counseling appointment has been scheduled and confirmed for you.',
            'type' => 'appointment',
            'related_type' => Appointment::class,
            'related_id' => $appointment->id,
        ]);

        return $this->success($appointment->load(['counselor:id,name,email,avatar', 'student:id,name,email,avatar']), 'Appointment created', 201);
    }

    /**
     * Display the specified appointment.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $appointment = Appointment::with(['counselor:id,name,email,avatar', 'student:id,name,email,avatar', 'request'])
            ->find($id);

        if (! $appointment) {
            return $this->error('Appointment not found.', 404);
        }

        if ($user->isStudent() && $appointment->student_id !== $user->id) {
            return $this->error('Access denied.', 403);
        }

        if ($user->isCounselor() && $appointment->counselor_id !== $user->id) {
            return $this->error('Access denied.', 403);
        }

        return $this->success($appointment, 'Appointment retrieved');
    }

    /**
     * Update the specified appointment.
     */
    public function update(UpdateAppointmentRequest $request, int $id): JsonResponse
    {
        $user = $request->user();

        try {
            $appointment = Appointment::findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error('Appointment not found.', 404);
        }

        if ($user->isCounselor() && $appointment->counselor_id !== $user->id) {
            return $this->error('Access denied.', 403);
        }

        $validated = $request->validated();

        if ($user->isAdmin() && isset($validated['counselor_id'])) {
            $appointment->counselor_id = $validated['counselor_id'];
        }

        $appointment->fill($validated);
        $appointment->save();

        return $this->success($appointment->load(['counselor:id,name,email,avatar', 'student:id,name,email,avatar']), 'Appointment updated');
    }

    /**
     * Remove the specified appointment.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        try {
            $appointment = Appointment::findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error('Appointment not found.', 404);
        }

        if ($user->isCounselor() && $appointment->counselor_id !== $user->id) {
            return $this->error('Access denied.', 403);
        }

        $appointment->delete();

        return $this->success(null, 'Appointment deleted');
    }

    /**
     * Confirm an appointment (counselor/admin).
     */
    public function confirm(Request $request, int $id): JsonResponse
    {
        return $this->updateStatus($request, $id, Appointment::STATUS_CONFIRMED);
    }

    /**
     * Complete an appointment (counselor/admin).
     */
    public function complete(Request $request, int $id): JsonResponse
    {
        return $this->updateStatus($request, $id, Appointment::STATUS_COMPLETED);
    }

    /**
     * Cancel an appointment (participant/admin).
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        return $this->updateStatus($request, $id, Appointment::STATUS_CANCELLED);
    }

    /**
     * Shared status update helper.
     */
    private function updateStatus(Request $request, int $id, string $status): JsonResponse
    {
        $user = $request->user();

        try {
            $appointment = Appointment::findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error('Appointment not found.', 404);
        }

        if ($user->isStudent() && $appointment->student_id !== $user->id) {
            return $this->error('Access denied.', 403);
        }

        if ($user->isCounselor() && $appointment->counselor_id !== $user->id) {
            return $this->error('Access denied.', 403);
        }

        $appointment->update(['status' => $status]);

        if ($user->isStudent() && $status === Appointment::STATUS_CONFIRMED) {
            $title = 'Appointment confirmed by student';
            $message = $appointment->student?->name.' confirmed your scheduled appointment on '.$appointment->scheduled_at.'.';
            $recipientId = $appointment->counselor_id;
        } else {
            $title = 'Appointment '.$status;
            $message = 'Your appointment has been marked as '.$status.'.';
            $recipientId = $user->isStudent() ? $appointment->counselor_id : $appointment->student_id;
        }

        Notification::create([
            'user_id' => $recipientId,
            'title' => $title,
            'message' => $message,
            'type' => 'appointment',
            'related_type' => Appointment::class,
            'related_id' => $appointment->id,
        ]);

        return $this->success($appointment, 'Appointment status updated');
    }
}