<?php

namespace App\Jobs;

use App\Models\Guest;
use App\Models\QrCode;
use App\Services\InvitationBuilderService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class GenerateInvitationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * Create a new job instance.
     */
    public function __construct(
        protected Guest $guest
    ) {}

    /**
     * Execute the job.
     */
    public function handle(InvitationBuilderService $builderService): void
    {
        $qrCode = $this->guest->qrCode;

        if (!$qrCode) {
            $plainToken = Str::random(32);
            $hashedToken = hash('sha256', $plainToken);

            $qrCode = QrCode::create([
                'id'          => Str::uuid(),
                'guest_id'    => $this->guest->id,
                'event_id'    => $this->guest->event_id,
                'token_hash'  => $hashedToken,
                'plain_token' => $plainToken,
                'expires_at'  => $this->guest->event->event_date
                    ? \Carbon\Carbon::parse($this->guest->event->event_date)->addDay()
                    : now()->addDays(30),
                'status'      => 'active',
            ]);
        }

        // Render both PNG and PDF for production quality
        try {
            $builderService->renderInvitationPng($this->guest, $qrCode->plain_token);
            $builderService->renderInvitationPdf($this->guest, $qrCode->plain_token);
        } catch (\Throwable $e) {
            // Log failure or let queue worker handle retries
            logger()->error("Failed to generate invitation for guest {$this->guest->id}: " . $e->getMessage());
            throw $e;
        }
    }
}
