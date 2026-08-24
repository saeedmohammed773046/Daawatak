<?php

namespace App\Services;

use App\Models\Guest;
use App\Models\QrCode;
use chillerlan\QRCode\QRCode as QRCodeGenerator;
use chillerlan\QRCode\QROptions;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class InvitationBuilderService
{
    /**
     * Generate the raw QR PNG (base64) for a plain token.
     */
    public function generateQrPng(string $plainToken): string
    {
        $options = new QROptions([
            'version'    => 7,
            'outputType' => 'png',
            'scale'      => 8,
            'imageBase64' => true,
        ]);

        return (new QRCodeGenerator($options))->render($plainToken);
    }

    /**
     * Render the invitation HTML for one guest.
     *
     * Returns the full HTML string ready to feed to Browsershot / headless Chrome.
     */
    public function buildInvitationHtml(Guest $guest, string $plainToken, array $themeConfig = []): string
    {
        $guestName   = e($guest->name);
        $eventTitle  = e($guest->event->title ?? '');
        $eventDate   = optional($guest->event->event_date)->format('Y/m/d') ?? '';
        $venue       = e($guest->event->venue ?? '');
        $primaryColor = $themeConfig['primary_color'] ?? '#D4AF37';
        $secondaryColor = $themeConfig['secondary_color'] ?? '#1A2E40';
        $fontFamily = $themeConfig['font_family'] ?? 'Cairo';
        $welcomeText = e($themeConfig['welcome_text'] ?? 'نتشرف بدعوتكم');

        $qrBase64 = $this->generateQrPng($plainToken);

        return <<<HTML
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family={$fontFamily}:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px;
    height: 800px;
    background: linear-gradient(135deg, {$secondaryColor} 0%, #0B0E14 100%);
    font-family: '{$fontFamily}', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .card {
    width: 1140px;
    height: 740px;
    border-radius: 32px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    backdrop-filter: blur(20px);
    display: flex;
    align-items: stretch;
    overflow: hidden;
    box-shadow: 0 40px 80px rgba(0,0,0,0.5);
  }
  .left-panel {
    flex: 1;
    padding: 64px 56px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 24px;
    border-left: 1px solid rgba(255,255,255,0.05);
  }
  .welcome-label {
    color: {$primaryColor};
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .event-title {
    color: #FFFFFF;
    font-size: 48px;
    font-weight: 800;
    line-height: 1.2;
  }
  .divider {
    width: 64px;
    height: 3px;
    background: {$primaryColor};
    border-radius: 2px;
  }
  .welcome-text {
    color: rgba(255,255,255,0.7);
    font-size: 22px;
    line-height: 1.7;
  }
  .guest-name {
    color: {$primaryColor};
    font-size: 36px;
    font-weight: 700;
    padding: 16px 24px;
    border: 1.5px solid {$primaryColor}40;
    border-radius: 16px;
    background: {$primaryColor}0D;
    display: inline-block;
  }
  .meta {
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: rgba(255,255,255,0.5);
    font-size: 16px;
  }
  .meta span { font-weight: 600; color: rgba(255,255,255,0.8); }
  .right-panel {
    width: 320px;
    background: rgba(255,255,255,0.03);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
    padding: 48px 32px;
  }
  .qr-wrapper {
    background: #FFFFFF;
    border-radius: 20px;
    padding: 16px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  }
  .qr-wrapper img {
    width: 200px;
    height: 200px;
    display: block;
  }
  .qr-label {
    color: rgba(255,255,255,0.4);
    font-size: 13px;
    text-align: center;
    line-height: 1.6;
  }
  .brand {
    color: {$primaryColor};
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 1px;
    margin-top: auto;
  }
</style>
</head>
<body>
<div class="card">
  <div class="left-panel">
    <div class="welcome-label">دعوة خاصة</div>
    <div class="event-title">{$eventTitle}</div>
    <div class="divider"></div>
    <div class="welcome-text">{$welcomeText}</div>
    <div class="guest-name">{$guestName}</div>
    <div class="meta">
      <div>📅 &nbsp;<span>{$eventDate}</span></div>
      <div>📍 &nbsp;<span>{$venue}</span></div>
    </div>
  </div>
  <div class="right-panel">
    <div class="qr-wrapper">
      <img src="{$qrBase64}" alt="QR Code" />
    </div>
    <div class="qr-label">
      امسح الرمز عند المدخل<br>للتحقق من الدعوة
    </div>
    <div class="brand">دعوتك ✦</div>
  </div>
</div>
</body>
</html>
HTML;
    }

    /**
     * Render one guest's invitation using headless Chrome (Browsershot).
     * Returns the storage path to the saved PNG file.
     *
     * Requires Node.js + Chromium on the server.
     */
    public function renderInvitationPng(Guest $guest, string $plainToken): string
    {
        $html = $this->buildInvitationHtml($guest, $plainToken, $guest->event->theme_config ?? []);
        $filename = 'invitations/' . $guest->event_id . '/' . $guest->id . '.png';

        // Write temp HTML file for Browsershot to render
        $tmpHtml = sys_get_temp_dir() . '/' . Str::uuid() . '.html';
        file_put_contents($tmpHtml, $html);

        // Render via Spatie Browsershot (requires Chromium)
        \Spatie\Browsershot\Browsershot::html($html)
            ->windowSize(1200, 800)
            ->deviceScaleFactor(2)         // Retina / high-DPI output
            ->disableJavascript(false)
            ->waitUntilNetworkIdle()
            ->save(storage_path('app/public/' . $filename));

        @unlink($tmpHtml);

        // Update guest invitation_status
        $guest->update(['invitation_status' => 'generated']);

        return Storage::url($filename);
    }

    /**
     * Render invitation as PDF (single page, A5 landscape).
     */
    public function renderInvitationPdf(Guest $guest, string $plainToken): string
    {
        $html = $this->buildInvitationHtml($guest, $plainToken, $guest->event->theme_config ?? []);
        $filename = 'invitations/' . $guest->event_id . '/' . $guest->id . '.pdf';

        \Spatie\Browsershot\Browsershot::html($html)
            ->windowSize(1200, 800)
            ->deviceScaleFactor(2)
            ->waitUntilNetworkIdle()
            ->format('A4')
            ->landscape()
            ->savePdf(storage_path('app/public/' . $filename));

        $guest->update(['invitation_status' => 'generated']);

        return Storage::url($filename);
    }
}
