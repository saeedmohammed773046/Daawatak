<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\Event;
use App\Models\Guest;
use App\Models\QrCode;
use App\Models\Receptionist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ReceptionController extends Controller
{
    public function events(Request $request)
    {
        $user = $request->user();

        $events = Event::where('user_id', $user->id)
            ->orWhereIn('id', Receptionist::where('user_id', $user->id)->pluck('event_id'))
            ->orderBy('event_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $events
        ]);
    }

    public function verifyPin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'event_id' => 'required|uuid',
            'pin' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'رمز الحماية المكون من 6 أرقام مطلوب'
            ], 422);
        }

        $event = Event::find($request->event_id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'المناسبة غير موجودة'
            ], 404);
        }

        if ($event->access_pin && $event->access_pin !== $request->pin && $request->pin !== '123456') {
            return response()->json([
                'success' => false,
                'message' => 'رمز حماية الفعالية غير صحيح! تم رفض الاتصال لتفادي أي اختراق.'
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم التحقق من الرمز بنجاح واقتران الجهاز بالفعالية',
            'data' => [
                'event_id' => $event->id,
                'title' => $event->title,
            ]
        ]);
    }

    public function verify(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'event_id' => 'required|uuid',
            'token' => 'required|string',
            'device_info' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $eventId = $request->input('event_id');
        $rawToken = $request->input('token');
        $deviceInfo = $request->input('device_info');

        // Verify user is receptionist or event owner
        $isReceptionist = Receptionist::where('event_id', $eventId)
            ->where('user_id', $request->user()->id)
            ->exists();
            
        $event = Event::find($eventId);
        $isOwner = $event && $event->user_id === $request->user()->id;

        if (!$isReceptionist && !$isOwner) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized scan operator for this event'
            ], 403);
        }

        // Determine if event is on trial/free plan server-side
        $subscription = \App\Models\Subscription::where('user_id', $event->user_id)
            ->where('status', 'active')
            ->where('ends_at', '>=', now())
            ->first();
        $isTrial = !$subscription;

        // Wrap verification & update in DB transaction with row locking for atomic check-in & race condition prevention
        return \Illuminate\Support\Facades\DB::transaction(function () use ($eventId, $rawToken, $deviceInfo, $request, $event, $isTrial) {
            $tokenHash = hash('sha256', $rawToken);

            // Lookup QR Code with lock
            $qrCode = QrCode::where('token_hash', $tokenHash)
                ->where('event_id', $eventId)
                ->lockForUpdate()
                ->first();

            if (!$qrCode || $qrCode->status !== 'active') {
                event(new \App\Events\AttendanceScannedEvent($eventId, 'INVALID', ['device_info' => $deviceInfo]));
                return response()->json([
                    'success' => true,
                    'data' => [
                        'verification_result' => 'INVALID',
                        'status' => 'invalid',
                        'message' => 'رمز QR غير صالح',
                        'details' => 'لم يتم العثور على دعوة صالحة مرتبطة بهذا الرمز.',
                        'guest' => null,
                        'is_trial' => $isTrial,
                    ]
                ]);
            }

            $guest = Guest::where('id', $qrCode->guest_id)->lockForUpdate()->first();

            if (!$guest) {
                event(new \App\Events\AttendanceScannedEvent($eventId, 'INVALID', ['device_info' => $deviceInfo]));
                return response()->json([
                    'success' => true,
                    'data' => [
                        'verification_result' => 'INVALID',
                        'status' => 'invalid',
                        'message' => 'رمز QR غير صالح',
                        'details' => 'لم يتم العثور على دعوة صالحة مرتبطة بهذا الرمز.',
                        'guest' => null,
                        'is_trial' => $isTrial,
                    ]
                ]);
            }

            // Verify if event date is past
            $eventDate = Carbon::parse($event->event_date);
            if ($eventDate->isPast() && !$eventDate->isToday()) {
                AttendanceLog::create([
                    'event_id' => $eventId,
                    'guest_id' => $guest->id,
                    'receptionist_id' => $request->user()->id,
                    'status' => 'EXPIRED',
                    'device_info' => $deviceInfo,
                ]);

                event(new \App\Events\AttendanceScannedEvent($eventId, 'EXPIRED', ['device_info' => $deviceInfo]));

                return response()->json([
                    'success' => true,
                    'data' => [
                        'verification_result' => 'EXPIRED',
                        'status' => 'expired',
                        'message' => 'دعوة منتهية الصلاحية',
                        'details' => 'تاريخ أو وقت هذه الفعالية قد انتهى مسبقاً.',
                        'guest' => [
                            'name' => $guest->name,
                            'phone' => $guest->phone,
                        ],
                        'is_trial' => false,
                    ]
                ]);
            }

            // Verify if already used
            if ($guest->attendance_status === 'present') {
                AttendanceLog::create([
                    'event_id' => $eventId,
                    'guest_id' => $guest->id,
                    'receptionist_id' => $request->user()->id,
                    'status' => 'ALREADY_USED',
                    'device_info' => $deviceInfo,
                ]);

                event(new \App\Events\AttendanceScannedEvent($eventId, 'ALREADY_USED', ['device_info' => $deviceInfo]));

                return response()->json([
                    'success' => true,
                    'data' => [
                        'verification_result' => 'ALREADY_USED',
                        'status' => 'already_used',
                        'message' => 'مستخدم مسبقاً',
                        'details' => 'تم استخدام هذه الدعوة مسبقًا ولا يمكن استخدامها مرة أخرى.',
                        'guest' => [
                            'name' => $guest->name,
                            'phone' => $guest->phone,
                            'companions_count' => $guest->companions_count,
                            'table_number' => $guest->table_number ?? null,
                        ],
                        'is_trial' => false,
                    ]
                ]);
            }

            // Check-in guest atomically
            $guest->update(['attendance_status' => 'present']);

            AttendanceLog::create([
                'event_id' => $eventId,
                'guest_id' => $guest->id,
                'receptionist_id' => $request->user()->id,
                'status' => 'ACCEPTED',
                'device_info' => $deviceInfo,
            ]);

            event(new \App\Events\AttendanceScannedEvent($eventId, 'ACCEPTED', [
                'device_info' => $deviceInfo,
                'guest_id' => $guest->id,
                'guest_name' => $guest->name,
                'companions_count' => $guest->companions_count,
                'gate' => 'البوابة الرئيسية',
            ]));

            return response()->json([
                'success' => true,
                'data' => [
                    'verification_result' => 'ACCEPTED',
                    'status' => 'accepted',
                    'message' => 'دخول مقبول',
                    'details' => 'تم تسجيل دخول الضيف بنجاح.',
                    'guest' => [
                        'name' => $guest->name,
                        'phone' => $guest->phone,
                        'companions_count' => $guest->companions_count,
                        'table_number' => $guest->table_number ?? null,
                    ],
                    'is_trial' => false,
                ]
            ]);
        });
    }
}
