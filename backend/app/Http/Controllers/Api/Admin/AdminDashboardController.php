<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\Event;
use App\Models\Guest;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function stats(Request $request)
    {
        $totalUsers = User::count();
        $eventOwners = User::where('role', 'event_owner')->count();
        $receptionists = User::where('role', 'receptionist')->count();

        $totalEvents = Event::count();
        $activeEvents = Event::where('status', 'published')->count();

        $totalGuests = Guest::count();
        $totalCheckIns = AttendanceLog::where('status', 'ACCEPTED')->count();

        $activeSubscriptions = Subscription::where('status', 'active')->count();
        $totalRevenue = Payment::where('status', 'success')->sum('amount');

        $recentUsers = User::orderBy('created_at', 'desc')->take(5)->get();
        $recentPayments = Payment::with('user')->orderBy('created_at', 'desc')->take(5)->get();

        return response()->json([
            'success' => true,
            'data' => [
                'users' => [
                    'total' => $totalUsers,
                    'owners' => $eventOwners,
                    'receptionists' => $receptionists,
                ],
                'events' => [
                    'total' => $totalEvents,
                    'active' => $activeEvents,
                ],
                'attendance' => [
                    'total_guests' => $totalGuests,
                    'total_checkins' => $totalCheckIns,
                ],
                'financials' => [
                    'active_subscriptions' => $activeSubscriptions,
                    'total_revenue' => $totalRevenue,
                ],
                'recent_users' => $recentUsers,
                'recent_payments' => $recentPayments,
            ]
        ]);
    }
}
