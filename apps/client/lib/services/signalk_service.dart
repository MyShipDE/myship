import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter/foundation.dart';

import 'connection_service.dart';

/// Streams live SignalK data from the gateway's SignalK server
/// (`ws://<host>:3000/signalk/v1/stream?subscribe=all`). Replaces the Angular
/// `signalk-client-angular` wrapper (apps/client/.../SignalK.Service.ts):
/// parses `updates[].values[] {path, value}` into a flat latest-value map and
/// notifies listeners on each change.
class SignalKService extends ChangeNotifier {
  SignalKService(this._connection);

  final ConnectionService _connection;

  WebSocket? _socket;
  bool _connected = false;
  bool _disposed = false;
  Timer? _reconnectTimer;

  bool get isConnected => _connected;

  final Map<String, dynamic> _values = {};

  /// Latest value per SignalK path (unmodifiable view).
  Map<String, dynamic> get values => Map.unmodifiable(_values);

  dynamic value(String path) => _values[path];

  num? number(String path) {
    final v = _values[path];
    return v is num ? v : null;
  }

  /// Returns the first non-null value among [paths]. MyShip's navigation paths
  /// are emitted under a custom `position-lights.*` prefix on some gateways and
  /// the standard `navigation.*` on others, so callers pass both candidates.
  dynamic firstValue(List<String> paths) {
    for (final p in paths) {
      final v = _values[p];
      if (v != null) return v;
    }
    return null;
  }

  num? firstNumber(List<String> paths) {
    final v = firstValue(paths);
    return v is num ? v : null;
  }

  Future<void> connect() async {
    if (_disposed) return;
    final host = _hostWithoutPort;
    if (host == null) return;

    final url = 'ws://$host:${ConnectionService.signalKPort}'
        '/signalk/v1/stream?subscribe=all';
    try {
      final socket = await WebSocket.connect(url);
      _socket = socket;
      _connected = true;
      notifyListeners();
      debugPrint('[SignalK] connected to $url');

      socket.listen(
        _onMessage,
        onDone: _scheduleReconnect,
        onError: (_) => _scheduleReconnect(),
        cancelOnError: true,
      );
    } catch (e) {
      debugPrint('[SignalK] connect failed: $e');
      _scheduleReconnect();
    }
  }

  void _onMessage(dynamic raw) {
    try {
      final decoded = jsonDecode(raw as String);
      final updates = decoded is Map ? decoded['updates'] : null;
      if (updates is! List) return;

      var changed = false;
      for (final update in updates) {
        final vals = update is Map ? update['values'] : null;
        if (vals is! List) continue;
        for (final v in vals) {
          if (v is Map && v['path'] is String) {
            _values[v['path'] as String] = v['value'];
            changed = true;
          }
        }
      }
      if (changed) notifyListeners();
    } catch (e) {
      // Ignore malformed frames (e.g. the initial hello message).
    }
  }

  void _scheduleReconnect() {
    _connected = false;
    _socket = null;
    notifyListeners();
    if (_disposed) return;
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(const Duration(seconds: 3), connect);
  }

  String? get _hostWithoutPort {
    final url = _connection.serverUrl;
    if (url == null || url.isEmpty) return null;
    return url.contains(':') ? url.split(':').first : url;
  }

  void disconnect() {
    _reconnectTimer?.cancel();
    _socket?.close();
    _socket = null;
    _connected = false;
  }

  @override
  void dispose() {
    _disposed = true;
    disconnect();
    super.dispose();
  }
}
