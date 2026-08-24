import 'package:go_router/go_router.dart';
import '../features/auth/login_screen.dart';
import '../features/events/event_list_screen.dart';
import '../features/scanner/scanner_screen.dart';
import '../features/scanner/verification_result_screen.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/login',
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/events',
        builder: (context, state) => const EventListScreen(),
      ),
      GoRoute(
        path: '/scan',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>;
          return ScannerScreen(
            eventId: extra['eventId'] as String,
            eventName: extra['eventName'] as String,
          );
        },
      ),
      GoRoute(
        path: '/result',
        builder: (context, state) {
          final result = state.extra as String; // ACCEPTED, ALREADY_USED, EXPIRED, INVALID
          return VerificationResultScreen(result: result);
        },
      ),
    ],
  );
}
