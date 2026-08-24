<?php

namespace App\Services;

use App\Models\Event;
use App\Models\Guest;
use App\Models\Receptionist;
use App\Models\Subscription;
use App\Models\User;

class SubscriptionLimitService
{
    public static function canCreateEvent(User $user): array
    {
        $subscription = Subscription::with('plan')
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->where('ends_at', '>=', now())
            ->first();

        // If no subscription active, check default free limits (max 2 events)
        $maxEvents = $subscription ? $subscription->plan->max_events : 2;
        $currentEventsCount = Event::where('user_id', $user->id)->count();

        if ($currentEventsCount >= $maxEvents) {
            return [
                'allowed' => false,
                'message' => "لقد بلغت الحد الأقصى للمناسبات المسموح بها في خطتك الحالية ({$maxEvents} مناسبات). يرجى ترقية اشتراكك للمتابعة.",
            ];
        }

        return ['allowed' => true];
    }

    public static function canAddGuest(User $user, string $eventId, int $newGuestsCount = 1): array
    {
        $subscription = Subscription::with('plan')
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->where('ends_at', '>=', now())
            ->first();

        $maxGuests = $subscription ? $subscription->plan->max_guests_per_event : 100;
        $currentGuestsCount = Guest::where('event_id', $eventId)->count();

        if (($currentGuestsCount + $newGuestsCount) > $maxGuests) {
            return [
                'allowed' => false,
                'message' => "إضافة هؤلاء المدعوين تتجاوز الحد الأقصى المسموح به لخيار خطتك الحالية ({$maxGuests} ضيف للمناسبة). يرجى ترقية اشتراكك.",
            ];
        }

        return ['allowed' => true];
    }

    public static function canAddReceptionist(User $user, string $eventId): array
    {
        $subscription = Subscription::with('plan')
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->where('ends_at', '>=', now())
            ->first();

        $maxReceptionists = $subscription ? $subscription->plan->max_receptionists : 2;
        $currentCount = Receptionist::where('event_id', $eventId)->count();

        if ($currentCount >= $maxReceptionists) {
            return [
                'allowed' => false,
                'message' => "تجاوزت عدد حسابات موظفي الاستقبال المسموح بها لهذه المناسبة ({$maxReceptionists} موظف).",
            ];
        }

        return ['allowed' => true];
    }
}
