<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Event;
use App\Models\Guest;
use App\Models\QrCode;
use App\Models\Receptionist;
use App\Models\AttendanceLog;
use App\Models\AuditLog;
use App\Models\Payment;
use App\Models\InvitationTemplate;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with 100% Yemen localized data.
     */
    public function run(): void
    {
        // 1. Seed Plans (in Yemeni Rials YER)
        $freePlan = Plan::create([
            'name' => 'الباقة المجانية',
            'description' => 'مثالية للمناسبات العائلية المصغرة والتجمعات الخاصة في اليمن.',
            'price' => 0.00,
            'max_events' => 1,
            'max_guests_per_event' => 50,
            'max_receptionists' => 1,
            'validity_days' => 30,
        ]);

        $basicPlan = Plan::create([
            'name' => 'الباقة الأساسية',
            'description' => 'مناسبة لحفلات الخطوبة وعقد القران والمناسبات المتوسطة.',
            'price' => 25000.00, // 25,000 YER
            'max_events' => 3,
            'max_guests_per_event' => 200,
            'max_receptionists' => 2,
            'validity_days' => 90,
        ]);

        $premiumPlan = Plan::create([
            'name' => 'الباقة الاحترافية (الأكثر طلباً)',
            'description' => 'الخيار الأفضل لأفراح ومناسبات الأعراس والملتقيات في صنعاء وعدن والمحافظات.',
            'price' => 60000.00, // 60,000 YER
            'max_events' => 10,
            'max_guests_per_event' => 1000,
            'max_receptionists' => 5,
            'validity_days' => 180,
        ]);

        $enterprisePlan = Plan::create([
            'name' => 'باقة الشركات والمؤتمرات الكبرى',
            'description' => 'للمعارض والفعاليات الرسمية والجامعات مع دعم فني يمني مخصص.',
            'price' => 150000.00, // 150,000 YER
            'max_events' => 50,
            'max_guests_per_event' => 10000,
            'max_receptionists' => 20,
            'validity_days' => 365,
        ]);

        // 2. Seed Users (Yemeni Identities & Phones)
        $admin = User::create([
            'name' => 'مدير النظام الرئيسي',
            'email' => 'admin@gmail.com',
            'phone' => '+967770000001',
            'role' => 'super_admin',
            'password' => Hash::make('123456789'),
            'email_verified_at' => now(),
        ]);

        $owner = User::create([
            'name' => 'صادق الشميري',
            'email' => 'owner@daawatak.com',
            'phone' => '+967770000002',
            'role' => 'event_owner',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);

        $owner2 = User::create([
            'name' => 'وضاح الأهدل',
            'email' => 'shammar@example.com',
            'phone' => '+967731234567',
            'role' => 'event_owner',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);

        $receptionist = User::create([
            'name' => 'سارة الحميري (مسؤولة الاستقبال)',
            'email' => 'receptionist@daawatak.com',
            'phone' => '+967770000003',
            'role' => 'receptionist',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);

        // 3. Seed Subscriptions & Payments (in YER / Kuraimi Express / Floosak)
        $subscription = Subscription::create([
            'user_id' => $owner->id,
            'plan_id' => $premiumPlan->id,
            'status' => 'active',
            'starts_at' => Carbon::now()->subDays(10),
            'ends_at' => Carbon::now()->addDays(170),
        ]);

        Payment::create([
            'subscription_id' => $subscription->id,
            'user_id' => $owner->id,
            'gateway' => 'kuraimi',
            'amount' => 60000.00,
            'currency' => 'YER',
            'status' => 'success',
            'transaction_id' => 'YEM-TXN-' . strtoupper(bin2hex(random_bytes(4))),
            'details' => ['payment_method' => 'الكريمي إكسبرس / محفظة كاش'],
        ]);

        // 4. Seed Real Diverse Invitation Templates
        $templatesList = [
            ['name' => 'القالب الملكي الذهبي الفاخر', 'category' => 'wedding', 'url' => 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600', 'colors' => ['#D4AF37', '#121620'], 'public' => false],
            ['name' => 'قالب زفاف اللؤلؤ الأبيض والأناقة', 'category' => 'wedding', 'url' => 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600', 'colors' => ['#F8FAFC', '#D4AF37'], 'public' => true],
            ['name' => 'قالب الزفاف العنابي الكلاسيكي', 'category' => 'wedding', 'url' => 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=600', 'colors' => ['#5B2333', '#E9C46A'], 'public' => false],
            ['name' => 'قالب زفاف الزمرد والذهب العريق', 'category' => 'wedding', 'url' => 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=600', 'colors' => ['#065F46', '#F3D17A'], 'public' => false],
            ['name' => 'قالب عقد القران والبركة الإسلامي', 'category' => 'religious', 'url' => 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600', 'colors' => ['#0F2E1E', '#D4AF37'], 'public' => true],
            ['name' => 'قالب الخطوبة الملكي الوردي', 'category' => 'engagement', 'url' => 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=600', 'colors' => ['#831843', '#FCE7F3'], 'public' => false],
            ['name' => 'قالب بهجة الخطوبة المعاصرة', 'category' => 'engagement', 'url' => 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=600', 'colors' => ['#C2410C', '#FEF3C7'], 'public' => true],
            ['name' => 'قالب فخر التخرج الأكاديمي الذهبي', 'category' => 'graduation', 'url' => 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600', 'colors' => ['#1E3A8A', '#FBBF24'], 'public' => false],
            ['name' => 'قالب وسام المهندسين والتميز', 'category' => 'graduation', 'url' => 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600', 'colors' => ['#047857', '#FCD34D'], 'public' => true],
            ['name' => 'قالب مؤتمرات الأعمال والابتكار التقني', 'category' => 'conference', 'url' => 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600', 'colors' => ['#0F172A', '#38BDF8'], 'public' => false],
            ['name' => 'قالب المنتدى الاقتصادي وقمة الرواد', 'category' => 'conference', 'url' => 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=600', 'colors' => ['#1E293B', '#F59E0B'], 'public' => true],
            ['name' => 'قالب ورش العمل والتدريب الاحترافي', 'category' => 'training', 'url' => 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600', 'colors' => ['#4338CA', '#A5B4FC'], 'public' => true],
            ['name' => 'قالب ميلاد النجوم البهيج', 'category' => 'birthday', 'url' => 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&q=80&w=600', 'colors' => ['#BE185D', '#FDE047'], 'public' => true],
            ['name' => 'قالب عيد الميلاد الملكي المخملي', 'category' => 'birthday', 'url' => 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=600', 'colors' => ['#4C1D95', '#FBBF24'], 'public' => false],
            ['name' => 'قالب حفل تدشين وافتتاح المشاريع', 'category' => 'opening', 'url' => 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=600', 'colors' => ['#0F172A', '#E11D48'], 'public' => false],
            ['name' => 'قالب الاحتفال التكريمي واليوبيل الذهبي', 'category' => 'special', 'url' => 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=600', 'colors' => ['#78350F', '#FCD34D'], 'public' => false],
        ];

        foreach ($templatesList as $tData) {
            InvitationTemplate::create([
                'name' => $tData['name'],
                'base_image_url' => $tData['url'],
                'coordinates_config' => [
                    'category' => $tData['category'],
                    'colors' => $tData['colors'],
                    'guest_name' => ['x' => 540, 'y' => 800, 'font_size' => 48, 'color' => $tData['colors'][0]],
                ],
                'is_public' => $tData['public'],
            ]);
        }

        // 5. Seed Real Yemeni Events
        $event1 = Event::create([
            'user_id' => $owner->id,
            'title' => 'حفل زفاف صادق و ريم',
            'description' => 'نتشرف بدعوتكم لحضور حفل زفافنا ومشاركتنا أجمل اللحظات وأبهى الذكريات.',
            'category' => 'wedding',
            'event_date' => Carbon::now()->addDays(14)->toDateString(),
            'start_time' => '16:00:00',
            'end_time' => '21:30:00',
            'venue' => 'قاعة أبوللو الكبرى للاحتفالات، حدة، صنعاء',
            'google_maps_url' => 'https://maps.google.com/?q=15.3694,44.1910',
            'cover_image_url' => 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
            'status' => 'published',
            'access_pin' => '123456',
            'theme_config' => [
                'primary_color' => '#D4AF37',
                'secondary_color' => '#1A2E40',
                'font_family' => 'Cairo',
                'welcome_text' => 'مرحباً بكم في حفل زفاف صادق وريم',
            ],
        ]);

        $event2 = Event::create([
            'user_id' => $owner->id,
            'title' => 'مؤتمر رواد الأعمال والابتكار التقني في اليمن 2026',
            'description' => 'المؤتمر الأبرز لدعم الشركات الناشئة والتحول الرقمي في الجمهورية اليمنية.',
            'category' => 'conference',
            'event_date' => Carbon::now()->addDays(25)->toDateString(),
            'start_time' => '09:00:00',
            'end_time' => '15:00:00',
            'venue' => 'مركز المؤتمرات - فندق الفخامة، صنعاء',
            'google_maps_url' => 'https://maps.google.com/?q=15.3500,44.2000',
            'cover_image_url' => 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
            'status' => 'published',
            'access_pin' => '123456',
            'theme_config' => [
                'primary_color' => '#38BDF8',
                'secondary_color' => '#0F172A',
                'font_family' => 'Tajawal',
                'welcome_text' => 'أهلاً بكم في مؤتمر الابتكار التقني 2026',
            ],
        ]);

        $event3 = Event::create([
            'user_id' => $owner->id,
            'title' => 'حفل تخرج الدفعة 32 - كلية الحاسوب وتقنية المعلومات',
            'description' => 'احتفال بتخريج كوكبة من مهندسي ومطوري البرمجيات - جامعة صنعاء.',
            'category' => 'graduation',
            'event_date' => Carbon::now()->addDays(40)->toDateString(),
            'start_time' => '09:30:00',
            'end_time' => '13:30:00',
            'venue' => 'قاعة قصر الشباب الكبرى، صنعاء',
            'google_maps_url' => 'https://maps.google.com/?q=15.3700,44.1800',
            'cover_image_url' => 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800',
            'status' => 'published',
            'access_pin' => '123456',
            'theme_config' => [
                'primary_color' => '#10B981',
                'secondary_color' => '#064E3B',
                'font_family' => 'Cairo',
                'welcome_text' => 'ألف مبروك التخرج لمهندسي الدفعة 32',
            ],
        ]);

        // 6. Assign Receptionist
        Receptionist::create([
            'event_id' => $event1->id,
            'user_id' => $receptionist->id,
        ]);
        Receptionist::create([
            'event_id' => $event2->id,
            'user_id' => $receptionist->id,
        ]);

        // 7. Seed Real Guests & QR Tokens for Event 1 (Yemeni Names & Numbers)
        $guestsData = [
            ['name' => 'د. وضاح بن عبد الله الأهدل', 'phone' => '+967771111111', 'email' => 'dr.waddah@daawatak.ye', 'companions' => 2, 'category' => 'vip', 'notes' => 'ضيف شرف', 'attended' => true],
            ['name' => 'م. عبد الرحمن باعباد', 'phone' => '+967732222222', 'email' => 'baabbad@daawatak.ye', 'companions' => 1, 'category' => 'family', 'notes' => 'قريب العريس', 'attended' => true],
            ['name' => 'أ. سمية بنت أحمد الكبسي', 'phone' => '+967713333333', 'email' => 'somaya@daawatak.ye', 'companions' => 0, 'category' => 'friends', 'notes' => 'صديقة العروس', 'attended' => true],
            ['name' => 'مازن بن محمد المقبلي', 'phone' => '+967784444444', 'email' => 'mazen@daawatak.ye', 'companions' => 1, 'category' => 'work', 'notes' => 'مدير الشركة', 'attended' => false],
            ['name' => 'أصيل بن علي المقطري', 'phone' => '+967775555551', 'email' => 'aseel@daawatak.ye', 'companions' => 2, 'category' => 'friends', 'notes' => 'زميل الدراسة', 'attended' => false],
            ['name' => 'بلقيس بنت صالح السقاف', 'phone' => '+967775555552', 'email' => 'balqees@daawatak.ye', 'companions' => 3, 'category' => 'family', 'notes' => 'خالة العروس', 'attended' => true],
            ['name' => 'عمرو بن عبد العزيز بن شملان', 'phone' => '+967735555553', 'email' => 'amr@daawatak.ye', 'companions' => 0, 'category' => 'friends', 'notes' => '', 'attended' => false],
            ['name' => 'د. نسرين بنت أحمد باذيب', 'phone' => '+967715555554', 'email' => 'dr.nisreen@daawatak.ye', 'companions' => 1, 'category' => 'vip', 'notes' => 'استشارية طبية', 'attended' => true],
            ['name' => 'هشام بن يحيى المتوكل', 'phone' => '+967785555555', 'email' => 'hisham@daawatak.ye', 'companions' => 0, 'category' => 'work', 'notes' => '', 'attended' => false],
            ['name' => 'هند بنت ناصر العمودي', 'phone' => '+967775555556', 'email' => 'hind@daawatak.ye', 'companions' => 2, 'category' => 'vip', 'notes' => 'راعية الفعالية', 'attended' => true],
        ];

        foreach ($guestsData as $g) {
            $guest = Guest::create([
                'event_id' => $event1->id,
                'name' => $g['name'],
                'phone' => $g['phone'],
                'email' => $g['email'],
                'companions_count' => $g['companions'],
                'category' => $g['category'],
                'notes' => $g['notes'],
                'invitation_status' => 'generated',
                'attendance_status' => $g['attended'] ? 'present' : 'absent',
            ]);

            $rawToken = 'token_' . str_replace('+', '', $g['phone']);
            $tokenHash = hash('sha256', $rawToken);

            QrCode::create([
                'guest_id' => $guest->id,
                'event_id' => $event1->id,
                'token_hash' => $tokenHash,
                'status' => 'active',
            ]);

            if ($g['attended']) {
                AttendanceLog::create([
                    'event_id' => $event1->id,
                    'guest_id' => $guest->id,
                    'receptionist_id' => $receptionist->id,
                    'status' => 'ACCEPTED',
                    'device_info' => 'بوابة كبار الشخصيات - محطة صنعاء 1',
                    'created_at' => Carbon::now()->subMinutes(rand(10, 180)),
                ]);
            }
        }

        // 8. Seed Audit Logs
        AuditLog::create([
            'user_id' => $admin->id,
            'action' => 'LOGIN',
            'table_name' => 'users',
            'record_id' => $admin->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'new_values' => ['email' => $admin->email],
        ]);

        AuditLog::create([
            'user_id' => $owner->id,
            'action' => 'CREATE_EVENT',
            'table_name' => 'events',
            'record_id' => $event1->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'new_values' => ['title' => $event1->title, 'category' => 'wedding'],
        ]);
    }
}
