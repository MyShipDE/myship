import '../api/SystemApi.dart';

/// Pairing/authentication against the gateway. Mirrors the Angular
/// `AuthService` (apps/client/.../auth.service.ts): the device UUID (sent by
/// [AuthInterceptor]) is the credential; `/login` pairs it with a PIN and
/// `/client` validates it.
class AuthService {
  AuthService(this._api);

  final SystemApi _api;

  /// Reachability probe used by onboarding (`GET /test`).
  Future<bool> tryConnect() async {
    try {
      await _api.test();
      return true;
    } catch (_) {
      return false;
    }
  }

  /// Pairs this device with the gateway using the entered PIN/token.
  Future<bool> login(String token) async {
    try {
      await _api.login(token);
      return true;
    } catch (_) {
      return false;
    }
  }

  /// True if this device is paired/authorised (`GET /client` returns 200).
  Future<bool> checkAuth() async {
    try {
      await _api.getClient();
      return true;
    } catch (_) {
      return false;
    }
  }
}
