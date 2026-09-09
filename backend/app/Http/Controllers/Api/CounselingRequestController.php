<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewCounselingRequestRequest;
use App\Http\Requests\StoreCounselingRequestRequest;
use App\Models\CounselingRequest;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class CounselingRequestController extends Controller
{
    /**
     * List counseling requests. Students see their own; counselors/admins see all pending.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = CounselingRequest::with('user:id,name,email,avatar')
            ->latest();

        if ($user->isStudent()) {
            $query->where('user_id', $user->id);
        } elseif ($user->isCounselor() && ! $request->has('status')) {
            $query->whereIn('status', ['pending', 'reviewed']);
        }

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        $requests = $query->paginate($request->integer('per_page', 15));

        return $this->success($requests, 'Counseling requests retrieved');
    }

    /**
     * Store a newly created counseling request.
     */
    public function store(StoreCounselingRequestRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $counselingRequest = CounselingRequest::create([
            'user_id' => $request->user()->id,
            'category' => $validated['category'],
            'description' => $validated['description'],
            'urgency' => $validated['urgency'],
            'status' => CounselingRequest::STATUS_PENDING,
        ]);

        return $this->success($counselingRequest->load('user:id,name,email,avatar'), 'Counseling request created', 201);
    }

    /**
     * Display the specified counseling request.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $counselingRequest = CounselingRequest::with('user:id,name,email,avatar')->find($id);

        if (! $counselingRequest) {
            return $this->error('Counseling request not found.', 404);
        }

        if ($user->isStudent() && $counselingRequest->user_id !== $user->id) {
            return $this->error('Access denied.', 403);
        }

        return $this->success($counselingRequest, 'Counseling request retrieved');
    }

    /**
     * Update the specified counseling request (owner only).
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        try {
            $counselingRequest = CounselingRequest::findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error('Counseling request not found.', 404);
        }

        if ($user->isStudent() && $counselingRequest->user_id !== $user->id) {
            return $this->error('Access denied.', 403);
        }

        $validated = $request->validate([
            'category' => ['sometimes', 'string', 'max:100'],
            'description' => ['sometimes', 'string', 'max:5000'],
            'urgency' => ['sometimes', 'in:low,medium,high,urgent'],
        ]);

        $counselingRequest->update($validated);

        return $this->success($counselingRequest, 'Counseling request updated');
    }

    /**
     * Remove the specified counseling request (owner or admin).
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        try {
            $counselingRequest = CounselingRequest::findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error('Counseling request not found.', 404);
        }

        if ($user->isStudent() && $counselingRequest->user_id !== $user->id) {
            return $this->error('Access denied.', 403);
        }

        $counselingRequest->delete();

        return $this->success(null, 'Counseling request deleted');
    }

    /**
     * Review a counseling request and advance its status (counselor/admin only).
     */
    public function review(ReviewCounselingRequestRequest $request, int $id): JsonResponse
    {
        try {
            $counselingRequest = CounselingRequest::findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error('Counseling request not found.', 404);
        }

        $validated = $request->validated();

        $counselingRequest->update(['status' => $validated['status']]);

        if ($validated['status'] === CounselingRequest::STATUS_APPROVED) {
            Notification::create([
                'user_id' => $counselingRequest->user_id,
                'title' => 'Counseling request approved',
                'message' => 'Your counseling request has been approved. You can now schedule an appointment.',
                'type' => 'success',
                'related_type' => CounselingRequest::class,
                'related_id' => $counselingRequest->id,
            ]);
        }

        return $this->success($counselingRequest, 'Counseling request reviewed');
    }
}