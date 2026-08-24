import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class VerificationResultScreen extends StatelessWidget {
  final String result; // ACCEPTED, ALREADY_USED, EXPIRED, INVALID

  const VerificationResultScreen({
    super.key,
    required this.result,
  });

  @override
  Widget build(BuildContext context) {
    final config = _getDisplayConfig(result);

    return Scaffold(
      backgroundColor: config.bgColor,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),
              
              // Result Status Icon
              Center(
                child: Container(
                  width: 150,
                  height: 150,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.12),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white30, width: 3),
                    boxShadow: [
                      BoxShadow(
                        color: config.foregroundColor.withValues(alpha: 0.3),
                        blurRadius: 30,
                        spreadRadius: 5,
                      )
                    ]
                  ),
                  child: Icon(
                    config.icon,
                    size: 85,
                    color: config.foregroundColor,
                  ),
                ),
              ),
              const SizedBox(height: 40),
              
              // Result Status Title
              Text(
                config.title,
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                  letterSpacing: 0.5,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              
              // Result Status Description
              Text(
                config.subtitle,
                style: const TextStyle(
                  fontSize: 16,
                  color: Colors.white70,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
              
              const Spacer(),
              
              // Back to Scanner button
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 5,
                ),
                onPressed: () => context.pop(),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.qr_code_scanner, size: 22),
                    SizedBox(width: 10),
                    Text(
                      'العودة لمسح رمز جديد',
                      style: TextStyle(
                        fontSize: 17,
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
          title: 'أهلاً وسهلاً بك - تم الدخول',
          subtitle: 'دعوة مقبولة وصالحة. تم تسجيل دخول الضيف بنجاح والتحديث في لوحة التحكم في الوقت الفعلي.',
          icon: Icons.check_circle_rounded,
          bgColor: Color(0xFF0A4D2E), // Deep Emerald
          foregroundColor: Color(0xFF25D366),
        );
      case 'ALREADY_USED':
        return const _DisplayConfig(
          title: 'تنبيه: قام بالدخول مسبقاً!',
          subtitle: 'هذا الرمز تم مسحه وتسجيل دخول صاحب الدعوة مسبقاً في وقت سابق.',
          icon: Icons.warning_amber_rounded,
          bgColor: Color(0xFF5E4500), // Rich Dark Amber
          foregroundColor: Color(0xFFFFD700),
        );
      case 'EXPIRED':
        return const _DisplayConfig(
          title: 'دعوة منتهية الصلاحية',
          subtitle: 'تاريخ أو وقت هذه الفعالية قد انتهى مسبقاً ولا يمكن الدخول بها.',
          icon: Icons.history_toggle_off_rounded,
          bgColor: Color(0xFF381554), // Dark Violet
          foregroundColor: Color(0xFFB066FE),
        );
      case 'INVALID':
      default:
        return const _DisplayConfig(
          title: 'دعوة مرفوضة - غير صالحة',
          subtitle: 'رمز الـ QR غير صالح أو لا توجد له أي بيانات مسجلة في قاعدة بيانات الفعالية.',
          icon: Icons.cancel_rounded,
          bgColor: Color(0xFF75151E), // Crimson Red
          foregroundColor: Color(0xFFFF4D4D),
        );
    }
  }
}

class _DisplayConfig {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color bgColor;
  final Color foregroundColor;

  const _DisplayConfig({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.bgColor,
    required this.foregroundColor,
  });
}
