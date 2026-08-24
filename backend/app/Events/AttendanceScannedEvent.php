<?php

namespace App\Events;

use App\Models\Guest;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AttendanceScannedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public string $eventId,
        public string $status, // ACCEPTED, ALREADY_USED, EXPIRED, INVALID
        public array $payload = []
    ) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        // Public or private channel based on security requirements.
        // We broadcast to a private channel matching the event id.
        return [
            new PrivateChannel('event.' . $this->eventId),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'attendance.scanned';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'id'         => (string) \Illuminate\Support\Str::uuid(),
            'eventId'    => $this->eventId,
            'event_id'   => $this->eventId,
            'status'     => $this->status,
            'guestId'    => $this->payload['guest_id'] ?? null,
            'guestName'  => $this->payload['guest_name'] ?? 'ضيف',
            'gate'       => $this->payload['gate'] ?? 'البوابة الرئيسية',
            'companions' => $this->payload['companions_count'] ?? 0,
            'time'       => now()->toIso8601String(),
            'timestamp'  => now()->toIso8601String(),
            'device'     => $this->payload['device_info'] ?? 'Unknown Device',
        ];
    }
}
