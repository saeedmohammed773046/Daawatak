<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Guest;
use App\Models\AttendanceLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function getStats(Request $request, $eventId)
    {
        $event = Event::where('id', $eventId)->where('user_id', $request->user()->id)->first();

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found'
            ], 404);
        }

        $totalGuests = Guest::where('event_id', $eventId)->count();
        $attendedGuests = Guest::where('event_id', $eventId)->where('attendance_status', 'present')->count();
        $absentGuests = $totalGuests - $attendedGuests;

        $totalCompanions = Guest::where('event_id', $eventId)
            ->where('attendance_status', 'present')
            ->sum('companions_count');

        $attendancePercentage = $totalGuests > 0 ? round(($attendedGuests / $totalGuests) * 100, 2) : 0;

        $recentLogs = AttendanceLog::where('event_id', $eventId)
            ->where('status', 'ACCEPTED')
            ->with(['guest' => function($query) {
                $query->select('id', 'name');
            }])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function($log) {
                return [
                    'id' => $log->id,
                    'guest_name' => $log->guest ? $log->guest->name : 'N/A',
                    'time' => $log->created_at->toIso8601String(),
                    'device' => $log->device_info ?? 'Unknown Device',
                ];
            });

        $dbDriver = DB::connection()->getDriverName();
        $timeFormat = $dbDriver === 'sqlite' 
            ? "strftime('%H:00', created_at)" 
            : "to_char(created_at, 'HH24:00')";

        $hourlyStats = AttendanceLog::where('event_id', $eventId)
            ->where('status', 'ACCEPTED')
            ->selectRaw("$timeFormat as hour, count(*) as count")
            ->groupBy('hour')
            ->orderBy('hour', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_guests' => $totalGuests,
                'attended_guests' => $attendedGuests,
                'checked_in' => $attendedGuests,
                'absent_guests' => $absentGuests,
                'no_show' => $absentGuests,
                'total_companions' => $totalCompanions,
                'attendance_percentage' => $attendancePercentage,
                'attendance_rate' => $attendancePercentage,
                'recent_scans' => $recentLogs,
                'recent_checkins' => $recentLogs,
                'hourly_stats' => $hourlyStats
            ]
        ]);
    }
}
