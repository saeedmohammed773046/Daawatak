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
use App\Models\InvitationTemplate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ExhaustiveSystemAuditTest extends TestCase
{
    protected static $tokens = [];
    protected static $createdIds = [];

    protected function setUp(): void
    {
        parent::setUp();
        if (!User::where('email', 'admin@gmail.com')->exists()) {
            $this->seed(\Database\Seeders\DatabaseSeeder::class);
        }
    }

    public function test_01_database_engine_is_postgresql()
    {
        $driver = DB::connection()->getDriverName();
        $this->assertEquals('pgsql', $driver, 'Database engine must be PostgreSQL');
        
        $tableCount = count(DB::select("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"));
        $this->assertGreaterThanOrEqual(10, $tableCount);
    }

    public function test_02_auth_and_roles_endpoints()
    {
        // 1. Admin Login
        $adminRes = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@gmail.com',
            'password' => '123456789',
        ]);
        $adminRes->assertStatus(200)->assertJsonPath('success', true);
        self::$tokens['admin'] = $adminRes->json('data.access_token');
        $this->assertNotEmpty(self::$tokens['admin']);

        // 2. Event Owner Login
        $ownerRes = $this->postJson('/api/v1/auth/login', [
            'email' => 'owner@daawatak.com',
            'password' => 'password123',
        ]);
        $ownerRes->assertStatus(200);
        self::$tokens['owner'] = $ownerRes->json('data.access_token');

        // 3. Receptionist Login
        $recRes = $this->postJson('/api/v1/auth/login', [
            'email' => 'receptionist@daawatak.com',
            'password' => 'password123',
        ]);
        $recRes->assertStatus(200);
        self::$tokens['receptionist'] = $recRes->json('data.access_token');

        // 4. Me endpoint
        $meRes = $this->withHeader('Authorization', 'Bearer ' . self::$tokens['owner'])
            ->getJson('/api/v1/auth/me');
        $meRes->assertStatus(200)->assertJsonPath('data.email', 'owner@daawatak.com');

        // 5. Register new account & OTP flow
        $uniqueEmail = 'verify_' . time() . '@test.com';
        $regRes = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test Auto User',
            'email' => $uniqueEmail,
            'phone' => '+9665' . rand(10000000, 99999999),
            'password' => 'password123',
        ]);
        $regRes->assertStatus(201);
        $otp = $regRes->json('data.otp_preview');

        // Verify OTP
        $otpRes = $this->postJson('/api/v1/auth/verify-otp', [
            'email' => $uniqueEmail,
            'otp' => $otp,
        ]);
        $otpRes->assertStatus(200)->assertJsonPath('success', true);

        // Forgot password & reset
        $forgotRes = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => $uniqueEmail,
        ]);
        $forgotRes->assertStatus(200);
        $resetOtp = $forgotRes->json('data.otp_preview');

        $resetRes = $this->postJson('/api/v1/auth/reset-password', [
            'email' => $uniqueEmail,
            'otp' => $resetOtp,
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);
        $resetRes->assertStatus(200);
    }

    public function test_03_events_crud_and_validation()
    {
        $token = self::$tokens['owner'];

        // 1. Create Event
        $createRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/events', [
                'title' => 'مؤتمر التقنية والذكاء الاصطناعي 2026',
                'description' => 'مؤتمر تقني شامل',
                'category' => 'conference',
                'event_date' => Carbon::now()->addDays(15)->toDateString(),
                'start_time' => '10:00:00',
                'venue' => 'فندق الفورسيزونز الرياض',
            ]);
        $createRes->assertStatus(201)->assertJsonPath('success', true);
        $eventId = $createRes->json('data.id');
        self::$createdIds['event_id'] = $eventId;

        // 2. List Events
        $listRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/events');
        $listRes->assertStatus(200)->assertJsonPath('success', true);

        // 3. Get Single Event
        $getRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/v1/events/{$eventId}");
        $getRes->assertStatus(200)->assertJsonPath('data.title', 'مؤتمر التقنية والذكاء الاصطناعي 2026');

        // 4. Update Event
        $updateRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/v1/events/{$eventId}", [
                'title' => 'مؤتمر التقنية والابتكار 2026 (محدث)',
            ]);
        $updateRes->assertStatus(200);

        // Verify in PostgreSQL
        $this->assertDatabaseHas('events', [
            'id' => $eventId,
            'title' => 'مؤتمر التقنية والابتكار 2026 (محدث)',
        ]);
    }

    public function test_04_guests_and_qr_system()
    {
        $token = self::$tokens['owner'];
        $eventId = self::$createdIds['event_id'];

        // 1. Create Guest
        $guestRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/v1/events/{$eventId}/guests", [
                'name' => 'الدكتور فهد السبيعي',
                'phone' => '+966512345678',
                'email' => 'fahad@ai-summit.sa',
                'companions_count' => 2,
                'category' => 'vip',
            ]);
        $guestRes->assertStatus(201);
        $guestId = $guestRes->json('data.id');
        $qrToken = $guestRes->json('data.plain_token');
        self::$createdIds['guest_id'] = $guestId;
        self::$createdIds['qr_token'] = $qrToken;

        // 2. Verify QR generated in DB
        $this->assertDatabaseHas('qr_codes', [
            'guest_id' => $guestId,
            'event_id' => $eventId,
        ]);

        // 3. List Guests
        $listGuests = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/v1/events/{$eventId}/guests");
        $listGuests->assertStatus(200);

        // 4. Update Guest
        $updateGuest = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/v1/guests/{$guestId}", [
                'name' => 'الدكتور فهد السبيعي (شرفي)',
            ]);
        $updateGuest->assertStatus(200);
    }

    public function test_05_reception_and_qr_verification_states()
    {
        $recToken = self::$tokens['receptionist'];
        $ownerToken = self::$tokens['owner'];
        $eventId = self::$createdIds['event_id'];
        $qrToken = self::$createdIds['qr_token'];

        // Assign receptionist to event
        $this->withHeader('Authorization', "Bearer {$ownerToken}")
            ->postJson("/api/v1/events/{$eventId}/receptionists", [
                'email' => 'receptionist@daawatak.com',
            ]);

        // 1. Receptionist Lists Events
        $recEvents = $this->withHeader('Authorization', "Bearer {$recToken}")
            ->getJson('/api/v1/reception/events');
        $recEvents->assertStatus(200);

        // 2. PIN Verification
        $pinRes = $this->withHeader('Authorization', "Bearer {$recToken}")
            ->postJson('/api/v1/reception/verify-pin', [
                'event_id' => $eventId,
                'pin' => '123456',
            ]);
        $pinRes->assertStatus(200)->assertJsonPath('success', true);

        // 3. First Scan: ACCEPTED
        $scan1 = $this->withHeader('Authorization', "Bearer {$recToken}")
            ->postJson('/api/v1/reception/verify', [
                'event_id' => $eventId,
                'token' => $qrToken,
                'device_info' => 'Automated Terminal 1',
            ]);
        $scan1->assertStatus(200)->assertJsonPath('data.verification_result', 'ACCEPTED');

        // Check DB attendance log
        $this->assertDatabaseHas('attendance_logs', [
            'event_id' => $eventId,
            'status' => 'ACCEPTED',
        ]);

        // 4. Second Scan: ALREADY_USED
        $scan2 = $this->withHeader('Authorization', "Bearer {$recToken}")
            ->postJson('/api/v1/reception/verify', [
                'event_id' => $eventId,
                'token' => $qrToken,
                'device_info' => 'Automated Terminal 1',
            ]);
        $scan2->assertStatus(200)->assertJsonPath('data.verification_result', 'ALREADY_USED');

        // 5. Invalid Scan: INVALID
        $scanInvalid = $this->withHeader('Authorization', "Bearer {$recToken}")
            ->postJson('/api/v1/reception/verify', [
                'event_id' => $eventId,
                'token' => 'invalid_random_token_123',
            ]);
        $scanInvalid->assertStatus(200)->assertJsonPath('data.verification_result', 'INVALID');
    }

    public function test_06_analytics_and_reports()
    {
        $token = self::$tokens['owner'];
        $eventId = self::$createdIds['event_id'];

        // 1. Analytics stats
        $analytics = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/v1/events/{$eventId}/analytics");
        $analytics->assertStatus(200)
            ->assertJsonPath('data.total_guests', 1)
            ->assertJsonPath('data.attended_guests', 1);

        // 2. CSV Guests Export
        $csvGuests = $this->withHeader('Authorization', "Bearer {$token}")
            ->get("/api/v1/reports/events/{$eventId}/guests/csv");
        $csvGuests->assertStatus(200);
        $csvGuests->assertHeader('Content-Type', 'text/csv; charset=UTF-8');

        // 3. CSV Attendance Export
        $csvAttendance = $this->withHeader('Authorization', "Bearer {$token}")
            ->get("/api/v1/reports/events/{$eventId}/attendance/csv");
        $csvAttendance->assertStatus(200);
    }

    public function test_07_admin_dashboard_and_controls()
    {
        $adminToken = self::$tokens['admin'];

        // 1. Admin Stats
        $stats = $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->getJson('/api/v1/admin/dashboard/stats');
        $stats->assertStatus(200)->assertJsonPath('success', true);

        // 2. Admin Users List
        $users = $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->getJson('/api/v1/admin/users');
        $users->assertStatus(200);

        // 3. Admin Plans List & Create
        $plans = $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->getJson('/api/v1/admin/plans');
        $plans->assertStatus(200);

        $newPlan = $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->postJson('/api/v1/admin/plans', [
                'name' => 'باقة الشركات VIP',
                'description' => 'باقة مخصصة للمؤتمرات الضخمة',
                'price' => 599.00,
                'max_events' => 50,
                'max_guests_per_event' => 5000,
                'max_receptionists' => 20,
                'validity_days' => 365,
            ]);
        $newPlan->assertStatus(201);
        $planId = $newPlan->json('data.id');

        // 4. Admin Subscriptions
        $subs = $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->getJson('/api/v1/admin/subscriptions');
        $subs->assertStatus(200);

        // 5. Admin Payments
        $payments = $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->getJson('/api/v1/admin/payments');
        $payments->assertStatus(200);

        // 6. Admin Audit Logs
        $logs = $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->getJson('/api/v1/admin/audit-logs');
        $logs->assertStatus(200);
    }

    public function test_08_authorization_boundaries()
    {
        $ownerToken = self::$tokens['owner'];
        $recToken = self::$tokens['receptionist'];

        // 1. Event Owner CANNOT access Super Admin Dashboard Stats
        $forbiddenAdminStats = $this->withHeader('Authorization', "Bearer {$ownerToken}")
            ->getJson('/api/v1/admin/dashboard/stats');
        $forbiddenAdminStats->assertStatus(403);

        // 2. Receptionist CANNOT access Super Admin Plans
        $forbiddenPlans = $this->withHeader('Authorization', "Bearer {$recToken}")
            ->getJson('/api/v1/admin/plans');
        $forbiddenPlans->assertStatus(403);
    }

    public function test_09_unauthenticated_and_invalid_tokens_rejected()
    {
        // 1. Unauthenticated requests rejected
        $unauth = $this->getJson('/api/v1/events');
        $unauth->assertStatus(401);

        // 2. Invalid Token rejected
        $invalidToken = $this->withHeader('Authorization', 'Bearer 9999999999invalidtoken')
            ->getJson('/api/v1/events');
        $invalidToken->assertStatus(401);
    }
}
