import 'package:dio/dio.dart';
import '../../../core/network_client.dart';
import '../models/verification_result.dart';

class ReceptionVerificationService {
  final NetworkClient _networkClient;

  ReceptionVerificationService({NetworkClient? networkClient})
      : _networkClient = networkClient ?? NetworkClient();

  /// Verify a scanned token with the backend API
  Future<VerificationResultData> verifyToken({
    required String eventId,
    required String token,
    String deviceInfo = 'Receptionist Scanner Terminal',
  }) async {
    try {
      final response = await _networkClient.dio.post(
        '/reception/verify',
        data: {
          'event_id': eventId,
          'token': token,
          'device_info': deviceInfo,
        },
      );

      if (response.data is Map<String, dynamic> && response.data['success'] == true) {
        final data = response.data['data'] as Map<String, dynamic>? ?? {};
        return VerificationResultData.fromApiResponse(data);
      } else {
        final msg = response.data?['message']?.toString();
        return VerificationResultData.invalid(details: msg);
      }
    } on DioException catch (dioErr) {
      // Handle HTTP errors returned from backend
      if (dioErr.response?.data is Map<String, dynamic>) {
        final errData = dioErr.response!.data as Map<String, dynamic>;
        final message = errData['message']?.toString() ?? 'فشل التحقق من الرمز';
        return VerificationResultData(
          status: 'INVALID',
          message: 'رمز غير صالح أو حدث خطأ',
          details: message,
        );
      }

      // Offline / Network disconnect: DO NOT grant entry. Show connection error.
      return VerificationResultData(
        status: 'NETWORK_ERROR',
        message: 'تعذر التحقق من الدعوة',
        details: 'لا يوجد اتصال بالإنترنت أو الخادم غير متاح حالياً. تم منع الدخول لضمان عدم تكرار استخدام نفس الدعوة.',
      );
    } catch (e) {
      return VerificationResultData(
        status: 'NETWORK_ERROR',
        message: 'تعذر التحقق من الدعوة',
        details: 'حدث خطأ أثناء الاتصال بالخادم: $e',
      );
    }
  }
}
