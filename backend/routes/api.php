<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\GuestController;
use App\Http\Controllers\Api\ReceptionController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\Admin\AdminPlanController;
use App\Http\Controllers\Api\Admin\AdminTemplateController;
use App\Http\Controllers\Api\Admin\AdminSubscriptionController;
use App\Http\Controllers\Api\Admin\AdminAuditLogController;
use App\Http\Middleware\CheckRole;
use Illuminate\Support\Facades\Route;

// Public Health Check Endpoint for Cron / Monitoring
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
    ], 200);
});

Route::prefix('v1')->group(function () {
    // Health Check
    Route::get('/health', function () {
        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->toIso8601String(),
        ], 200);
    });

    // Public Auth with Rate Limiting (60 requests per minute)
    Route::middleware('throttle:60,1')->group(function () {
        Route::post('/auth/register', [AuthController::class, 'register']);
        Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);
        Route::post('/auth/resend-otp', [AuthController::class, 'resendOtp']);
        Route::post('/auth/login', [AuthController::class, 'login']);
        Route::post('/auth/reception-login', [AuthController::class, 'receptionLogin']);
        Route::post('/auth/forgot-password', [PasswordResetController::class, 'forgotPassword']);
        Route::post('/auth/reset-password', [PasswordResetController::class, 'resetPassword']);
    });

    // Protected Endpoints
    Route::middleware('auth:sanctum')->group(function () {
        // Authenticated Session info & Security
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

        // Event Management CRUD
        Route::apiResource('events', EventController::class);
        Route::post('/events/{event}/duplicate', [EventController::class, 'duplicate']);
        Route::get('/events/{event}/receptionists', [\App\Http\Controllers\Api\ReceptionistController::class, 'index']);
        Route::post('/events/{event}/receptionists', [\App\Http\Controllers\Api\ReceptionistController::class, 'store']);
        Route::delete('/events/{event}/receptionists/{user}', [\App\Http\Controllers\Api\ReceptionistController::class, 'destroy']);

        // Guest Directory CRUD & Import
        Route::get('/events/{event}/guests', [GuestController::class, 'index']);
        Route::post('/events/{event}/guests', [GuestController::class, 'store']);
        Route::post('/events/{event}/guests/import', [GuestController::class, 'import']);
        Route::put('/guests/{guest}', [GuestController::class, 'update']);
        Route::delete('/guests/{guest}', [GuestController::class, 'destroy']);

        // Reception Verification (Privacy Compliant + Rate Limited to 60 req/min)
        Route::get('/reception/events', [ReceptionController::class, 'events']);
        Route::post('/reception/verify-pin', [ReceptionController::class, 'verifyPin']);
        Route::middleware('throttle:60,1')->post('/reception/verify', [ReceptionController::class, 'verify']);

        // Analytics
        Route::get('/events/{event}/analytics', [AnalyticsController::class, 'getStats']);

        // Reports Export (CSV)
        Route::get('/reports/events/{event}/guests/csv', [ReportController::class, 'exportGuests']);
        Route::get('/reports/events/{event}/attendance/csv', [ReportController::class, 'exportAttendance']);

        // Invitation Builder & Templates
        Route::get('/invitations/{guest}/preview', [\App\Http\Controllers\Api\InvitationController::class, 'preview'])->name('invitations.preview');
        Route::post('/invitations/{guest}/generate', [\App\Http\Controllers\Api\InvitationController::class, 'generate']);
        Route::post('/invitations/bulk/{event}', [\App\Http\Controllers\Api\InvitationController::class, 'bulkGenerate']);
        Route::get('/invitations/{guest}/download', [\App\Http\Controllers\Api\InvitationController::class, 'download']);

        // Public templates listing for event owners
        Route::get('/templates', [AdminTemplateController::class, 'index']);

        // Super Admin Dashboard & Management Routes
        Route::middleware(CheckRole::class . ':super_admin')->prefix('admin')->group(function () {
            Route::get('/dashboard/stats', [AdminDashboardController::class, 'stats']);
            
            // User Management
            Route::get('/users', [AdminUserController::class, 'index']);
            Route::post('/users', [AdminUserController::class, 'store']);
            Route::get('/users/{id}', [AdminUserController::class, 'show']);
            Route::post('/users/{id}/toggle-status', [AdminUserController::class, 'toggleStatus']);

            // SaaS Plans CRUD
            Route::get('/plans', [AdminPlanController::class, 'index']);
            Route::post('/plans', [AdminPlanController::class, 'store']);
            Route::put('/plans/{id}', [AdminPlanController::class, 'update']);
            Route::delete('/plans/{id}', [AdminPlanController::class, 'destroy']);

            // Templates Management
            Route::get('/templates', [AdminTemplateController::class, 'index']);
            Route::post('/templates', [AdminTemplateController::class, 'store']);
            Route::put('/templates/{id}', [AdminTemplateController::class, 'update']);
            Route::delete('/templates/{id}', [AdminTemplateController::class, 'destroy']);

            // Subscriptions & Payments
            Route::get('/subscriptions', [AdminSubscriptionController::class, 'index']);
            Route::get('/payments', [AdminSubscriptionController::class, 'payments']);
            Route::post('/subscriptions/{id}/status', [AdminSubscriptionController::class, 'updateStatus']);

            // Audit Logs
            Route::get('/audit-logs', [AdminAuditLogController::class, 'index']);
        });
    });
});
