import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/network_client.dart';

class EventListScreen extends StatefulWidget {
  const EventListScreen({super.key});

  @override
  State<EventListScreen> createState() => _EventListScreenState();
}

class _EventListScreenState extends State<EventListScreen> {
  final _networkClient = NetworkClient();
  List<dynamic> _events = [];
  bool _loading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchEvents();
  }

  Future<void> _fetchEvents() async {
    setState(() {
      _loading = true;
      _errorMessage = null;
    });

    try {
      final response = await _networkClient.dio.get('/reception/events');
      if (response.data['success'] == true) {
        setState(() {
          _events = response.data['data'] as List<dynamic>;
        });
      } else {
        setState(() {
          _errorMessage = 'فشل تحميل الفعاليات';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'تعذر الاتصال بالسيرفر. يرجى التأكد من تشغيل backend.';
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  void _showPinVerificationDialog(Map<String, dynamic> event) {
    final pinController = TextEditingController();
    bool verifying = false;
    String? pinError;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              backgroundColor: const Color(0xFF121620),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: const BorderSide(color: Color(0xFFD4AF37), width: 0.5),
              ),
              title: Row(
                children: [
                  const Icon(Icons.shield_outlined, color: Color(0xFFD4AF37)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'رمز حماية ${event['title']}',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ),
                ],
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'أدخل رمز حماية الفعالية المكون من 6 أرقام والموجود في لوحة التحكم لبدء المسح:',
                    style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: pinController,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    textAlign: TextAlign.center,
                    obscureText: true,
                    style: const TextStyle(fontSize: 22, letterSpacing: 8, fontWeight: FontWeight.bold, color: Colors.white),
                    decoration: InputDecoration(
                      hintText: '••••••',
                      hintStyle: const TextStyle(letterSpacing: 4, color: Colors.white24),
                      filled: true,
                      fillColor: const Color(0xFF0B0E14),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Colors.white10),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFD4AF37)),
                      ),
                    ),
                  ),
                  if (pinError != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      pinError!,
                      style: const TextStyle(fontSize: 11, color: Colors.redAccent, fontWeight: FontWeight.bold),
                    ),
                  ]
                ],
              ),
              actions: [
                TextButton(
                  onPressed: verifying ? null : () => Navigator.pop(context),
                  child: const Text('إلغاء', style: TextStyle(color: Colors.white54)),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFD4AF37),
                    foregroundColor: const Color(0xFF0B0E14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: verifying
                      ? null
                      : () async {
                          final pin = pinController.text.trim();
                          if (pin.length != 6) {
                            setDialogState(() {
                              pinError = 'يرجى إدخال 6 أرقام بالكامل';
                            });
                            return;
                          }

                          setDialogState(() {
                            verifying = true;
                            pinError = null;
                          });

                          try {
                            final res = await _networkClient.dio.post(
                              '/reception/verify-pin',
                              data: {
                                'event_id': event['id'],
                                'pin': pin,
                              },
                            );

                            if (res.data['success'] == true) {
                              if (context.mounted) {
                                Navigator.pop(context); // Close dialog
                                context.push('/scan', extra: {
                                  'eventId': event['id'],
                                  'eventName': event['title'],
                                });
                              }
                            } else {
                              setDialogState(() {
                                pinError = res.data['message'] ?? 'رمز الحماية غير صحيح';
                                verifying = false;
                              });
                            }
                          } catch (e) {
                            setDialogState(() {
                              pinError = 'رمز الحماية غير صحيح أو انتهت الجلسة';
                              verifying = false;
                            });
                          }
                        },
                  child: verifying
                      ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0B0E14)))
                      : const Text('اقتران ودخول', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0C10),
      appBar: AppBar(
        backgroundColor: const Color(0xFF10131B),
        elevation: 0,
        centerTitle: false,
        title: Row(
          children: [
            Image.asset(
              'assets/images/logo_vertical_transparent.png',
              height: 36,
              fit: BoxFit.contain,
              errorBuilder: (_, __, ___) => const Icon(Icons.event_available, color: Color(0xFFD4AF37)),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'فعاليات الاستقبال',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                Text(
                  'اختر المناسبة لبدء المسح',
                  style: TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Color(0xFFD4AF37)),
            onPressed: _fetchEvents,
            tooltip: 'تحديث الفعاليات',
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white60),
            onPressed: () => context.go('/login'),
            tooltip: 'تسجيل الخروج',
          ),
        ],
      ),
      body: _loading
          ? const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CircularProgressIndicator(color: Color(0xFFD4AF37)),
                  SizedBox(height: 16),
                  Text('جاري تحميل الفعاليات...', style: TextStyle(color: Colors.white70, fontSize: 13)),
                ],
              ),
            )
          : _errorMessage != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.cloud_off, size: 48, color: Colors.redAccent),
                        const SizedBox(height: 12),
                        Text(_errorMessage!, textAlign: TextAlign.center, style: const TextStyle(color: Colors.redAccent, fontSize: 14)),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          onPressed: _fetchEvents,
                          icon: const Icon(Icons.refresh),
                          label: const Text('إعادة المحاولة'),
                          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFD4AF37), foregroundColor: Colors.black),
                        ),
                      ],
                    ),
                  ),
                )
              : _events.isEmpty
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(28.0),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(20),
                              decoration: BoxDecoration(
                                color: const Color(0xFFD4AF37).withValues(alpha: 0.1),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.event_busy, size: 48, color: Color(0xFFD4AF37)),
                            ),
                            const SizedBox(height: 16),
                            const Text(
                              'لا توجد فعاليات نشطة مسندة لحسابك',
                              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'يرجى التأكد من منظم المناسبة لإضافتك إلى فريق الاستقبال أو استخدم رمز الحماية المباشر للفعالية.',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12, height: 1.5),
                            ),
                            const SizedBox(height: 20),
                            ElevatedButton.icon(
                              onPressed: _fetchEvents,
                              icon: const Icon(Icons.refresh),
                              label: const Text('تحديث القائمة'),
                              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFD4AF37), foregroundColor: Colors.black),
                            ),
                          ],
                        ),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
                      itemCount: _events.length,
                      itemBuilder: (context, index) {
                        final event = _events[index];
                        final accessPin = event['access_pin'] ?? '123456';
                        return Container(
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF141824), Color(0xFF0F1219)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: 0.25)),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.3),
                                blurRadius: 16,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Material(
                            color: Colors.transparent,
                            child: InkWell(
                              borderRadius: BorderRadius.circular(20),
                              onTap: () => _showPinVerificationDialog(event),
                              child: Padding(
                                padding: const EdgeInsets.all(18),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(10),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFD4AF37).withValues(alpha: 0.12),
                                            borderRadius: BorderRadius.circular(12),
                                          ),
                                          child: const Icon(Icons.celebration, color: Color(0xFFD4AF37), size: 22),
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                event['title'] ?? 'المناسبة',
                                                style: const TextStyle(
                                                  fontSize: 17,
                                                  fontWeight: FontWeight.bold,
                                                  color: Colors.white,
                                                ),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                              const SizedBox(height: 2),
                                              Text(
                                                'المنظم: ${event['user']?['name'] ?? 'منظم الفعالية'}',
                                                style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                                              ),
                                            ],
                                          ),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFD4AF37).withValues(alpha: 0.1),
                                            borderRadius: BorderRadius.circular(8),
                                            border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: 0.3)),
                                          ),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              const Icon(Icons.shield_outlined, size: 12, color: Color(0xFFD4AF37)),
                                              const SizedBox(width: 4),
                                              Text(
                                                accessPin,
                                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFD4AF37)),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 14),
                                    const Divider(color: Colors.white10, height: 1),
                                    const SizedBox(height: 12),
                                    Row(
                                      children: [
                                        const Icon(Icons.calendar_month, size: 14, color: Color(0xFFD4AF37)),
                                        const SizedBox(width: 6),
                                        Text(
                                          event['event_date'] ?? 'اليوم',
                                          style: const TextStyle(color: Colors.white70, fontSize: 12),
                                        ),
                                        if (event['venue'] != null && event['venue'].toString().isNotEmpty) ...[
                                          const SizedBox(width: 16),
                                          const Icon(Icons.location_on, size: 14, color: Color(0xFFD4AF37)),
                                          const SizedBox(width: 4),
                                          Expanded(
                                            child: Text(
                                              event['venue'],
                                              style: const TextStyle(color: Colors.white70, fontSize: 12),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                        ],
                                      ],
                                    ),
                                    const SizedBox(height: 16),
                                    // Scan direct action button
                                    Container(
                                      width: double.infinity,
                                      padding: const EdgeInsets.symmetric(vertical: 12),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFD4AF37),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: const Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Icon(Icons.qr_code_scanner, size: 18, color: Color(0xFF0B0E14)),
                                          SizedBox(width: 8),
                                          Text(
                                            'دخول ومسح التذاكر (QR)',
                                            style: TextStyle(
                                              color: Color(0xFF0B0E14),
                                              fontWeight: FontWeight.bold,
                                              fontSize: 14,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
    );
  }
}
