<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $events = Event::where('user_id', $request->user()->id)
            ->orderBy('event_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $events
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string|max:100',
            'event_date' => 'required|date',
            'start_time' => 'nullable|string',
            'end_time' => 'nullable|string',
            'venue' => 'required|string|max:255',
            'google_maps_url' => 'nullable|url|max:500',
            'cover_image_url' => 'nullable|string|max:500',
            'theme_config' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $check = \App\Services\SubscriptionLimitService::canCreateEvent($request->user());
        if (!$check['allowed']) {
            return response()->json([
                'success' => false,
                'message' => $check['message']
            ], 403);
        }

        $pin = str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

        $event = Event::create(array_merge(
            $validator->validated(),
            [
                'user_id' => $request->user()->id,
                'start_time' => $request->start_time ?? '20:00:00',
                'status' => 'published',
                'access_pin' => $pin
            ]
        ));

        return response()->json([
            'success' => true,
            'message' => 'Event created successfully',
            'data' => $event
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found'
            ], 404);
        }

        $isOwner = $event->user_id === $request->user()->id;
        $isReceptionist = $event->receptionists()->where('user_id', $request->user()->id)->exists();

        if (!$isOwner && !$isReceptionist) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this event'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $event
        ]);
    }

    public function update(Request $request, $id)
    {
        $event = Event::where('id', $id)->where('user_id', $request->user()->id)->first();

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'sometimes|required|string|max:100',
            'event_date' => 'sometimes|required|date',
            'start_time' => 'sometimes|required|string',
            'end_time' => 'nullable|string',
            'venue' => 'sometimes|required|string|max:255',
            'google_maps_url' => 'nullable|url|max:500',
            'cover_image_url' => 'nullable|string|max:500',
            'status' => 'sometimes|required|string|in:draft,published,completed,archived',
            'access_pin' => 'nullable|string|min:4|max:20',
            'theme_config' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $event->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Event updated successfully',
            'data' => $event
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $event = Event::where('id', $id)->where('user_id', $request->user()->id)->first();

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found'
            ], 404);
        }

        $event->delete();

        return response()->json([
            'success' => true,
            'message' => 'Event deleted successfully'
        ]);
    }

    public function duplicate(Request $request, $id)
    {
        $event = Event::where('id', $id)->where('user_id', $request->user()->id)->first();

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found'
            ], 404);
        }

        $clone = $event->replicate();
        $clone->title = $event->title . ' (Copy)';
        $clone->status = 'draft';
        $clone->save();

        return response()->json([
            'success' => true,
            'message' => 'Event duplicated successfully',
            'data' => $clone
        ], 201);
    }
}
