import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:go_router/go_router.dart';
import '../../core/network_client.dart';

class ScannerScreen extends StatefulWidget {
  final String eventId;
  final String eventName;

  const ScannerScreen({
    super.key,
    required this.eventId,
    required this.eventName,
  });

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  final _networkClient = NetworkClient();
  late MobileScannerController _scannerController;
  
  bool _isProcessing = false;
  bool _hasCameraPermission = false;
  bool _isPermissionChecking = true;
  int _pendingSyncCount = 0;
  bool _isSyncing = false;

  @override
  void initState() {
    super.initState();
    _scannerController = MobileScannerController();
    _requestCameraPermission();
    _loadPendingQueueCount();
    _triggerAutoSync();
  }

  Future<void> _requestCameraPermission() async {
    setState(() {
      _isPermissionChecking = true;
    });

    final status = await Permission.camera.request();
    
    if (mounted) {
      setState(() {
        _hasCameraPermission = status.isGranted;
        _isPermissionChecking = false;
      });

      if (status.isGranted) {
        _scannerController.start();
      }
    }
  }

  Future<void> _loadPendingQueueCount() async {
    final prefs = await SharedPreferences.getInstance();
    final queueJson = prefs.getStringList('offline_scans_queue_${widget.eventId}') ?? [];
    if (mounted) {
      setState(() {
        _pendingSyncCount = queueJson.length;
      });
    }
  }

  Future<void> _triggerAutoSync() async {
    if (_isSyncing) return;
    final prefs = await SharedPreferences.getInstance();
    final key = 'offline_scans_queue_${widget.eventId}';
    final queueJson = prefs.getStringList(key) ?? [];
    
    if (queueJson.isEmpty) return;

    setState(() {
      _isSyncing = true;
    });

    List<String> remaining = [];
    int syncedSuccessfully = 0;

    for (final itemStr in queueJson) {
      try {
        final item = jsonDecode(itemStr) as Map<String, dynamic>;
        final response = await _networkClient.dio.post('/reception/verify', data: {
          'event_id': widget.eventId,
          'token': item['token'],
          'device_info': item['device_info'] ?? 'Offline Sync Terminal',
        });
        if (response.data['success'] == true) {
          syncedSuccessfully++;
        } else {
          remaining.add(itemStr);
        }
      } catch (e) {
        remaining.add(itemStr); // Keep in queue for next sync retry
      }
    }

    await prefs.setStringList(key, remaining);

    if (mounted) {
      setState(() {
        _pendingSyncCount = remaining.length;
        _isSyncing = false;
      });

      if (syncedSuccessfully > 0) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('تمت مزامنة $syncedSuccessfully عملية دخول بنجاح مع السيرفر!'),
            backgroundColor: Colors.green[700],
          ),
        );
      }
    }
  }

  Future<void> _verifyToken(String token) async {
    if (_isProcessing) return;
    
    setState(() {
      _isProcessing = true;
    });
    
    _scannerController.stop();

    try {
      final response = await _networkClient.dio.post('/reception/verify', data: {
        'event_id': widget.eventId,
        'token': token,
        'device_info': 'Android/iOS Reception Terminal',
      });

      if (response.data['success'] == true) {
        final result = response.data['data']['verification_result'] as String;
        if (mounted) {
          context.push('/result', extra: result).then((_) {
            _scannerController.start();
            setState(() {
              _isProcessing = false;
            });
            _triggerAutoSync();
          });
        }
      } else {
        _handleOfflineOrError(token);
      }
    } catch (e) {
      // Offline fallback: save scan locally and show offline pending state
      await _handleOfflineOrError(token);
    }
  }

  Future<void> _handleOfflineOrError(String token) async {
    // If it's a known demo test token when offline
    String result = 'ACCEPTED';
    if (token == 'token_966511111111') {
      result = 'ACCEPTED';
    } else if (token == 'token_966522222222') {
      result = 'ALREADY_USED';
    } else if (token == 'token_966533333333') {
      result = 'EXPIRED';
    } else if (token.startsWith('invalid')) {
      result = 'INVALID';
    } else {
      // Save to local offline queue for sync when internet returns
      final prefs = await SharedPreferences.getInstance();
      final key = 'offline_scans_queue_${widget.eventId}';
      final queueJson = prefs.getStringList(key) ?? [];
      
      queueJson.add(jsonEncode({
        'token': token,
        'timestamp': DateTime.now().toIso8601String(),
        'device_info': 'Android Offline Terminal',
      }));

      await prefs.setStringList(key, queueJson);
      await _loadPendingQueueCount();

      result = 'ACCEPTED'; // Allow entry provisionally offline
    }

    if (mounted) {
      context.push('/result', extra: result).then((_) {
        _scannerController.start();
        setState(() {
          _isProcessing = false;
        });
      });
    }
  }

  @override
  void dispose() {
    _scannerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.eventName),
        actions: [
          IconButton(
            icon: Icon(
              _pendingSyncCount > 0 ? Icons.sync_problem : Icons.cloud_done,
              color: _pendingSyncCount > 0 ? Colors.amber : Colors.greenAccent,
            ),
            onPressed: _triggerAutoSync,
            tooltip: 'حالة المزامنة',
          ),
        ],
      ),
      body: _isPermissionChecking
          ? const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CircularProgressIndicator(color: Color(0xFFD4AF37)),
                  SizedBox(height: 16),
                  Text('جاري التحقق من إذن الكاميرا...', style: TextStyle(color: Colors.white70)),
                ],
              ),
            )
          : !_hasCameraPermission
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.camera_enhance_outlined, size: 70, color: Color(0xFFD4AF37)),
                        const SizedBox(height: 16),
                        const Text(
                          'تطبيق "دعوتك" يحتاج إلى إذن استخدام الكاميرا لمسح رموز الـ QR',
                          style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'يرجى النقر على الزر أدناه لمنح الإذن وتشغيل الكاميرا.',
                          style: TextStyle(color: Colors.white70, fontSize: 13),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFD4AF37),
                            foregroundColor: Colors.black,
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                          ),
                          onPressed: _requestCameraPermission,
                          icon: const Icon(Icons.security),
                          label: const Text('منح الإذن الآن', style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ),
                )
              : Stack(
                  children: [
                    MobileScanner(
                      controller: _scannerController,
                      onDetect: (capture) {
                        final List<Barcode> barcodes = capture.barcodes;
                        for (final barcode in barcodes) {
                          if (barcode.rawValue != null) {
                            _verifyToken(barcode.rawValue!);
                            break;
                          }
                        }
                      },
                    ),
                    
                    Center(
                      child: Container(
                        width: 260,
                        height: 260,
                        decoration: BoxDecoration(
                          border: Border.all(color: const Color(0xFFD4AF37), width: 3),
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.5),
                              spreadRadius: 1000,
                            ),
                          ],
                        ),
                      ),
                    ),
                    
                    Positioned(
                      top: 16,
                      left: 16,
                      right: 16,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.7),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.white10),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              _pendingSyncCount > 0 ? Icons.wifi_off : Icons.wifi,
                              size: 16,
                              color: _pendingSyncCount > 0 ? Colors.amber : Colors.greenAccent,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _pendingSyncCount > 0
                                    ? 'يوجد $_pendingSyncCount عملية معلقة للمزامنة مع السيرفر'
                                    : 'متصل بالسيرفر — المزامنة فورية',
                                style: const TextStyle(color: Colors.white, fontSize: 12),
                              ),
                            ),
                            if (_isSyncing)
                              const SizedBox(
                                width: 14,
                                height: 14,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFFD4AF37)),
                              ),
                          ],
                        ),
                      ),
                    ),

                    const Positioned(
                      bottom: 130,
                      left: 24,
                      right: 24,
                      child: Text(
                        'وجه المربع نحو رمز الاستجابة السريعة (QR Code) المتواجد على بطاقة الدعوة للتحقق الفوري',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    
                    if (_isProcessing)
                      Container(
                        color: Colors.black54,
                        child: const Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              CircularProgressIndicator(color: Color(0xFFD4AF37)),
                              SizedBox(height: 16),
                              Text('جاري التحقق...', style: TextStyle(color: Colors.white)),
                            ],
                          ),
                        ),
                      ),
                      
                    Positioned(
                      bottom: 24,
                      left: 16,
                      right: 16,
                      child: Wrap(
                        spacing: 8,
                        alignment: WrapAlignment.center,
                        children: [
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.green[700], foregroundColor: Colors.white),
                            onPressed: () => _verifyToken('token_966511111111'),
                            child: const Text('دخول مقبول (تجربة)'),
                          ),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.amber[700], foregroundColor: Colors.white),
                            onPressed: () => _verifyToken('token_966522222222'),
                            child: const Text('مستخدم مسبقاً'),
                          ),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.red[700], foregroundColor: Colors.white),
                            onPressed: () => _verifyToken('invalid_qr_code_xyz'),
                            child: const Text('غير صالح'),
                          ),
                        ],
                      ),
                    )
                  ],
                ),
    );
  }
}
