<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Guest;
use App\Models\QrCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class GuestController extends Controller
{
    public function index(Request $request, $eventId)
    {
        $event = Event::where('id', $eventId)->where('user_id', $request->user()->id)->first();

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found'
            ], 404);
        }

        $guests = Guest::where('event_id', $eventId)->orderBy('name', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $guests
        ]);
    }

    public function store(Request $request, $eventId)
    {
        $event = Event::where('id', $eventId)->where('user_id', $request->user()->id)->first();

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'companions_count' => 'integer|min:0',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $check = \App\Services\SubscriptionLimitService::canAddGuest($request->user(), $eventId, 1);
        if (!$check['allowed']) {
            return response()->json(['success' => false, 'message' => $check['message']], 403);
        }

        $guest = Guest::create(array_merge(
            $validator->validated(),
            [
                'event_id' => $eventId,
                'invitation_status' => 'pending',
                'attendance_status' => 'absent'
            ]
        ));

        // Generate cryptographically secure random token (256-bit entropy -> 32 bytes)
        $rawToken = 'jwt_' . Str::random(32);
        $tokenHash = hash('sha256', $rawToken);

        QrCode::create([
            'guest_id' => $guest->id,
            'event_id' => $eventId,
            'token_hash' => $tokenHash,
            'status' => 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Guest added successfully',
            'data' => array_merge($guest->toArray(), ['plain_token' => $rawToken])
        ], 201);
    }

    public function import(Request $request, $eventId)
    {
        $event = Event::where('id', $eventId)->where('user_id', $request->user()->id)->first();

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'guests' => 'required|array|min:1',
            'guests.*.name' => 'required|string|max:255',
            'guests.*.phone' => 'nullable|string|max:50',
            'guests.*.email' => 'nullable|email|max:255',
            'guests.*.companions_count' => 'integer|min:0',
            'guests.*.notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $guestsInput = $request->input('guests');
        $check = \App\Services\SubscriptionLimitService::canAddGuest($request->user(), $eventId, count($guestsInput));
        if (!$check['allowed']) {
            return response()->json(['success' => false, 'message' => $check['message']], 403);
        }

        $importedGuests = [];

        foreach ($request->input('guests') as $gData) {
            $guest = Guest::create([
                'event_id' => $eventId,
                'name' => $gData['name'],
                'phone' => $gData['phone'] ?? null,
                'email' => $gData['email'] ?? null,
                'companions_count' => $gData['companions_count'] ?? 0,
                'notes' => $gData['notes'] ?? null,
                'invitation_status' => 'pending',
                'attendance_status' => 'absent',
            ]);

            // Generate secure token
            $rawToken = 'jwt_' . Str::random(32);
            $tokenHash = hash('sha256', $rawToken);

            QrCode::create([
                'guest_id' => $guest->id,
                'event_id' => $eventId,
                'token_hash' => $tokenHash,
                'status' => 'active',
            ]);

            $importedGuests[] = array_merge($guest->toArray(), ['plain_token' => $rawToken]);
        }

        return response()->json([
            'success' => true,
            'message' => count($importedGuests) . ' guests imported successfully',
            'data' => $importedGuests
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $guest = Guest::find($id);

        if (!$guest) {
            return response()->json([
                'success' => false,
                'message' => 'Guest not found'
            ], 404);
        }

        $event = Event::where('id', $guest->event_id)->where('user_id', $request->user()->id)->first();
        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'companions_count' => 'sometimes|required|integer|min:0',
            'notes' => 'nullable|string',
            'invitation_status' => 'sometimes|required|string|in:pending,generated,sent,failed',
            'attendance_status' => 'sometimes|required|string|in:absent,present',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $guest->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Guest updated successfully',
            'data' => $guest
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $guest = Guest::find($id);

        if (!$guest) {
            return response()->json([
                'success' => false,
                'message' => 'Guest not found'
            ], 404);
        }

        $event = Event::where('id', $guest->event_id)->where('user_id', $request->user()->id)->first();
        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $guest->delete();

        return response()->json([
            'success' => true,
            'message' => 'Guest deleted successfully'
        ]);
    }
}
