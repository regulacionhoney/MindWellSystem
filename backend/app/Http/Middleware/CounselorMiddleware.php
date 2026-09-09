<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CounselorMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $request->user()->isCounselor()) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Counselor role required.',
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}