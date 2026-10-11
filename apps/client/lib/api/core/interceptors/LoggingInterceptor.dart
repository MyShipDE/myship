import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

/// Lightweight request/response logger (debug builds only).
class LoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (kDebugMode) {
      debugPrint('[HTTP →] ${options.method} ${options.uri}');
    }
    super.onRequest(options, handler);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    if (kDebugMode) {
      debugPrint(
          '[HTTP ←] ${response.statusCode} ${response.requestOptions.uri}');
    }
    super.onResponse(response, handler);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (kDebugMode) {
      debugPrint(
          '[HTTP ✗] ${err.response?.statusCode ?? '-'} ${err.requestOptions.uri} :: ${err.message}');
    }
    super.onError(err, handler);
  }
}
