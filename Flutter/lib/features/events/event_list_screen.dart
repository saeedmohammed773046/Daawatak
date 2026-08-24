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
      appBar: AppBar(
        title: const Text('الفعاليات الخاصة بك'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchEvents,
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => context.go('/login'),
          )
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(child: Text(_errorMessage!, style: const TextStyle(color: Colors.redAccent)))
              : _events.isEmpty
                  ? const Center(
                      child: Text(
                        'لا توجد فعاليات نشطة مخصصة لك حالياً.',
                        style: TextStyle(color: Color(0xFF64748B)),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _events.length,
                      itemBuilder: (context, index) {
                        final event = _events[index];
                        final accessPin = event['access_pin'] ?? '123456';
                        return Card(
                          margin: const EdgeInsets.only(bottom: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                            side: const BorderSide(color: Colors.white10),
                          ),
                          color: const Color(0xFF121620),
                          child: InkWell(
                            borderRadius: BorderRadius.circular(16),
                            onTap: () => _showPinVerificationDialog(event),
                            child: Padding(
                              padding: const EdgeInsets.all(20),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          event['title'] ?? '',
                                          style: const TextStyle(
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.white,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFD4AF37).withValues(alpha: 0.1),
                                          borderRadius: BorderRadius.circular(8),
                                          border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: 0.3)),
                                        ),
                                        child: Row(
                                          children: [
                                            const Icon(Icons.lock, size: 12, color: Color(0xFFD4AF37)),
                                            const SizedBox(width: 4),
                                            Text(
                                              'رمز: $accessPin',
                                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFD4AF37)),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  Row(
                                    children: [
                                      const Icon(Icons.calendar_today, size: 14, color: Color(0xFF64748B)),
                                      const SizedBox(width: 6),
                                      Text(event['event_date'] ?? '', style: const TextStyle(color: Color(0xFF64748B))),
                                      const SizedBox(width: 16),
                                      const Icon(Icons.location_on, size: 14, color: Color(0xFF64748B)),
                                      const SizedBox(width: 6),
                                      Expanded(
                                        child: Text(
                                          event['venue'] ?? '',
                                          style: const TextStyle(color: Color(0xFF64748B)),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    ],
                                  )
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ),
    );
  }
}
