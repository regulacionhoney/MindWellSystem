<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StudentMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $request->user()->isStudent()) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Student role required.',
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}