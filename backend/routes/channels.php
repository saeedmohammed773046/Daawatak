<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (string) $user->id === (string) $id;
});

Broadcast::channel('event.{eventId}', function ($user, $eventId) {
    $event = \App\Models\Event::find($eventId);
    if (!$event) {
        return false;
    }
    
    // Check if event owner
    if ($event->user_id === $user->id) {
        return true;
    }

    // Check if assigned receptionist
    return \App\Models\Receptionist::where('event_id', $eventId)
        ->where('user_id', $user->id)
        ->exists();
});
