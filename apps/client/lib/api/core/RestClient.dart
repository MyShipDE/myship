import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../../services/connection_service.dart';
import 'interceptors/AuthInterceptor.dart';
import 'interceptors/ErrorInterceptor.dart';
import 'interceptors/LoggingInterceptor.dart';

part 'RestClient.g.dart';

/// Shared base for all retrofit API classes (mirrors DiLog's RestClient).
/// Each domain API (SystemApi, LightsApi, …) extends this and declares its
/// endpoints with retrofit annotations.
@RestApi()
abstract class RestClient {
  factory RestClient(Dio dio, {String? baseUrl}) = _RestClient;

  /// Builds the single shared Dio instance. The base URL is resolved per
  /// request by [AuthInterceptor] from [connection], since MyShip configures it
  /// during onboarding rather than at build time.
  static Dio createDio(ConnectionService connection) {
    final dio = Dio(BaseOptions(
      baseUrl: connection.baseUrl ?? '',
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 60),
      sendTimeout: const Duration(seconds: 120),
    ));

    dio.interceptors.add(AuthInterceptor(connection));
    // LoggingInterceptor added before ErrorInterceptor so it logs the raw error.
    dio.interceptors.add(LoggingInterceptor());
    dio.interceptors.add(ErrorInterceptor());

    return dio;
  }
}
