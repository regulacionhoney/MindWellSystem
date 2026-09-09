<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreWellnessResourceRequest;
use App\Http\Requests\UpdateWellnessResourceRequest;
use App\Models\WellnessResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class WellnessResourceController extends Controller
{
    /**
     * Public listing of published wellness resources.
     */
    public function publicIndex(Request $request): JsonResponse
    {
        $query = WellnessResource::where('is_published', true)->latest();

        if ($request->has('category')) {
            $query->where('category', $request->query('category'));
        }

        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $resources = $query->paginate($request->integer('per_page', 15));

        return $this->success($resources, 'Wellness resources retrieved');
    }

    /**
     * Admin/counselor listing of all resources (published and drafts).
     */
    public function index(Request $request): JsonResponse
    {
        $query = WellnessResource::latest();

        if ($request->has('category')) {
            $query->where('category', $request->query('category'));
        }

        $resources = $query->paginate($request->integer('per_page', 15));

        return $this->success($resources, 'Wellness resources retrieved');
    }

    /**
     * Store a newly created wellness resource.
     */
    public function store(StoreWellnessResourceRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $resource = WellnessResource::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'category' => $validated['category'],
            'author' => $validated['author'] ?? $request->user()->name,
            'is_published' => $validated['is_published'] ?? true,
            'image_url' => $validated['image_url'] ?? null,
        ]);

        return $this->success($resource, 'Wellness resource created', 201);
    }

    /**
     * Display the specified wellness resource.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $resource = WellnessResource::find($id);

        if (! $resource) {
            return $this->error('Wellness resource not found.', 404);
        }

        if (! $resource->is_published) {
            $user = $request->user();

            if (! $user || $user->isStudent()) {
                return $this->error('Wellness resource not found.', 404);
            }
        }

        return $this->success($resource, 'Wellness resource retrieved');
    }

    /**
     * Update the specified wellness resource.
     */
    public function update(UpdateWellnessResourceRequest $request, int $id): JsonResponse
    {
        try {
            $resource = WellnessResource::findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error('Wellness resource not found.', 404);
        }

        $resource->update($request->validated());

        return $this->success($resource, 'Wellness resource updated');
    }

    /**
     * Remove the specified wellness resource.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $resource = WellnessResource::findOrFail($id);
        } catch (ModelNotFoundException) {
            return $this->error('Wellness resource not found.', 404);
        }

        $resource->delete();

        return $this->success(null, 'Wellness resource deleted');
    }
}