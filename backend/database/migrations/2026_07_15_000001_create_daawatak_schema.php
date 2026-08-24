<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. PLANS
        Schema::create('plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->integer('max_events');
            $table->integer('max_guests_per_event');
            $table->integer('max_receptionists');
            $table->integer('validity_days');
            $table->timestamps();
        });

        // 2. SUBSCRIPTIONS
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('plan_id');
            $table->string('status')->default('active'); // active, expired, cancelled
            $table->timestamp('starts_at');
            $table->timestamp('ends_at');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('plan_id')->references('id')->on('plans');
            $table->index(['user_id', 'status']);
        });

        // 3. PAYMENTS
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('subscription_id')->nullable();
            $table->string('gateway'); // stripe, tap, moyasar
            $table->string('transaction_id')->unique();
            $table->decimal('amount', 10, 2);
            $table->string('currency')->default('USD');
            $table->string('status'); // pending, success, failed
            $table->json('details')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('subscription_id')->references('id')->on('subscriptions')->onDelete('set null');
        });

        // 4. EVENTS
        Schema::create('events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id'); // Event owner
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category'); // Wedding, Graduation, etc.
            $table->date('event_date');
            $table->time('start_time');
            $table->time('end_time')->nullable();
            $table->string('venue');
            $table->string('google_maps_url', 500)->nullable();
            $table->string('cover_image_url', 500)->nullable();
            $table->string('status')->default('draft'); // draft, published, completed, archived
            $table->string('access_pin', 6)->nullable();
            $table->json('theme_config')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('user_id');
            $table->index('event_date');
        });

        // 5. RECEPTIONISTS
        Schema::create('receptionists', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('event_id');
            $table->uuid('user_id'); // Staff user profile
            $table->timestamps();

            $table->foreign('event_id')->references('id')->on('events')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['event_id', 'user_id']);
        });

        // 6. GUESTS
        Schema::create('guests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('event_id');
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('category')->default('family')->nullable();
            $table->integer('companions_count')->default(0);
            $table->text('notes')->nullable();
            $table->string('invitation_status')->default('pending'); // pending, generated, sent, failed
            $table->string('attendance_status')->default('absent'); // absent, present
            $table->timestamps();

            $table->foreign('event_id')->references('id')->on('events')->onDelete('cascade');
            $table->index('event_id');
            $table->index(['event_id', 'attendance_status']);
        });

        // 7. INVITATION TEMPLATES
        Schema::create('invitation_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->nullable(); // null for system/public templates
            $table->string('name');
            $table->string('base_image_url', 500);
            $table->json('coordinates_config');
            $table->boolean('is_public')->default(false);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });

        // 8. QR CODES
        Schema::create('qr_codes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('guest_id')->unique();
            $table->uuid('event_id');
            $table->string('token_hash', 64)->unique(); // SHA-256
            $table->string('status')->default('active'); // active, revoked
            $table->timestamps();

            $table->foreign('guest_id')->references('id')->on('guests')->onDelete('cascade');
            $table->foreign('event_id')->references('id')->on('events')->onDelete('cascade');
            $table->index('token_hash');
        });

        // 9. ATTENDANCE LOGS
        Schema::create('attendance_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('event_id');
            $table->uuid('guest_id');
            $table->uuid('receptionist_id')->nullable(); // user_id of receptionist
            $table->string('status'); // ACCEPTED, ALREADY_USED, EXPIRED, INVALID
            $table->string('device_info')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('event_id')->references('id')->on('events')->onDelete('cascade');
            $table->foreign('guest_id')->references('id')->on('guests')->onDelete('cascade');
            $table->foreign('receptionist_id')->references('id')->on('users')->onDelete('set null');
            $table->index(['event_id', 'created_at']);
        });

        // 10. AUDIT LOGS
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->nullable();
            $table->string('action');
            $table->string('table_name')->nullable();
            $table->uuid('record_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('attendance_logs');
        Schema::dropIfExists('qr_codes');
        Schema::dropIfExists('invitation_templates');
        Schema::dropIfExists('guests');
        Schema::dropIfExists('receptionists');
        Schema::dropIfExists('events');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('plans');
    }
};
