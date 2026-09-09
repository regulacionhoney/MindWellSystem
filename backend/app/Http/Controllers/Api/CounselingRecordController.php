<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCounselingRecordRequest;
use App\Http\Requests\UpdateCounselingRecordRequest;
use App\Models\Appointment;
use App\Models\CounselingRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class CounselingRecordController extends Controller
{
    /**
     * List counseling records. Counselors see their own; admins see all.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = CounselingRecord::with(['appointment:id,scheduled_at,status', 'student:id,name,email,avatar'])->latest();

        if ($user->isCounselor()) {
            $query->where('counselor_id', $user->id);
        }

        $records = $query->paginate($request->integer('per_page', 15));

        return $this->success($records, 'Counseling records retrieved');
    }

    /**
     * Store a newly created counseling record (counselor/admin).
     */
    public function store(StoreCounselingRecordRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $appointment = Appointment::find($validated['appointment_id']);

        if (! $appointment) {
            return $this->error('Appointment not found.', 404);
        }

        $counselorId = $request->user()->isAdmin() ? $appointment->counselor_id : $request->user()->id;

        $record = CounselingRecord::create([
            'appointment_id' => $validated['appointment_id'],
            'counselor_id' => $counselorId,
            'student_id' => $validated['student_id'],
            'session_notes' => $validated['session_notes'],
            'follow_up_notes' => $validated['follow_up_notes'] ?? null,
            'follow_up_date' => $validated['follow_up_date'] ?? null,
            'is_confidential' => $validated['is_confidential'] ?? true,
        ]);

        return $this->success($record->load(['appointment:id,scheduled_at,status', 'student:id,name,email,avatar']), 'Counseling record created', 201);
    }

    /**
     * Display the specified counseling record.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $record = CounselingRecord::with(['appointment', 'counselor:id,name,email,avatar', 'student:id,name,email,avatar'])->find($id);

        if (! $record) {
            return $this->error('Counseling record not found.', 404);
        }

        if ($user->isCounselor() && $record->counselor_id !== $user->id) {
            return $this->error('Access denied.', 403);
        }

        return $this->success($record, 'Counseling record retrieved');
    }

    /**
     * Update the specified counseling record (counselor/admin).
     */
    public function update(UpdateCounselingRecordRequest $request, int $id): JsonResponse
    {
        $user = $request->user();

        try {
            $record = CounselingRecord::findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error('Counseling record not found.', 404);
        }

        if ($user->isCounselor() && $record->counselor_id !== $user->id) {
            return $this->error('Access denied.', 403);
        }

        $record->update($request->validated());

        return $this->success($record->load(['appointment', 'student:id,name,email,avatar']), 'Counseling record updated');
    }

    /**
     * Remove the specified counseling record (counselor/admin).
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        try {
            $record = CounselingRecord::findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error('Counseling record not found.', 404);
        }

        if ($user->isCounselor() && $record->counselor_id !== $user->id) {
            return $this->error('Access denied.', 403);
        }

        $record->delete();

        return $this->success(null, 'Counseling record deleted');
    }
}