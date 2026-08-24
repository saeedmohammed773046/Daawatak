<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Guest;
use App\Models\QrCode;
use App\Services\InvitationBuilderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class InvitationController extends Controller
{
    public function __construct(
        private readonly InvitationBuilderService $builder
    ) {}

    /**
     * Preview the raw HTML of an invitation (useful for design iteration).
     * GET /api/v1/invitations/{guest}/preview
     */
    public function preview(Guest $guest): \Illuminate\Http\Response
    {
        $qrCode = $guest->qrCode;

        if (! $qrCode) {
            return response('QR code not generated yet for this guest.', 404);
        }

        // Build a fresh plain token for preview only (not stored, not scannable)
        $html = $this->builder->buildInvitationHtml(
            $guest,
            $qrCode->plain_token ?? 'PREVIEW_TOKEN',
            $guest->event->theme_config ?? []
        );

        return response($html, 200, ['Content-Type' => 'text/html']);
    }

    /**
     * Generate PNG invitation and return its URL.
     * POST /api/v1/invitations/{guest}/generate
     */
    public function generate(Request $request, Guest $guest): \Illuminate\Http\JsonResponse
    {
        $qrCode = $guest->qrCode;

        if (! $qrCode) {
            // Create a new QR record for the guest on-the-fly
            $plainToken = Str::random(32);
            $hashedToken = hash('sha256', $plainToken);

            $qrCode = QrCode::create([
                'id'          => Str::uuid(),
                'guest_id'    => $guest->id,
                'event_id'    => $guest->event_id,
                'token_hash'  => $hashedToken,
                'plain_token' => $plainToken,  // stored temporarily for generation; cleared after
                'expires_at'  => $guest->event->event_date
                    ? \Carbon\Carbon::parse($guest->event->event_date)->addDay()
                    : now()->addDays(30),
                'status'      => 'active',
            ]);
        }

        $format = $request->query('format', 'png'); // 'png' or 'pdf'

        try {
            $url = match ($format) {
                'pdf'   => $this->builder->renderInvitationPdf($guest, $qrCode->plain_token),
                default => $this->builder->renderInvitationPng($guest, $qrCode->plain_token),
            };

            return response()->json([
                'success' => true,
                'url'     => $url,
                'guest_id' => $guest->id,
                'format'  => $format,
            ]);
        } catch (\Throwable $e) {
            // Browsershot not available (Chromium missing) — return HTML fallback URL
            return response()->json([
                'success' => false,
                'message' => 'Browsershot unavailable: ' . $e->getMessage(),
                'fallback_preview' => route('invitations.preview', $guest),
            ], 503);
        }
    }

    /**
     * Bulk-generate invitations for all guests in an event (queued job).
     * POST /api/v1/invitations/bulk/{event}
     */
    public function bulkGenerate(\App\Models\Event $event): \Illuminate\Http\JsonResponse
    {
        $count = $event->guests()->count();

        // Dispatch async job for each guest
        $event->guests()->each(function (Guest $guest) {
            \App\Jobs\GenerateInvitationJob::dispatch($guest);
        });

        return response()->json([
            'success' => true,
            'message' => "تم جدولة إنشاء {$count} دعوة في قائمة المعالجة",
            'queued_count' => $count,
        ]);
    }

    /**
     * Download an already-generated invitation file.
     * GET /api/v1/invitations/{guest}/download
     */
    public function download(Request $request, Guest $guest): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $format   = $request->query('format', 'png');
        $path     = storage_path('app/public/invitations/' . $guest->event_id . '/' . $guest->id . '.' . $format);

        abort_unless(file_exists($path), 404, 'الملف غير موجود، يرجى إنشاء الدعوة أولاً.');

        return response()->download($path, "invitation_{$guest->id}.{$format}");
    }
}
