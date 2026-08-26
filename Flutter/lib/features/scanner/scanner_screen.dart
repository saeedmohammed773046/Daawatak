import 'dart:async';
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

enum CameraFailureType {
  none,
  permissionError,
  cameraBusy,
  cameraUnavailable,
  initializationError,
  genericError,
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
  
  // Single Controller instance per scanner lifecycle
  MobileScannerController? _controller;

  CameraPermissionState _permissionState = CameraPermissionState.checking;
  CameraFailureType _failureType = CameraFailureType.none;
  String? _detailedErrorMessage;
  
  bool _isProcessing = false;
  bool _isTorchOn = false;
  bool _isRestarting = false;
  double _currentZoom = 0.0;
  DateTime _lastScannedTimestamp = DateTime.fromMillisecondsSinceEpoch(0);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _checkAndRequestCameraPermission();
  }

  /// Create and configure the single MobileScannerController
  void _createController() {
    _disposeController();

    _controller = MobileScannerController(
      detectionSpeed: DetectionSpeed.noDuplicates,
      facing: CameraFacing.back,
      torchEnabled: false,
      autoStart: true,
      formats: const [BarcodeFormat.qrCode],
    );
  }

  void _disposeController() {
    try {
      _controller?.dispose();
    } catch (e) {
      debugPrint('[ScannerScreen] Error disposing controller: $e');
    }
    _controller = null;
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (_permissionState != CameraPermissionState.granted) {
      // If returning from OS App Settings, re-check permission automatically
      if (state == AppLifecycleState.resumed) {
        _checkAndRequestCameraPermission(silent: true);
      }
      return;
    }

    if (state == AppLifecycleState.resumed) {
      if (!_isProcessing && !_isRestarting && _controller != null) {
        _controller?.start().catchError((e) {
          debugPrint('[ScannerScreen] Resume start error: $e');
        });
      }
    } else if (state == AppLifecycleState.inactive || state == AppLifecycleState.paused) {
      _controller?.stop().catchError((e) {
        debugPrint('[ScannerScreen] Pause stop error: $e');
      });
    }
  }

  /// Production-Ready Permission Check & Request Workflow
  Future<void> _checkAndRequestCameraPermission({bool silent = false}) async {
    if (!silent) {
      setState(() {
        _permissionState = CameraPermissionState.checking;
        _failureType = CameraFailureType.none;
        _detailedErrorMessage = null;
      });
    }

    try {
      final status = await Permission.camera.status;

      if (status.isGranted) {
        _onPermissionGranted();
      } else if (status.isPermanentlyDenied || status.isRestricted) {
        if (mounted) {
          setState(() {
            _permissionState = CameraPermissionState.permanentlyDenied;
            _failureType = CameraFailureType.permissionError;
          });
        }
      } else {
        final requested = await Permission.camera.request();
        if (mounted) {
          if (requested.isGranted) {
            _onPermissionGranted();
          } else if (requested.isPermanentlyDenied) {
            setState(() {
              _permissionState = CameraPermissionState.permanentlyDenied;
              _failureType = CameraFailureType.permissionError;
            });
          } else {
            setState(() {
              _permissionState = CameraPermissionState.denied;
              _failureType = CameraFailureType.permissionError;
            });
          }
        }
      }
    } catch (e, stackTrace) {
      debugPrint('[ScannerScreen] Permission Exception: $e\n$stackTrace');
      if (mounted) {
        setState(() {
          _permissionState = CameraPermissionState.error;
          _failureType = CameraFailureType.initializationError;
          _detailedErrorMessage = e.toString();
        });
      }
    }
  }

  void _onPermissionGranted() {
    if (mounted) {
      _createController();
      setState(() {
        _permissionState = CameraPermissionState.granted;
        _failureType = CameraFailureType.none;
        _detailedErrorMessage = null;
      });
    }
  }

  /// Robust Restart System (Prevents Race Conditions)
  Future<void> _restartScanner() async {
    if (_isRestarting) return;
    _isRestarting = true;

    setState(() {
      _permissionState = CameraPermissionState.checking;
      _failureType = CameraFailureType.none;
      _detailedErrorMessage = null;
    });

    try {
      await _controller?.stop();
    } catch (_) {}

    _disposeController();
    await Future.delayed(const Duration(milliseconds: 350));

    if (mounted) {
      await _checkAndRequestCameraPermission();
    }
    _isRestarting = false;
  }

  /// Classify native & plugin errors for precise diagnostic feedback
  void _handleScannerError(MobileScannerException error) {
    debugPrint('[ScannerScreen] MobileScannerException: ${error.errorCode} - ${error.errorDetails?.message}');

    CameraFailureType type = CameraFailureType.genericError;
    String message = 'حدث خطأ غير متوقع أثناء تشغيل الكاميرا.';

    switch (error.errorCode) {
      case MobileScannerErrorCode.permissionDenied:
        type = CameraFailureType.permissionError;
        message = 'صلاحية الكاميرا غير مفعلة في نظام الهاتف.';
        break;
      case MobileScannerErrorCode.unsupported:
        type = CameraFailureType.cameraUnavailable;
        message = 'كاميرا الجهاز غير مدعومة أو غير متوفرة.';
        break;
      case MobileScannerErrorCode.controllerAlreadyInitialized:
      case MobileScannerErrorCode.controllerDisposed:
        type = CameraFailureType.initializationError;
        message = 'تعذر تهيئة مشغل الكاميرا بنجاح.';
        break;
      case MobileScannerErrorCode.genericError:
      default:
        type = CameraFailureType.genericError;
        message = error.errorDetails?.message ?? 'تعذر بدء بث الكاميرا (يرجى التحقق من عدم استخدام الكاميرا من تطبيق آخر).';
        break;
    }

    if (mounted) {
      setState(() {
        _failureType = type;
        _detailedErrorMessage = message;
      });
    }
  }

  /// Handle QR Detection strictly and atomically
  Future<void> _onDetect(BarcodeCapture capture) async {
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

    // Instant Audio & Haptic Feedback on scan
    try {
      SystemSound.play(SystemSoundType.click);
      HapticFeedback.mediumImpact();
    } catch (_) {}

    setState(() {
      _isProcessing = true;
    });

    // Pause camera during server verification
    try {
      await _controller?.stop();
    } catch (_) {}

    final cleanToken = QrTokenParser.extractToken(rawValue);

    if (cleanToken.isEmpty) {
      _navigateToResult(VerificationResultData.invalid(
        details: 'رمز الاستجابة السريعة فارغ أو غير مقروء.',
      ));
      return;
    }

    // Call Verification API strictly online
    final result = await _verificationService.verifyToken(
      eventId: widget.eventId,
      token: cleanToken,
      deviceInfo: 'Android Reception Terminal',
    );

    if (mounted) {
      _navigateToResult(result);
    }
  }

  void _navigateToResult(VerificationResultData result) {
    context.push('/result', extra: result).then((_) {
      if (mounted) {
        setState(() {
          _isProcessing = false;
        });
        Future.delayed(const Duration(milliseconds: 250), () {
          if (mounted && !_isProcessing && _controller != null) {
            _controller?.start().catchError((e) {
              debugPrint('[ScannerScreen] Restart after result error: $e');
            });
          }
        });
      }
    });
  }

  Future<void> _toggleTorch() async {
    if (_controller == null) return;
    try {
      await _controller!.toggleTorch();
      setState(() {
        _isTorchOn = !_isTorchOn;
      });
    } catch (e) {
      debugPrint('[ScannerScreen] Toggle torch error: $e');
    }
  }

  Future<void> _switchCamera() async {
    if (_controller == null) return;
    try {
      await _controller!.switchCamera();
    } catch (e) {
      debugPrint('[ScannerScreen] Switch camera error: $e');
    }
  }

  Future<void> _setZoom(double zoom) async {
    if (_controller == null) return;
    try {
      await _controller!.setZoomScale(zoom);
      setState(() {
        _currentZoom = zoom;
      });
    } catch (e) {
      debugPrint('[ScannerScreen] Set zoom error: $e');
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _disposeController();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B0E14),
      appBar: AppBar(
        backgroundColor: const Color(0xFF10131B),
        elevation: 0,
        centerTitle: false,
        title: Row(
          children: [
            Image.asset(
              'assets/images/logo_vertical_transparent.png',
              height: 32,
              fit: BoxFit.contain,
              errorBuilder: (_, __, ___) => const SizedBox.shrink(),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.eventName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const Text(
                    'مسح وتحقق فوري (Daawatak)',
                    style: TextStyle(
                      color: Color(0xFFD4AF37),
                      fontSize: 10,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(
              Icons.cloud_done,
              color: Color(0xFF25D366),
              size: 20,
            ),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('الخادم متصل — التحقق مباشر وآمن'),
                  backgroundColor: Color(0xFF0A3D24),
                  duration: Duration(seconds: 2),
                ),
              );
            },
            tooltip: 'حالة الاتصال بالسيرفر',
          ),
        ],
      ),
      body: Stack(
        children: [
          // Main Camera / Permission Body
          _buildBody(),

          // Top Connection Status Banner
          Positioned(
            top: 12,
            left: 16,
            right: 16,
            child: _buildStatusBar(),
          ),

          // Zoom control slider (when camera is live)
          if (_permissionState == CameraPermissionState.granted && _failureType == CameraFailureType.none)
            Positioned(
              bottom: 90,
              left: 32,
              right: 32,
              child: Row(
                children: [
                  const Icon(Icons.zoom_out, color: Color(0xFFD4AF37), size: 18),
                  Expanded(
                    child: SliderTheme(
                      data: SliderTheme.of(context).copyWith(
                        activeTrackColor: const Color(0xFFD4AF37),
                        inactiveTrackColor: Colors.white24,
                        thumbColor: const Color(0xFFD4AF37),
                        thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
                        overlayShape: const RoundSliderOverlayShape(overlayRadius: 12),
                      ),
                      child: Slider(
                        value: _currentZoom,
                        min: 0.0,
                        max: 1.0,
                        onChanged: _setZoom,
                      ),
                    ),
                  ),
                  const Icon(Icons.zoom_in, color: Color(0xFFD4AF37), size: 18),
                ],
              ),
            ),

          // Bottom Instruction Label
          if (_permissionState == CameraPermissionState.granted && _failureType == CameraFailureType.none)
            const Positioned(
              bottom: 36,
              left: 24,
              right: 24,
              child: Text(
                'وجه المربع نحو رمز الاستجابة السريعة (QR Code) المتواجد على بطاقة الدعوة للتحقق الفوري',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 13,
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
                      'جاري التحقق من الدعوة عبر السيرفر...',
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
        color: Colors.black.withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white12),
      ),
      child: const Row(
        children: [
          Icon(
            Icons.wifi,
            size: 16,
            color: Color(0xFF25D366),
          ),
          SizedBox(width: 8),
          Expanded(
            child: Text(
              'متصل بالسيرفر — المزامنة فورية',
              style: TextStyle(color: Colors.white, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBody() {
    switch (_permissionState) {
      case CameraPermissionState.checking:
        return const Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircularProgressIndicator(color: Color(0xFFD4AF37)),
              SizedBox(height: 16),
              Text(
                'جاري تهيئة الكاميرا...',
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
                  'نحتاج إلى الوصول إلى الكاميرا لمسح رمز QR',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 10),
                const Text(
                  'يحتاج تطبيق "دعوتك" إلى إذن الكاميرا لمسح بطاقات الدعوة والتحقق من الحضور.',
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
                  onPressed: () => _checkAndRequestCameraPermission(),
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
                  'تم منع الوصول إلى الكاميرا',
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
                  _detailedErrorMessage ?? 'تعذر الاتصال بمستشعر الكاميرا على الجهاز.',
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
                  onPressed: _restartScanner,
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
        if (_controller == null) {
          return const Center(child: CircularProgressIndicator(color: Color(0xFFD4AF37)));
        }

        return Stack(
          fit: StackFit.expand,
          children: [
            // Live Camera View
            MobileScanner(
              controller: _controller,
              onDetect: _onDetect,
              fit: BoxFit.cover,
              errorBuilder: (context, error, child) {
                _handleScannerError(error);
                return Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.videocam_off, size: 54, color: Color(0xFFD4AF37)),
                        const SizedBox(height: 14),
                        const Text(
                          'تعذر تشغيل الكاميرا',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 17),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _detailedErrorMessage ?? 'رمز الخطأ: ${error.errorCode.name}',
                          style: const TextStyle(color: Colors.white70, fontSize: 12),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 18),
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFD4AF37),
                            foregroundColor: Colors.black,
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          onPressed: _restartScanner,
                          icon: const Icon(Icons.refresh, size: 18),
                          label: const Text('إعادة تشغيل الكاميرا', style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),

            // Live Scanner Overlay with Gold Frame, Animated Laser, Torch & Switch buttons
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
