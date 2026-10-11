import 'package:dio/dio.dart';

import '../../../services/connection_service.dart';

/// Applies MyShip's request decoration on every call:
///  - resolves the base URL from the (onboarding-configured) [ConnectionService]
///    at request time, so changing the server at runtime takes effect without
///    rebuilding Dio;
///  - sends the device UUID as the `Authorization` header (the pairing
///    credential) and, if set, the `X-Gateway-Identifier`.
///
/// This replaces DiLog's cookie + CSRF scheme.
class AuthInterceptor extends Interceptor {
  AuthInterceptor(this._connection);

  final ConnectionService _connection;

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final base = _connection.baseUrl;
    if (base != null) {
      options.baseUrl = base;
    }

    final uuid = _connection.deviceUuid;
    if (uuid != null && uuid.isNotEmpty) {
      options.headers['Authorization'] = uuid;
    }

    final gateway = _connection.gatewayIdentifier;
    if (gateway != null && gateway.isNotEmpty) {
      options.headers['X-Gateway-Identifier'] = gateway;
    }

    super.onRequest(options, handler);
  }
}
