import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class NetworkClient {
  final Dio dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  static String getDefaultBaseUrl() {
    return 'https://daawatak.onrender.com/api/v1';
  }

  NetworkClient({String? baseUrl})
      : dio = Dio(BaseOptions(
          baseUrl: baseUrl ?? getDefaultBaseUrl(),
          connectTimeout: const Duration(seconds: 30),
          receiveTimeout: const Duration(seconds: 30),
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        )) {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final customUrl = await _storage.read(key: 'custom_api_url');
          if (customUrl != null && customUrl.isNotEmpty) {
            options.baseUrl = customUrl;
          }
          final token = await _storage.read(key: 'auth_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) {
          return handler.next(e);
        },
      ),
    );
  }
}

