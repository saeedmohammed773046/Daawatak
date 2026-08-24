<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Guest;
use App\Models\QrCode;
use App\Models\Receptionist;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DaawatakApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test login functionality.
     */
    public function test_user_can_login_with_valid_credentials()
    {
        $user = User::create([
            'name' => 'Fahad Al-Otaibi',
            'email' => 'owner@daawatak.com',
            'phone' => '+966500000002',
            'role' => 'event_owner',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'owner@daawatak.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'access_token',
                    'token_type',
                    'user' => ['id', 'name', 'email', 'role']
                ]
            ]);
    }

    /**
     * Test verification with valid token.
     */
    public function test_receptionist_can_verify_valid_qr_token()
    {
        $owner = User::create([
            'name' => 'Owner',
            'email' => 'owner@example.com',
            'role' => 'event_owner',
            'password' => Hash::make('password123'),
        ]);

        $receptionist = User::create([
            'name' => 'Receptionist Staff',
            'email' => 'staff@example.com',
            'role' => 'receptionist',
            'password' => Hash::make('password123'),
        ]);

        $event = Event::create([
            'user_id' => $owner->id,
            'title' => 'Sample Wedding Event',
            'category' => 'wedding',
            'event_date' => now()->addDays(5)->toDateString(),
            'start_time' => '20:00:00',
            'venue' => 'Main Hall',
            'status' => 'published',
        ]);

        Receptionist::create([
            'event_id' => $event->id,
            'user_id' => $receptionist->id,
        ]);

        $guest = Guest::create([
            'event_id' => $event->id,
            'name' => 'Al-Harbi Guest',
            'phone' => '+966512345678',
            'companions_count' => 1,
            'invitation_status' => 'pending',
            'attendance_status' => 'absent',
        ]);

        $rawToken = 'jwt_secure_test_token_123';
        $tokenHash = hash('sha256', $rawToken);

        QrCode::create([
            'guest_id' => $guest->id,
            'event_id' => $event->id,
            'token_hash' => $tokenHash,
            'status' => 'active',
        ]);

        $response = $this->actingAs($receptionist, 'sanctum')
            ->postJson('/api/v1/reception/verify', [
                'event_id' => $event->id,
                'token' => $rawToken,
                'device_info' => 'Android Terminal Test',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'verification_result' => 'ACCEPTED'
                ]
            ]);

        $this->assertDatabaseHas('guests', [
            'id' => $guest->id,
            'attendance_status' => 'present'
        ]);

        $this->assertDatabaseHas('attendance_logs', [
            'event_id' => $event->id,
            'guest_id' => $guest->id,
            'status' => 'ACCEPTED'
        ]);
    }

    /**
     * Test verification with invalid token.
     */
    public function test_receptionist_receives_invalid_status_for_bad_token()
    {
        $receptionist = User::create([
            'name' => 'Receptionist Staff',
            'email' => 'staff@example.com',
            'role' => 'receptionist',
            'password' => Hash::make('password123'),
        ]);

        $event = Event::create([
            'user_id' => $receptionist->id,
            'title' => 'Sample Wedding Event',
            'category' => 'wedding',
            'event_date' => now()->addDays(5)->toDateString(),
            'start_time' => '20:00:00',
            'venue' => 'Main Hall',
            'status' => 'published',
        ]);

        Receptionist::create([
            'event_id' => $event->id,
            'user_id' => $receptionist->id,
        ]);

        $response = $this->actingAs($receptionist, 'sanctum')
            ->postJson('/api/v1/reception/verify', [
                'event_id' => $event->id,
                'token' => 'completely_invalid_token',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'verification_result' => 'INVALID'
                ]
            ]);
            
        $response->assertJsonMissing(['guest_name', 'phone', 'email', 'companions_count']);
    }

    /**
     * Test invitation preview and generation.
     */
    public function test_user_can_preview_and_generate_invitations()
    {
        $owner = User::create([
            'name' => 'Owner',
            'email' => 'owner@example.com',
            'role' => 'event_owner',
            'password' => Hash::make('password123'),
        ]);

        $event = Event::create([
            'user_id' => $owner->id,
            'title' => 'Sample Wedding Event',
            'category' => 'wedding',
            'event_date' => now()->addDays(5)->toDateString(),
            'start_time' => '20:00:00',
            'venue' => 'Main Hall',
            'status' => 'published',
        ]);

        $guest = Guest::create([
            'event_id' => $event->id,
            'name' => 'Al-Harbi Guest',
            'phone' => '+966512345678',
            'companions_count' => 1,
            'invitation_status' => 'pending',
            'attendance_status' => 'absent',
        ]);

        $rawToken = 'jwt_secure_test_token_123';
        $tokenHash = hash('sha256', $rawToken);

        QrCode::create([
            'guest_id' => $guest->id,
            'event_id' => $event->id,
            'token_hash' => $tokenHash,
            'plain_token' => $rawToken,
            'status' => 'active',
        ]);

        // Preview Route
        $responsePreview = $this->actingAs($owner, 'sanctum')
            ->get("/api/v1/invitations/{$guest->id}/preview");

        $responsePreview->assertStatus(200);
        $responsePreview->assertHeader('Content-Type', 'text/html; charset=UTF-8');
        $this->assertStringContainsString('Al-Harbi Guest', $responsePreview->getContent());
        $this->assertStringContainsString('Sample Wedding Event', $responsePreview->getContent());

        // Generate Route (Will hit fallback if Chromium is not in testing env)
        $responseGenerate = $this->actingAs($owner, 'sanctum')
            ->postJson("/api/v1/invitations/{$guest->id}/generate");

        // Should return 200 (if success) or 503 (if browsershot/chromium not installed)
        $this->assertTrue(in_array($responseGenerate->getStatusCode(), [200, 503]));
    }

    /**
     * Test receptionist credentials management.
     */
    public function test_user_can_manage_receptionists()
    {
        $owner = User::create([
            'name' => 'Owner',
            'email' => 'owner@example.com',
            'role' => 'event_owner',
            'password' => Hash::make('password123'),
        ]);

        $event = Event::create([
            'user_id' => $owner->id,
            'title' => 'Sample Engagement Event',
            'category' => 'engagement',
            'event_date' => now()->addDays(10)->toDateString(),
            'start_time' => '19:00:00',
            'venue' => 'Lawn Garden',
            'status' => 'published',
        ]);

        // 1. Create a receptionist linked to this event
        $responseCreate = $this->actingAs($owner, 'sanctum')
            ->postJson("/api/v1/events/{$event->id}/receptionists", [
                'name' => 'Staff Test',
                'email' => 'staff_test@daawatak.com',
                'phone' => '+966599999999',
                'password' => 'password123',
            ]);

        $responseCreate->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['id', 'name', 'email', 'phone']
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'staff_test@daawatak.com',
            'role' => 'receptionist'
        ]);

        $receptionistId = $responseCreate->json('data.id');

        $this->assertDatabaseHas('receptionists', [
            'event_id' => $event->id,
            'user_id' => $receptionistId
        ]);

        // 2. Fetch list of receptionists for this event
        $responseIndex = $this->actingAs($owner, 'sanctum')
            ->get("/api/v1/events/{$event->id}/receptionists");

        $responseIndex->assertStatus(200)
            ->assertJsonCount(1, 'data');

        // 3. Remove receptionist assignment
        $responseDelete = $this->actingAs($owner, 'sanctum')
            ->delete("/api/v1/events/{$event->id}/receptionists/{$receptionistId}");

        $responseDelete->assertStatus(200);

        $this->assertDatabaseMissing('receptionists', [
            'event_id' => $event->id,
            'user_id' => $receptionistId
        ]);
    }

    /**
     * Test Super Admin dashboard stats and management routes.
     */
    public function test_super_admin_can_access_dashboard_and_manage_plans()
    {
        $admin = User::create([
            'name' => 'System Admin',
            'email' => 'sysadmin@daawatak.com',
            'role' => 'super_admin',
            'password' => Hash::make('password123'),
        ]);

        // 1. Dashboard stats
        $responseStats = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/admin/dashboard/stats');

        $responseStats->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => ['users', 'events', 'attendance', 'financials']
            ]);

        // 2. Plans Management
        $responseCreatePlan = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/admin/plans', [
                'name' => 'VIP Diamond Plan',
                'description' => 'Unlimited events and guests',
                'price' => 299.00,
                'max_events' => 100,
                'max_guests_per_event' => 10000,
                'max_receptionists' => 20,
                'validity_days' => 365,
            ]);

        $responseCreatePlan->assertStatus(201)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('plans', ['name' => 'VIP Diamond Plan']);
    }

    /**
     * Test CSV report downloads.
     */
    public function test_user_can_export_guests_csv_report()
    {
        $owner = User::create([
            'name' => 'Report Owner',
            'email' => 'report_owner@example.com',
            'role' => 'event_owner',
            'password' => Hash::make('password123'),
        ]);

        $event = Event::create([
            'user_id' => $owner->id,
            'title' => 'CSV Report Event',
            'category' => 'wedding',
            'event_date' => now()->addDays(2)->toDateString(),
            'start_time' => '20:00:00',
            'venue' => 'Grand Hall',
            'status' => 'published',
        ]);

        Guest::create([
            'event_id' => $event->id,
            'name' => 'Tariq Al-Mansoor',
            'phone' => '+966509998877',
            'companions_count' => 2,
            'invitation_status' => 'pending',
            'attendance_status' => 'absent',
        ]);

        $response = $this->actingAs($owner, 'sanctum')
            ->get("/api/v1/reports/events/{$event->id}/guests/csv");

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $this->assertStringContainsString('Tariq Al-Mansoor', $response->streamedContent());
    }

    /**
     * Test Password Reset OTP flow.
     */
    public function test_user_can_request_forgot_password_otp_and_reset()
    {
        $user = User::create([
            'name' => 'Reset User',
            'email' => 'reset_user@daawatak.com',
            'role' => 'event_owner',
            'password' => Hash::make('old_password_123'),
        ]);

        // 1. Request OTP
        $responseForgot = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'reset_user@daawatak.com',
        ]);

        $responseForgot->assertStatus(200)
            ->assertJson(['success' => true]);

        // 2. Reset password using master test OTP 123456
        $responseReset = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'reset_user@daawatak.com',
            'otp' => '123456',
            'password' => 'new_secure_password_123',
            'password_confirmation' => 'new_secure_password_123',
        ]);

        $responseReset->assertStatus(200);

        $user->refresh();
        $this->assertTrue(Hash::check('new_secure_password_123', $user->password));
    }
}
