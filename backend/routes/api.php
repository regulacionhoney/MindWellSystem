<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CounselingRecordController;
use App\Http\Controllers\Api\CounselingRequestController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OAuthController;
use App\Http\Controllers\Api\WellnessResourceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes. These routes are loaded via
| bootstrap/app.php and are assigned the "api" middleware group.
|
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// OAuth (redirect + callback)
Route::get('/auth/{provider}/redirect', [OAuthController::class, 'redirect']);
Route::get('/auth/{provider}/callback', [OAuthController::class, 'callback']);

Route::get('/wellness-resources', [WellnessResourceController::class, 'publicIndex']);
Route::get('/wellness-resources/{id}', [WellnessResourceController::class, 'show'])->whereNumber('id');

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me', [AuthController::class, 'updateProfile']);

    // Dashboard (all roles)
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Notifications (all roles)
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

    // Messages (all roles)
    Route::get('/conversations', [MessageController::class, 'conversations']);
    Route::get('/conversations/{id}', [MessageController::class, 'conversation']);
    Route::post('/messages', [MessageController::class, 'send']);
    Route::post('/conversations/{id}/read', [MessageController::class, 'markRead']);

    // Counseling requests (students create, moderators review)
    Route::get('/counseling-requests', [CounselingRequestController::class, 'index']);
    Route::post('/counseling-requests', [CounselingRequestController::class, 'store'])->middleware('student');
    Route::get('/counseling-requests/{id}', [CounselingRequestController::class, 'show']);
    Route::put('/counseling-requests/{id}', [CounselingRequestController::class, 'update']);
    Route::delete('/counseling-requests/{id}', [CounselingRequestController::class, 'destroy']);
    Route::patch('/counseling-requests/{id}/review', [CounselingRequestController::class, 'review'])->middleware('role:counselor,admin');

    // Appointments
    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store'])->middleware('role:counselor,admin');
    Route::get('/appointments/{id}', [AppointmentController::class, 'show']);
    Route::put('/appointments/{id}', [AppointmentController::class, 'update'])->middleware('role:counselor,admin');
    Route::delete('/appointments/{id}', [AppointmentController::class, 'destroy'])->middleware('role:counselor,admin');
    Route::patch('/appointments/{id}/confirm', [AppointmentController::class, 'confirm']);
    Route::patch('/appointments/{id}/complete', [AppointmentController::class, 'complete'])->middleware('role:counselor,admin');
    Route::patch('/appointments/{id}/cancel', [AppointmentController::class, 'cancel']);

    // Wellness resources management (counselors + admins)
    Route::get('/wellness-resources/manage', [WellnessResourceController::class, 'index'])->middleware('role:counselor,admin');
    Route::post('/wellness-resources', [WellnessResourceController::class, 'store'])->middleware('role:counselor,admin');
    Route::put('/wellness-resources/{id}', [WellnessResourceController::class, 'update'])->middleware('role:counselor,admin');
    Route::delete('/wellness-resources/{id}', [WellnessResourceController::class, 'destroy'])->middleware('role:counselor,admin');

    // Counseling records (counselors + admins)
    Route::get('/counseling-records', [CounselingRecordController::class, 'index'])->middleware('role:counselor,admin');
    Route::post('/counseling-records', [CounselingRecordController::class, 'store'])->middleware('role:counselor,admin');
    Route::get('/counseling-records/{id}', [CounselingRecordController::class, 'show'])->middleware('role:counselor,admin');
    Route::put('/counseling-records/{id}', [CounselingRecordController::class, 'update'])->middleware('role:counselor,admin');
    Route::delete('/counseling-records/{id}', [CounselingRecordController::class, 'destroy'])->middleware('role:counselor,admin');

    // Admin only
    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('/users', [AdminController::class, 'listUsers']);
        Route::get('/users/{id}', [AdminController::class, 'showUser']);
        Route::put('/users/{id}', [AdminController::class, 'updateUser']);
        Route::patch('/users/{id}/toggle-active', [AdminController::class, 'toggleActive']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
        Route::get('/stats', [AdminController::class, 'stats']);
    });
});