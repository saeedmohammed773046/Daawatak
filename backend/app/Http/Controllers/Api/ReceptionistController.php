<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\User;
use App\Models\Receptionist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ReceptionistController extends Controller
{
    /**
     * Get all receptionists assigned to an event.
     * GET /api/v1/events/{event}/receptionists
     */
    public function index(Request $request, Event $event)
    {
        // Ensure owner owns the event
        if ($event->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized access'], 403);
        }

        $receptionistIds = Receptionist::where('event_id', $event->id)->pluck('user_id');
        $receptionists = User::whereIn('id', $receptionistIds)->get(['id', 'name', 'email', 'phone', 'created_at']);

        return response()->json([
            'success' => true,
            'data' => $receptionists
        ]);
    }

    /**
     * Create/Assign receptionist credentials for an event.
     * POST /api/v1/events/{event}/receptionists
     */
    public function store(Request $request, Event $event)
    {
        // Ensure owner owns the event
        if ($event->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized access'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'password' => 'required|string|min:4',
            'email' => 'nullable|string|email|max:255',
            'phone' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'يرجى إدخال اسم الموظف وكلمة المرور (4 خانات على الأقل)',
                'errors' => $validator->errors()
            ], 422);
        }

        $email = $request->email;
        if (empty($email)) {
            $email = 'gate_' . Str::lower(Str::random(8)) . '@daawatak.gate';
        }

        // Create the receptionist user
        $user = User::create([
            'id' => (string)Str::uuid(),
            'name' => $request->name,
            'email' => $email,
            'phone' => $request->phone ?? null,
            'role' => 'receptionist',
            'password' => Hash::make($request->password),
        ]);

        // Link the receptionist user to the event
        Receptionist::create([
            'id' => (string)Str::uuid(),
            'event_id' => $event->id,
            'user_id' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء وإضافة موظف الاستقبال للمناسبة بنجاح',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'password' => $request->password,
                'email' => $user->email,
                'created_at' => $user->created_at,
            ]
        ], 201);
    }

    /**
     * Remove receptionist assignment and delete the receptionist user.
     * DELETE /api/v1/events/{event}/receptionists/{user}
     */
    public function destroy(Request $request, Event $event, User $user)
    {
        // Ensure owner owns the event
        if ($event->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized access'], 403);
        }

        // Delete link
        $receptionistLink = Receptionist::where('event_id', $event->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$receptionistLink) {
            return response()->json([
                'success' => false,
                'message' => 'موظف الاستقبال غير مسند لهذه الفعالية'
            ], 404);
        }

        $receptionistLink->delete();

        // If the user only has receptionist role and no other events, delete user to clean up
        $hasOtherAssignments = Receptionist::where('user_id', $user->id)->exists();
        if (!$hasOtherAssignments && $user->role === 'receptionist') {
            $user->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'تم حذف حساب موظف الاستقبال بنجاح'
        ]);
    }
}
