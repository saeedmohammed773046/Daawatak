import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'models/verification_result.dart';

class VerificationResultScreen extends StatelessWidget {
  final VerificationResultData resultData;

  const VerificationResultScreen({
    super.key,
    required this.resultData,
  });

  @override
  Widget build(BuildContext context) {
    final config = _getDisplayConfig(resultData.status);

    return Scaffold(
      backgroundColor: config.bgColor,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),

              // Status Icon Container with soft glow
              Center(
                child: Container(
                  width: 140,
                  height: 140,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.12),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: config.accentColor.withValues(alpha: 0.6),
                      width: 3,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: config.accentColor.withValues(alpha: 0.35),
                        blurRadius: 36,
                        spreadRadius: 6,
                      ),
                    ],
                  ),
                  child: Icon(
                    config.icon,
                    size: 80,
                    color: config.accentColor,
                  ),
                ),
              ),

              const SizedBox(height: 32),

              // Title (with optional trial badge)
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Flexible(
                    child: Text(
                      resultData.message.isNotEmpty ? resultData.message : config.title,
                      style: const TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  if (resultData.isTrial) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.amber[700],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'تجربة',
                        style: TextStyle(
                          color: Colors.black,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ],
              ),

              const SizedBox(height: 14),

              // Description / Subtitle
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Text(
                  resultData.details ?? config.subtitle,
                  style: const TextStyle(
                    fontSize: 15,
                    color: Colors.white70,
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),

              // Guest info card (if guest details exist)
              if (resultData.guestName != null && resultData.guestName!.isNotEmpty) ...[
                const SizedBox(height: 28),
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.35),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: config.accentColor.withValues(alpha: 0.3),
                      width: 1,
                    ),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.person_outline, color: Colors.white70, size: 20),
                          const SizedBox(width: 8),
                          Flexible(
                            child: Text(
                              resultData.guestName!,
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      if (resultData.companionsCount != null && resultData.companionsCount! > 0) ...[
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.groups_outlined, color: Colors.white60, size: 18),
                            const SizedBox(width: 6),
                            Text(
                              'عدد المرافقين: ${resultData.companionsCount}',
                              style: const TextStyle(fontSize: 14, color: Colors.white70),
                            ),
                          ],
                        ),
                      ],
                      if (resultData.tableNumber != null && resultData.tableNumber!.isNotEmpty) ...[
                        const SizedBox(height: 6),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.table_restaurant_outlined, color: Colors.white60, size: 18),
                            const SizedBox(width: 6),
                            Text(
                              'رقم الطاولة: ${resultData.tableNumber}',
                              style: const TextStyle(fontSize: 14, color: Colors.white70),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ],

              const Spacer(),

              // "مسح QR آخر" Action Button
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 6,
                ),
                onPressed: () => context.pop(),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.qr_code_scanner, size: 24),
                    SizedBox(width: 10),
                    Text(
                      'مسح QR آخر',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  _DisplayConfig _getDisplayConfig(String status) {
    switch (status.toUpperCase()) {
      case 'ACCEPTED':
        return const _DisplayConfig(
          title: 'دخول مقبول',
          subtitle: 'دعوة صالحة ومؤكدة. تم تسجيل الدخول بنجاح.',
          icon: Icons.check_circle_rounded,
          bgColor: Color(0xFF0A3D24), // Deep Emerald
          accentColor: Color(0xFF25D366),
        );
      case 'ALREADY_USED':
        return const _DisplayConfig(
          title: 'مستخدم مسبقاً',
          subtitle: 'تم استخدام هذه الدعوة مسبقًا ولا يمكن استخدامها مرة أخرى.',
          icon: Icons.warning_amber_rounded,
          bgColor: Color(0xFF4A3400), // Deep Amber / Bronze
          accentColor: Color(0xFFFFB300),
        );
      case 'EXPIRED':
        return const _DisplayConfig(
          title: 'دعوة منتهية الصلاحية',
          subtitle: 'تاريخ أو وقت هذه الفعالية قد انتهى مسبقاً ولا يمكن الدخول بها.',
          icon: Icons.history_toggle_off_rounded,
          bgColor: Color(0xFF2D1245), // Deep Purple
          accentColor: Color(0xFFB066FE),
        );
      case 'OFFLINE_SAVED':
        return const _DisplayConfig(
          title: 'تم الحفظ محلياً',
          subtitle: 'تعذر الاتصال بالسيرفر. تم تسجيل الدعوة محلياً وستتم المزامنة فور توفر الإنترنت.',
          icon: Icons.cloud_queue_rounded,
          bgColor: Color(0xFF102A43), // Deep Blue Slate
          accentColor: Color(0xFF38BEC9),
        );
      case 'INVALID':
      default:
        return const _DisplayConfig(
          title: 'رمز QR غير صالح',
          subtitle: 'لم يتم العثور على دعوة صالحة مرتبطة بهذا الرمز.',
          icon: Icons.cancel_rounded,
          bgColor: Color(0xFF5C1017), // Deep Crimson Red
          accentColor: Color(0xFFFF4D4D),
        );
    }
  }
}

class _DisplayConfig {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color bgColor;
  final Color accentColor;

  const _DisplayConfig({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.bgColor,
    required this.accentColor,
  });
}
