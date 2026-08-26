import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'models/verification_result.dart';

class VerificationResultScreen extends StatefulWidget {
  final VerificationResultData resultData;

  const VerificationResultScreen({
    super.key,
    required this.resultData,
  });

  @override
  State<VerificationResultScreen> createState() => _VerificationResultScreenState();
}

class _VerificationResultScreenState extends State<VerificationResultScreen> {
  @override
  void initState() {
    super.initState();
    // Play appropriate haptic feedback depending on the status
    _triggerStatusHaptic();
  }

  void _triggerStatusHaptic() {
    try {
      final status = widget.resultData.status.toUpperCase();
      if (status == 'ACCEPTED') {
        SystemSound.play(SystemSoundType.click);
        HapticFeedback.mediumImpact();
      } else if (status == 'ALREADY_USED') {
        SystemSound.play(SystemSoundType.alert);
        HapticFeedback.heavyImpact();
      } else {
        SystemSound.play(SystemSoundType.alert);
        HapticFeedback.vibrate();
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final result = widget.resultData;
    final config = _getDisplayConfig(result.status);

    return Scaffold(
      backgroundColor: config.bgColor,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(flex: 1),

              // 1. Big Status Icon with vibrant glow
              Center(
                child: Container(
                  width: 130,
                  height: 130,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.12),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: config.accentColor.withValues(alpha: 0.8),
                      width: 4,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: config.accentColor.withValues(alpha: 0.45),
                        blurRadius: 40,
                        spreadRadius: 8,
                      ),
                    ],
                  ),
                  child: Icon(
                    config.icon,
                    size: 76,
                    color: config.accentColor,
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // 2. Big Bold Status Title & Trial Tag
              Column(
                children: [
                  Text(
                    config.title,
                    style: const TextStyle(
                      fontSize: 34,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                      letterSpacing: 0.5,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  if (result.isTrial) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFD54F),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.3),
                            blurRadius: 8,
                          ),
                        ],
                      ),
                      child: const Text(
                        '(تجربة)',
                        style: TextStyle(
                          color: Color(0xFF1E1E1E),
                          fontSize: 14,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ],
                ],
              ),

              const SizedBox(height: 16),

              // 3. Clear Description
              Text(
                result.details ?? config.subtitle,
                style: const TextStyle(
                  fontSize: 16,
                  color: Colors.white70,
                  height: 1.4,
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 24),

              // 4. Prominent Guest Information Card (If guest data is available)
              if (result.guestName != null && result.guestName!.isNotEmpty)
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.45),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: config.accentColor.withValues(alpha: 0.4),
                      width: 1.5,
                    ),
                  ),
                  child: Column(
                    children: [
                      // Guest Name
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.person_rounded, color: config.accentColor, size: 26),
                          const SizedBox(width: 10),
                          Flexible(
                            child: Text(
                              result.guestName!,
                              style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                              ),
                              textAlign: TextAlign.center,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),

                      if ((result.companionsCount != null && result.companionsCount! > 0) ||
                          (result.tableNumber != null && result.tableNumber!.isNotEmpty)) ...[
                        const SizedBox(height: 14),
                        const Divider(color: Colors.white12, height: 1),
                        const SizedBox(height: 14),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            if (result.companionsCount != null)
                              Row(
                                children: [
                                  const Text('👥', style: TextStyle(fontSize: 18)),
                                  const SizedBox(width: 6),
                                  Text(
                                    'المرافقون: ${result.companionsCount}',
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                                ],
                              ),
                            if (result.tableNumber != null && result.tableNumber!.isNotEmpty)
                              Row(
                                children: [
                                  const Text('🪑', style: TextStyle(fontSize: 18)),
                                  const SizedBox(width: 6),
                                  Text(
                                    'الطاولة: ${result.tableNumber}',
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                                ],
                              ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),

              const Spacer(flex: 2),

              // 5. "مسح QR آخر" Button
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 8,
                ),
                onPressed: () => context.pop(),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.qr_code_scanner_rounded, size: 26),
                    SizedBox(width: 12),
                    Text(
                      'مسح QR آخر',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
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
          subtitle: 'تم التحقق بنجاح وتأكيد حضور الضيف.',
          icon: Icons.check_circle_rounded,
          bgColor: Color(0xFF073820), // Deep Rich Emerald
          accentColor: Color(0xFF00E676), // Bright Green
        );

      case 'ALREADY_USED':
        return const _DisplayConfig(
          title: 'مستخدم مسبقاً',
          subtitle: 'تم تسجيل دخول هذه الدعوة مسبقاً ولا يمكن استخدامها مرة أخرى.',
          icon: Icons.warning_rounded,
          bgColor: Color(0xFF4A2800), // Deep Dark Amber
          accentColor: Color(0xFFFFB300), // Rich Amber
        );

      case 'EXPIRED':
        return const _DisplayConfig(
          title: 'دعوة منتهية الصلاحية',
          subtitle: 'تاريخ أو وقت هذه الفعالية قد انتهى مسبقاً.',
          icon: Icons.history_toggle_off_rounded,
          bgColor: Color(0xFF280B3D),
          accentColor: Color(0xFFBA68C8),
        );

      case 'NETWORK_ERROR':
        return const _DisplayConfig(
          title: 'تعذر التحقق من الدعوة',
          subtitle: 'لا يوجد اتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مجدداً.',
          icon: Icons.cloud_off_rounded,
          bgColor: Color(0xFF1E293B),
          accentColor: Color(0xFFF97316),
        );

      case 'INVALID':
      default:
        return const _DisplayConfig(
          title: 'غير صالح',
          subtitle: 'رمز الدعوة غير صالح أو غير موجود في قاعدة البيانات.',
          icon: Icons.cancel_rounded,
          bgColor: Color(0xFF540D12), // Deep Crimson Red
          accentColor: Color(0xFFFF3D00), // Bright Red
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
