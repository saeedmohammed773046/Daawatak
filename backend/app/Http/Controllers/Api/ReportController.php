<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\Event;
use App\Models\Guest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class ReportController extends Controller
{
    public function exportGuests(Request $request, $eventId)
    {
        $event = Event::where('id', $eventId)->where('user_id', $request->user()->id)->first();

        if (!$event) {
            return response()->json(['success' => false, 'message' => 'Event not found'], 404);
        }

        $guests = Guest::where('event_id', $eventId)->orderBy('name', 'asc')->get();

        $filename = "guests_report_" . $event->id . ".csv";

        $headers = [
            "Content-type" => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function () use ($guests) {
            $file = fopen('php://output', 'w');
            // UTF-8 BOM for Excel compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($file, ['الاسم', 'رقم الهاتف', 'البريد الإلكتروني', 'عدد المرافقين', 'حالة الدعوة', 'حالة الحضور', 'تاريخ الإضافة']);

            foreach ($guests as $guest) {
                fputcsv($file, [
                    $guest->name,
                    $guest->phone ?? '-',
                    $guest->email ?? '-',
                    $guest->companions_count,
                    $guest->invitation_status,
                    $guest->attendance_status === 'present' ? 'حاضر' : 'غائب',
                    $guest->created_at->format('Y-m-d H:i')
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportAttendance(Request $request, $eventId)
    {
        $event = Event::where('id', $eventId)->where('user_id', $request->user()->id)->first();

        if (!$event) {
            return response()->json(['success' => false, 'message' => 'Event not found'], 404);
        }

        $logs = AttendanceLog::with(['guest', 'receptionist'])
            ->where('event_id', $eventId)
            ->orderBy('created_at', 'desc')
            ->get();

        $filename = "attendance_report_" . $event->id . ".csv";

        $headers = [
            "Content-type" => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function () use ($logs) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($file, ['توقيت الفحص', 'اسم الضيف', 'النتيجة', 'اسم موظف الاستقبال', 'معلومات الجهاز']);

            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->created_at->format('Y-m-d H:i:s'),
                    $log->guest ? $log->guest->name : 'غير معروف',
                    $log->status,
                    $log->receptionist ? $log->receptionist->name : 'المنظم الرئيسي',
                    $log->device_info ?? '-'
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
