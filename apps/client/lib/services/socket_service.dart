import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

import '../models/SignalKDataSet.dart';
import 'connection_service.dart';
import 'socket_channels.dart';

/// Flutter pendant to the Angular `SocketService` (apps/client/.../socket.service.ts):
/// opens a Socket.IO connection to the gateway and exposes per-channel broadcast
/// streams. The gateway broadcasts state changes (reload triggers and objects);
/// the UI subscribes to the channels it cares about.
class SocketService extends ChangeNotifier {
  SocketService(this._connection);

  final ConnectionService _connection;

  io.Socket? _socket;
  bool _connected = false;
  bool get isConnected => _connected;

  /// Lazily-created broadcast controllers keyed by channel name.
  final Map<String, StreamController<dynamic>> _controllers = {};

  /// Channels whose socket handler is currently attached. socket.io handlers
  /// persist across reconnects, so we attach each channel exactly once per
  /// socket instance to avoid duplicate deliveries (reset on reconnect).
  final Set<String> _attached = {};

  /// Returns (and starts forwarding) a broadcast stream for [channel].
  Stream<dynamic> on(String channel) {
    final controller = _controllers.putIfAbsent(
      channel,
      () => StreamController<dynamic>.broadcast(),
    );
    _attach(channel);
    return controller.stream;
  }

  void _attach(String channel) {
    final socket = _socket;
    if (socket == null || _attached.contains(channel)) return;
    final controller = _controllers[channel];
    if (controller == null) return;
    socket.on(channel, (data) => controller.add(data));
    _attached.add(channel);
  }

  /// Convenience: the vessel-wide night-mode state pushed by the gateway.
  Stream<bool> get onNightMode => on(SocketChannels.nightModeStateObject)
      .map((d) => d == true || d == 'true' || d == 1 || d == '1');

  /// Convenience: the 4s electrical SignalK broadcast.
  Stream<List<SignalKDataSet>> get onSignalKBroadcast =>
      on(SocketChannels.signalKBroadcastObject).map((data) {
        if (data is List) {
          return data
              .whereType<Map>()
              .map((e) =>
                  SignalKDataSet.fromJson(Map<String, dynamic>.from(e)))
              .toList();
        }
        return const <SignalKDataSet>[];
      });

  void connect() {
    final base = _connection.baseUrl;
    if (base == null) return;
    disconnect();

    final socket = io.io(
      base,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect() // we call connect() once ourselves
          .enableReconnection()
          .setExtraHeaders({'Authorization': _connection.deviceUuid ?? ''})
          .build(),
    );
    _socket = socket;
    _attached.clear();

    socket.onConnect((_) {
      debugPrint('[Socket] connected (${socket.id})');
      _connected = true;
      // Attach handlers for channels requested before connect. Handlers persist
      // across reconnects, so _attach() is a no-op for already-attached ones.
      for (final channel in _controllers.keys) {
        _attach(channel);
      }
      notifyListeners();
    });

    socket.onDisconnect((_) {
      debugPrint('[Socket] disconnected');
      _connected = false;
      notifyListeners();
    });

    socket.connect();
  }

  void disconnect() {
    _socket?.dispose();
    _socket = null;
    _connected = false;
    _attached.clear();
  }

  @override
  void dispose() {
    disconnect();
    for (final c in _controllers.values) {
      c.close();
    }
    super.dispose();
  }
}
