import 'dart:convert';

class QrTokenParser {
  /// Extracts the clean verification token from raw barcode payload.
  /// Supports raw token strings, URL queries, path segments, and JSON payloads.
  static String extractToken(String rawData) {
    final trimmed = rawData.trim();
    if (trimmed.isEmpty) return '';

    // 1. Check if the QR code is an HTTP/HTTPS URL
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        final uri = Uri.parse(trimmed);

        // Check common query parameters: token, t, qr, code, key
        if (uri.queryParameters.containsKey('token') && uri.queryParameters['token']!.isNotEmpty) {
          return uri.queryParameters['token']!;
        }
        if (uri.queryParameters.containsKey('t') && uri.queryParameters['t']!.isNotEmpty) {
          return uri.queryParameters['t']!;
        }
        if (uri.queryParameters.containsKey('qr') && uri.queryParameters['qr']!.isNotEmpty) {
          return uri.queryParameters['qr']!;
        }
        if (uri.queryParameters.containsKey('code') && uri.queryParameters['code']!.isNotEmpty) {
          return uri.queryParameters['code']!;
        }

        // Check path segments like /invitations/{token} or /checkin/{token}
        if (uri.pathSegments.isNotEmpty) {
          final lastSegment = uri.pathSegments.last;
          if (lastSegment.isNotEmpty &&
              lastSegment != 'preview' &&
              lastSegment != 'verify' &&
              lastSegment != 'checkin') {
            return lastSegment;
          }
        }
      } catch (_) {}
    }

    // 2. Check if the QR code is a JSON payload
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        final decoded = jsonDecode(trimmed);
        if (decoded is Map<String, dynamic>) {
          final token = decoded['token'] ??
              decoded['qr_token'] ??
              decoded['code'] ??
              decoded['plain_token'] ??
              decoded['id'];
          if (token != null && token.toString().isNotEmpty) {
            return token.toString().trim();
          }
        }
      } catch (_) {}
    }

    // 3. Fallback: Return the raw token as is
    return trimmed;
  }
}
