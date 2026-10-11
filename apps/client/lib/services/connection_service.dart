import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Holds the onboarding-configured connection state: the gateway server URL and
/// this device's persistent identifier. This is the MyShip equivalent of the
/// Angular client's `localStorage` keys `MyShip.ServerUrl` / `MyShip.Client.UID`
/// (see apps/client/src/app/client-sdk/services/http.service.ts).
///
/// Unlike DiLog (hardcoded backend URL), MyShip configures the URL at first run,
/// so the Dio base URL is derived from here at request time.
class ConnectionService extends ChangeNotifier {
  static const _keyServerUrl = 'MyShip.ServerUrl';
  static const _keyDeviceUuid = 'MyShip.Client.UID';
  static const _keyGatewayId = 'MyShip.GatewayIdentifier';

  /// Plain HTTP today, matching the Angular client (`HttpService.protocol`).
  static const String protocol = 'http://';

  /// SignalK stream port (server default, see apps/server .env SIGNALK_PORT).
  static const int signalKPort = 3000;

  /// MQTT-over-WebSocket port (see apps/server/src/app.ts).
  static const int mqttWsPort = 8883;

  String? _serverUrl;
  String? _deviceUuid;
  String? _gatewayIdentifier;

  /// The configured gateway host (and optional port), e.g. `127.0.0.1` or
  /// `boat.local:80`. Null until onboarding completes.
  String? get serverUrl => _serverUrl;

  /// Stable per-device identifier sent as the `Authorization` header. This IS
  /// the credential the gateway pairs against — not a JWT.
  String? get deviceUuid => _deviceUuid;

  /// Optional multi-gateway selector (`X-Gateway-Identifier`).
  String? get gatewayIdentifier => _gatewayIdentifier;

  bool get isConfigured => _serverUrl != null && _serverUrl!.isNotEmpty;

  /// Base URL for REST requests, e.g. `http://127.0.0.1`.
  String? get baseUrl => isConfigured ? '$protocol$_serverUrl' : null;

  /// Loads persisted state and guarantees a device UUID exists.
  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    _serverUrl = prefs.getString(_keyServerUrl);
    _gatewayIdentifier = prefs.getString(_keyGatewayId);

    _deviceUuid = prefs.getString(_keyDeviceUuid);
    if (_deviceUuid == null || _deviceUuid!.isEmpty) {
      _deviceUuid = _generateDeviceUuid();
      await prefs.setString(_keyDeviceUuid, _deviceUuid!);
    }
    notifyListeners();
  }

  Future<void> setServerUrl(String? url) async {
    _serverUrl = (url == null || url.trim().isEmpty) ? null : url.trim();
    final prefs = await SharedPreferences.getInstance();
    if (_serverUrl == null) {
      await prefs.remove(_keyServerUrl);
    } else {
      await prefs.setString(_keyServerUrl, _serverUrl!);
    }
    notifyListeners();
  }

  Future<void> setGatewayIdentifier(String? identifier) async {
    _gatewayIdentifier = identifier;
    final prefs = await SharedPreferences.getInstance();
    if (identifier == null || identifier.isEmpty) {
      await prefs.remove(_keyGatewayId);
    } else {
      await prefs.setString(_keyGatewayId, identifier);
    }
    notifyListeners();
  }

  /// Clears the configured server (used by onboarding "reset"); keeps the
  /// device UUID so re-pairing to the same gateway stays recognisable.
  Future<void> reset() async {
    await setServerUrl(null);
    await setGatewayIdentifier(null);
  }

  /// Replicates the Angular `HttpService.getID()` format
  /// (`<8>-<16>-<12>` from charset A-Z0-9) to keep gateway compatibility.
  static String _generateDeviceUuid() =>
      '${_random(8)}-${_random(16)}-${_random(12)}';

  static final Random _rng = Random.secure();

  static String _random(int length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return String.fromCharCodes(Iterable.generate(
      length,
      (_) => chars.codeUnitAt(_rng.nextInt(chars.length)),
    ));
  }
}
