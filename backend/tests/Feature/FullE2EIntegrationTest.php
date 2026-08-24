<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Event;
use App\Models\Guest;
use App\Models\QrCode;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\AttendanceLog;
use Illuminate\Support\Facades\Hash;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

class FullE2EIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_full_e2e_integration_flow()
    {
        // 1. Super Admin Authentication & Dashboard
        $admin = User::firstOrCreate(
            ['email' => 'admin_test@daawatak.com'],
            [
                'name' => 'Super Admin Test',
                'phone' => '+966500000099',
                'role' => 'super_admin',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );

        $adminLogin = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin_test@daawatak.com',
            'password' => 'password123',
        ]);

        $adminLogin->assertStatus(200);
        $adminToken = $adminLogin->json('data.access_token');
        $this->assertNotEmpty($adminToken);

        // Admin checks stats
        $statsRes = $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->getJson('/api/v1/admin/dashboard/stats');
        $statsRes->assertStatus(200)
            ->assertJsonPath('success', true);

        // 2. Event Owner Registration & Login
        $ownerEmail = 'owner_e2e_' . time() . '@daawatak.com';
        $regRes = $this->postJson('/api/v1/auth/register', [
            'name' => 'E2E Owner',
            'email' => $ownerEmail,
            'phone' => '+966555555555',
            'password' => 'password123',
        ]);
        $regRes->assertStatus(201);
        $otp = $regRes->json('data.otp_preview');

        // Verify OTP
        $verifyRes = $this->postJson('/api/v1/auth/verify-otp', [
            'email' => $ownerEmail,
            'otp' => $otp,
        ]);
        $verifyRes->assertStatus(200);
        $ownerToken = $verifyRes->json('data.access_token');
        $ownerUser = User::where('email', $ownerEmail)->first();

        // Assign plan to owner
        $plan = Plan::first() ?? Plan::create([
            'name' => 'Premium Plan',
            'price' => 49.00,
            'max_events' => 10,
            'max_guests_per_event' => 500,
            'max_receptionists' => 5,
            'validity_days' => 90,
        ]);

        Subscription::create([
            'user_id' => $ownerUser->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => now()->addDays(90),
        ]);

        // 3. Owner creates Event
        $createEventRes = $this->withHeader('Authorization', "Bearer {$ownerToken}")
            ->postJson('/api/v1/events', [
                'title' => 'حفل تخرج الدفعة 2026',
                'description' => 'حفل تخرج الدفعة السنوية',
                'category' => 'graduation',
                'event_date' => Carbon::now()->addDays(10)->toDateString(),
                'start_time' => '19:00:00',
                'venue' => 'مركز المؤتمرات بالرياض',
            ]);

        $createEventRes->assertStatus(201)
            ->assertJsonPath('success', true);
        $eventId = $createEventRes->json('data.id');
        $this->assertNotEmpty($eventId);

        // 4. Owner adds a Guest (QR code generated automatically)
        $guestRes = $this->withHeader('Authorization', "Bearer {$ownerToken}")
            ->postJson("/api/v1/events/{$eventId}/guests", [
                'name' => 'المهندس عبد الله التميمي',
                'phone' => '+966599999999',
                'email' => 'abdullah@example.com',
                'companions_count' => 1,
                'notes' => 'ضيف شرف',
            ]);

        $guestRes->assertStatus(201);
        $guestId = $guestRes->json('data.id');
        $plainToken = $guestRes->json('data.plain_token');
        $this->assertNotEmpty($plainToken);

        // 5. Receptionist setup & PIN verification
        $receptionist = User::firstOrCreate(
            ['email' => 'reception_e2e@daawatak.com'],
            [
                'name' => 'E2E Receptionist',
                'phone' => '+966500000088',
                'role' => 'receptionist',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );

        // Assign receptionist to event
        $this->withHeader('Authorization', "Bearer {$ownerToken}")
            ->postJson("/api/v1/events/{$eventId}/receptionists", [
                'email' => 'reception_e2e@daawatak.com',
            ]);

        $recLogin = $this->postJson('/api/v1/auth/login', [
            'email' => 'reception_e2e@daawatak.com',
            'password' => 'password123',
        ]);
        $recToken = $recLogin->json('data.access_token');

        // Receptionist verifies PIN
        $pinRes = $this->withHeader('Authorization', "Bearer {$recToken}")
            ->postJson('/api/v1/reception/verify-pin', [
                'event_id' => $eventId,
                'pin' => '123456',
            ]);
        $pinRes->assertStatus(200);

        // 6. QR Code Verification (Scan 1: ACCEPTED)
        $scan1 = $this->withHeader('Authorization', "Bearer {$recToken}")
            ->postJson('/api/v1/reception/verify', [
                'event_id' => $eventId,
                'token' => $plainToken,
                'device_info' => 'Android Scanner Terminal 1',
            ]);

        $scan1->assertStatus(200)
            ->assertJsonPath('data.verification_result', 'ACCEPTED');

        // Verify Database Attendance Log
        $this->assertDatabaseHas('attendance_logs', [
            'event_id' => $eventId,
            'guest_id' => $guestId,
            'status' => 'ACCEPTED',
        ]);

        // Verify Guest Attendance Status in DB
        $this->assertDatabaseHas('guests', [
            'id' => $guestId,
            'attendance_status' => 'present',
        ]);

        // 7. QR Code Verification (Scan 2: ALREADY_USED)
        $scan2 = $this->withHeader('Authorization', "Bearer {$recToken}")
            ->postJson('/api/v1/reception/verify', [
                'event_id' => $eventId,
                'token' => $plainToken,
                'device_info' => 'Android Scanner Terminal 1',
            ]);

        $scan2->assertStatus(200)
            ->assertJsonPath('data.verification_result', 'ALREADY_USED');

        // 8. Invalid Token Scan (INVALID)
        $scanInvalid = $this->withHeader('Authorization', "Bearer {$recToken}")
            ->postJson('/api/v1/reception/verify', [
                'event_id' => $eventId,
                'token' => 'invalid_fake_qr_code_token',
            ]);

        $scanInvalid->assertStatus(200)
            ->assertJsonPath('data.verification_result', 'INVALID');

        // 9. Analytics verification
        $analyticsRes = $this->withHeader('Authorization', "Bearer {$ownerToken}")
            ->getJson("/api/v1/events/{$eventId}/analytics");

        $analyticsRes->assertStatus(200)
            ->assertJsonPath('data.total_guests', 1)
            ->assertJsonPath('data.checked_in', 1);

        // 10. Reports Export verification
        $csvRes = $this->withHeader('Authorization', "Bearer {$ownerToken}")
            ->get("/api/v1/reports/events/{$eventId}/guests/csv");

        $csvRes->assertStatus(200);
        $csvRes->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    }
}
