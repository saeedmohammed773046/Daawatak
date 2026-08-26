import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:permission_handler/permission_handler.dart';
import 'models/verification_result.dart';
import 'services/reception_verification_service.dart';
import 'utils/qr_token_parser.dart';
import 'widgets/scanner_overlay.dart';

enum CameraPermissionState {
  checking,
  granted,
  denied,
  permanentlyDenied,
  error,
}

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

class _ScannerScreenState extends State<ScannerScreen> with WidgetsBindingObserver {
  final ReceptionVerificationService _verificationService = ReceptionVerificationService();
  late MobileScannerController _scannerController;

  CameraPermissionState _permissionState = CameraPermissionState.checking;
  String? _cameraErrorMessage;
  bool _isProcessing = false;
  bool _isTorchOn = false;
  int _pendingSyncCount = 0;
  bool _isSyncing = false;
  DateTime _lastScannedTimestamp = DateTime.fromMillisecondsSinceEpoch(0);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);

    _scannerController = MobileScannerController(
      detectionSpeed: DetectionSpeed.noDuplicates,
      facing: CameraFacing.back,
      torchEnabled: false,
      autoStart: false,
    );

    _checkAndRequestCameraPermission();
    _loadPendingQueueCount();
    _triggerAutoSync();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (_permissionState != CameraPermissionState.granted) return;

    if (state == AppLifecycleState.resumed) {
      if (!_isProcessing) {
        _scannerController.start();
      }
    } else if (state == AppLifecycleState.inactive || state == AppLifecycleState.paused) {
      _scannerController.stop();
    }
  }

  Future<void> _checkAndRequestCameraPermission() async {
    setState(() {
      _permissionState = CameraPermissionState.checking;
      _cameraErrorMessage = null;
    });

    final status = await Permission.camera.status;

    if (status.isGranted) {
      _onPermissionGranted();
    } else if (status.isPermanentlyDenied || status.isRestricted) {
      if (mounted) {
        setState(() {
          _permissionState = CameraPermissionState.permanentlyDenied;
        });
      }
    } else {
      // Request permission
      final requestedStatus = await Permission.camera.request();
      if (mounted) {
        if (requestedStatus.isGranted) {
          _onPermissionGranted();
        } else if (requestedStatus.isPermanentlyDenied) {
          setState(() {
            _permissionState = CameraPermissionState.permanentlyDenied;
          });
        } else {
          setState(() {
            _permissionState = CameraPermissionState.denied;
          });
        }
      }
    }
  }

  void _onPermissionGranted() {
    if (mounted) {
      setState(() {
        _permissionState = CameraPermissionState.granted;
      });
      _scannerController.start().catchError((error) {
        if (mounted) {
          setState(() {
            _permissionState = CameraPermissionState.error;
            _cameraErrorMessage = 'تعذر تشغيل الكاميرا: $error';
          });
        }
      });
    }
  }

  Future<void> _loadPendingQueueCount() async {
    final count = await _verificationService.getPendingQueueCount(widget.eventId);
    if (mounted) {
      setState(() {
        _pendingSyncCount = count;
      });
    }
  }

  Future<void> _triggerAutoSync() async {
    if (_isSyncing) return;

    setState(() {
      _isSyncing = true;
    });

    final synced = await _verificationService.syncOfflineScans(widget.eventId);
    final count = await _verificationService.getPendingQueueCount(widget.eventId);

    if (mounted) {
      setState(() {
        _pendingSyncCount = count;
        _isSyncing = false;
      });

      if (synced > 0) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('تمت مزامنة $synced عملية دخول بنجاح مع السيرفر!'),
            backgroundColor: const Color(0xFF0A3D24),
            duration: const Duration(seconds: 3),
          ),
        );
      }
    }
  }

  Future<void> _onDetect(BarcodeCapture capture) async {
    // Guard against multiple simultaneous scan invocations
    if (_isProcessing) return;

    final now = DateTime.now();
    if (now.difference(_lastScannedTimestamp).inMilliseconds < 1500) {
      return;
    }

    final barcodes = capture.barcodes;
    if (barcodes.isEmpty) return;

    final rawValue = barcodes.first.rawValue;
    if (rawValue == null || rawValue.trim().isEmpty) return;

    _lastScannedTimestamp = now;

    // Haptic Feedback for physical feedback
    try {
      HapticFeedback.mediumImpact();
    } catch (_) {}

    setState(() {
      _isProcessing = true;
    });

    // Pause scanner during verification
    await _scannerController.stop();

    // Extract clean token
    final cleanToken = QrTokenParser.extractToken(rawValue);

    if (cleanToken.isEmpty) {
      _navigateToResult(VerificationResultData.invalid(
        details: 'رمز الاستجابة السريعة فارغ أو غير مقروء.',
      ));
      return;
    }

    // Call Verification API
    final result = await _verificationService.verifyToken(
      eventId: widget.eventId,
      token: cleanToken,
      deviceInfo: 'Android/iOS Reception Terminal',
    );

    if (mounted) {
      _navigateToResult(result);
    }
  }

  void _navigateToResult(VerificationResultData result) {
    context.push('/result', extra: result).then((_) {
      // When returning from Result Screen ("مسح QR آخر"):
      if (mounted) {
        setState(() {
          _isProcessing = false;
        });
        _scannerController.start();
        _loadPendingQueueCount();
      }
    });
  }

  void _toggleTorch() async {
    try {
      await _scannerController.toggleTorch();
      setState(() {
        _isTorchOn = !_isTorchOn;
      });
    } catch (_) {}
  }

  void _switchCamera() async {
    try {
      await _scannerController.switchCamera();
    } catch (_) {}
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _scannerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B0E14),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0B0E14),
        elevation: 0,
        centerTitle: true,
        title: Text(
          widget.eventName,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(
              _pendingSyncCount > 0 ? Icons.sync_problem : Icons.cloud_done,
              color: _pendingSyncCount > 0 ? Colors.amber : const Color(0xFF25D366),
            ),
            onPressed: _triggerAutoSync,
            tooltip: 'حالة المزامنة',
          ),
        ],
      ),
      body: Stack(
        children: [
          // Body content based on permission & camera state
          _buildMainScannerBody(),

          // Top Connection / Sync Status Banner
          Positioned(
            top: 12,
            left: 16,
            right: 16,
            child: _buildStatusBar(),
          ),

          // Bottom Instruction Label
          if (_permissionState == CameraPermissionState.granted)
            const Positioned(
              bottom: 48,
              left: 24,
              right: 24,
              child: Text(
                'وجه المربع نحو رمز الاستجابة السريعة (QR Code) المتواجد على بطاقة الدعوة للتحقق الفوري',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  height: 1.4,
                ),
                textAlign: TextAlign.center,
              ),
            ),

          // Loading Verification Overlay
          if (_isProcessing)
            Container(
              color: Colors.black.withValues(alpha: 0.75),
              child: const Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircularProgressIndicator(
                      color: Color(0xFFD4AF37),
                      strokeWidth: 3.5,
                    ),
                    SizedBox(height: 20),
                    Text(
                      'جاري التحقق من الدعوة...',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildStatusBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.75),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white12),
      ),
      child: Row(
        children: [
          Icon(
            _pendingSyncCount > 0 ? Icons.wifi_off : Icons.wifi,
            size: 16,
            color: _pendingSyncCount > 0 ? Colors.amber : const Color(0xFF25D366),
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
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: Color(0xFFD4AF37),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildMainScannerBody() {
    switch (_permissionState) {
      case CameraPermissionState.checking:
        return const Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircularProgressIndicator(color: Color(0xFFD4AF37)),
              SizedBox(height: 16),
              Text(
                'جاري تشغيل الكاميرا...',
                style: TextStyle(color: Colors.white70, fontSize: 14),
              ),
            ],
          ),
        );

      case CameraPermissionState.denied:
        return Center(
          child: Padding(
            padding: const EdgeInsets.all(28.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.camera_alt_outlined,
                  size: 64,
                  color: Color(0xFFD4AF37),
                ),
                const SizedBox(height: 18),
                const Text(
                  'إذن الكاميرا مطلوب',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  'يحتاج تطبيق "دعوتك" إلى إذن استخدام الكاميرا لمسح بطاقات الدعوة والتحقق من الحضور.',
                  style: TextStyle(color: Colors.white70, fontSize: 13, height: 1.5),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFD4AF37),
                    foregroundColor: const Color(0xFF0B0E14),
                    padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: _checkAndRequestCameraPermission,
                  icon: const Icon(Icons.security),
                  label: const Text(
                    'السماح بالكاميرا',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                ),
              ],
            ),
          ),
        );

      case CameraPermissionState.permanentlyDenied:
        return Center(
          child: Padding(
            padding: const EdgeInsets.all(28.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.settings_suggest_outlined,
                  size: 64,
                  color: Colors.amber,
                ),
                const SizedBox(height: 18),
                const Text(
                  'تم تعطيل إذن الكاميرا',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  'تم رفض إذن الكاميرا بشكل دائم. يرجى فتح إعدادات الهاتف وتفعيل إذن الكاميرا للتطبيق.',
                  style: TextStyle(color: Colors.white70, fontSize: 13, height: 1.5),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFD4AF37),
                    foregroundColor: const Color(0xFF0B0E14),
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: () async {
                    await openAppSettings();
                  },
                  icon: const Icon(Icons.settings),
                  label: const Text(
                    'فتح إعدادات التطبيق',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                ),
              ],
            ),
          ),
        );

      case CameraPermissionState.error:
        return Center(
          child: Padding(
            padding: const EdgeInsets.all(28.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.error_outline,
                  size: 64,
                  color: Colors.redAccent,
                ),
                const SizedBox(height: 18),
                const Text(
                  'خطأ في تشغيل الكاميرا',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  _cameraErrorMessage ?? 'تعذر الاتصال بمستشعر الكاميرا على الجهاز.',
                  style: const TextStyle(color: Colors.white70, fontSize: 13),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFD4AF37),
                    foregroundColor: const Color(0xFF0B0E14),
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: _checkAndRequestCameraPermission,
                  icon: const Icon(Icons.refresh),
                  label: const Text(
                    'إعادة المحاولة',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                ),
              ],
            ),
          ),
        );

      case CameraPermissionState.granted:
        return Stack(
          children: [
            // Real Mobile Camera View
            MobileScanner(
              controller: _scannerController,
              onDetect: _onDetect,
              errorBuilder: (context, error, child) {
                return Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.videocam_off, size: 54, color: Colors.amber),
                        const SizedBox(height: 14),
                        const Text(
                          'تعذر عرض معاينة الكاميرا',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'خطأ: ${error.errorCode}',
                          style: const TextStyle(color: Colors.white54, fontSize: 12),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFD4AF37),
                            foregroundColor: Colors.black,
                          ),
                          onPressed: () => _scannerController.start(),
                          child: const Text('إعادة تشغيل الكاميرا'),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),

            // Sleek Scanner Frame & Animated Laser Overlay
            ScannerOverlay(
              scanAreaSize: 260.0,
              isTorchOn: _isTorchOn,
              onToggleTorch: _toggleTorch,
              onSwitchCamera: _switchCamera,
            ),
          ],
        );
    }
  }
}
