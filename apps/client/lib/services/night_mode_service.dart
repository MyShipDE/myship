import 'dart:async';

import 'package:flutter/foundation.dart';

import '../api/SystemApi.dart';
import 'socket_service.dart';

/// Tracks the vessel-wide night mode. Unlike DiLog's OS light/dark theme, this
/// is a server-synced state (`GET`/`PUT /nightmode` + the
/// `night_mode.state.object` socket channel). The theme uses one layout and
/// only swaps the seed colour blue↔red based on [isNight].
class NightModeService extends ChangeNotifier {
  NightModeService(this._api, this._socket);

  final SystemApi _api;
  final SocketService _socket;

  StreamSubscription<bool>? _sub;
  bool _isNight = false;

  bool get isNight => _isNight;

  /// Loads the current state and starts listening for live pushes.
  Future<void> init() async {
    try {
      final state = await _api.getNightMode();
      _apply(state.value ?? false);
    } catch (_) {
      // Keep default (day) if the gateway is unreachable.
    }
    _sub ??= _socket.onNightMode.listen(_apply);
  }

  /// Toggles the vessel-wide state (optimistic; reverts on failure).
  Future<void> setNightMode(bool value) async {
    final previous = _isNight;
    _apply(value);
    try {
      await _api.setNightMode(value);
    } catch (_) {
      _apply(previous);
    }
  }

  void _apply(bool value) {
    if (_isNight == value) return;
    _isNight = value;
    notifyListeners();
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }
}
