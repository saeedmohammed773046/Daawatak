import 'package:flutter/material.dart';

class ScannerOverlay extends StatefulWidget {
  final double scanAreaSize;
  final VoidCallback? onToggleTorch;
  final VoidCallback? onSwitchCamera;
  final bool isTorchOn;

  const ScannerOverlay({
    super.key,
    this.scanAreaSize = 260.0,
    this.onToggleTorch,
    this.onSwitchCamera,
    this.isTorchOn = false,
  });

  @override
  State<ScannerOverlay> createState() => _ScannerOverlayState();
}

class _ScannerOverlayState extends State<ScannerOverlay>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _laserAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2200),
    )..repeat(reverse: true);

    _laserAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.easeInOut,
      ),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final scanSize = widget.scanAreaSize;

    return Stack(
      children: [
        // Dark cutout overlay
        ColorFiltered(
          colorFilter: ColorFilter.mode(
            Colors.black.withValues(alpha: 0.72),
            BlendMode.srcOut,
          ),
          child: Stack(
            fit: StackFit.expand,
            children: [
              Container(
                decoration: const BoxDecoration(
                  color: Colors.black,
                  backgroundBlendMode: BlendMode.dstOut,
                ),
              ),
              Center(
                child: Container(
                  width: scanSize,
                  height: scanSize,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                  ),
                ),
              ),
            ],
          ),
        ),

        // Golden Frame & Glowing Corners
        Center(
          child: Container(
            width: scanSize,
            height: scanSize,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: const Color(0xFFD4AF37),
                width: 2.5,
              ),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFD4AF37).withValues(alpha: 0.25),
                  blurRadius: 16,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(22),
              child: Stack(
                children: [
                  // Animated Scanning Laser Line
                  AnimatedBuilder(
                    animation: _laserAnimation,
                    builder: (context, child) {
                      return Positioned(
                        top: _laserAnimation.value * (scanSize - 20),
                        left: 8,
                        right: 8,
                        child: Container(
                          height: 3,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [
                                Colors.transparent,
                                Color(0xFFFFE082),
                                Color(0xFFD4AF37),
                                Color(0xFFFFE082),
                                Colors.transparent,
                              ],
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFFD4AF37).withValues(alpha: 0.8),
                                blurRadius: 10,
                                spreadRadius: 2,
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        ),

        // Quick Controls (Torch & Camera Switch) on top right/left of scan box
        Positioned(
          bottom: (size.height / 2) + (scanSize / 2) + 16,
          left: 0,
          right: 0,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (widget.onToggleTorch != null)
                Container(
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.6),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white24, width: 1),
                  ),
                  child: IconButton(
                    icon: Icon(
                      widget.isTorchOn ? Icons.flash_on : Icons.flash_off,
                      color: widget.isTorchOn ? const Color(0xFFD4AF37) : Colors.white70,
                      size: 22,
                    ),
                    onPressed: widget.onToggleTorch,
                    tooltip: 'الفلاش',
                  ),
                ),
              if (widget.onToggleTorch != null && widget.onSwitchCamera != null)
                const SizedBox(width: 20),
              if (widget.onSwitchCamera != null)
                Container(
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.6),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white24, width: 1),
                  ),
                  child: IconButton(
                    icon: const Icon(
                      Icons.cameraswitch_outlined,
                      color: Colors.white70,
                      size: 22,
                    ),
                    onPressed: widget.onSwitchCamera,
                    tooltip: 'تبديل الكاميرا',
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}
