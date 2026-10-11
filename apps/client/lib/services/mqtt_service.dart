import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:mqtt_client/mqtt_client.dart';
import 'package:mqtt_client/mqtt_server_client.dart';

import 'connection_service.dart';

/// Live status of a Shelly switch (`<bridge>/status/switch:0` payload).
class ShellyStatus {
  final bool output;
  final double? current;
  final double? voltage;
  final double? apower;
  final double? total;

  ShellyStatus({
    required this.output,
    this.current,
    this.voltage,
    this.apower,
    this.total,
  });

  factory ShellyStatus.fromJson(Map<String, dynamic> j) => ShellyStatus(
        output: j['output'] == true,
        current: (j['current'] as num?)?.toDouble(),
        voltage: (j['voltage'] as num?)?.toDouble(),
        apower: (j['apower'] as num?)?.toDouble(),
        total: (j['aenergy'] is Map)
            ? (j['aenergy']['total'] as num?)?.toDouble()
            : null,
      );
}

/// Connects to the gateway's MQTT broker over WebSocket (aedes, port 8883) and
/// exposes the latest Shelly switch status per bridge name. Replaces the Angular
/// `ngx-mqtt` usage on the battery page.
class MqttService extends ChangeNotifier {
  MqttService(this._connection);

  final ConnectionService _connection;

  MqttServerClient? _client;
  final Map<String, ShellyStatus> _statuses = {};
  final Set<String> _bridges = {};

  ShellyStatus? statusOf(String bridgeName) => _statuses[bridgeName];

  bool get isConnected =>
      _client?.connectionStatus?.state == MqttConnectionState.connected;

  static String _topic(String bridgeName) => '$bridgeName/status/switch:0';

  Future<void> connect() async {
    final host = _hostWithoutPort;
    if (host == null) return;

    // MQTT 3.1 client ids are limited to 23 chars; the device UUID is far
    // longer, so derive a short unique id from its last segment.
    final uuid = _connection.deviceUuid ?? '';
    final shortId = uuid.contains('-') ? uuid.split('-').last : uuid;
    final clientId = 'ms_${shortId.isEmpty ? 'app' : shortId}';

    final client = MqttServerClient.withPort(
      'ws://$host',
      clientId,
      ConnectionService.mqttWsPort,
    );
    client.useWebSocket = true;
    client.websocketProtocols = MqttClientConstants.protocolsSingleDefault;
    client.setProtocolV311();
    client.logging(on: false);
    client.keepAlivePeriod = 30;
    client.autoReconnect = true;
    client.connectionMessage = MqttConnectMessage()
        .withClientIdentifier(clientId)
        .startClean();
    _client = client;

    try {
      await client.connect();
    } catch (e) {
      debugPrint('[MQTT] connect failed: $e');
      client.disconnect();
      return;
    }

    client.updates?.listen(_onMessages);
    // (Re)subscribe to any bridges requested before connect.
    for (final b in _bridges) {
      client.subscribe(_topic(b), MqttQos.atMostOnce);
    }
    notifyListeners();
  }

  /// Subscribes to a Shelly bridge's status topic.
  void subscribeBridge(String bridgeName) {
    if (bridgeName.isEmpty || !_bridges.add(bridgeName)) return;
    if (isConnected) {
      _client!.subscribe(_topic(bridgeName), MqttQos.atMostOnce);
    }
  }

  void _onMessages(List<MqttReceivedMessage<MqttMessage>> events) {
    for (final event in events) {
      final topic = event.topic;
      final bridge = topic.split('/status/switch:0').first;
      final recMess = event.payload as MqttPublishMessage;
      final payload = MqttPublishPayload.bytesToStringAsString(
          recMess.payload.message);
      try {
        final json = jsonDecode(payload) as Map<String, dynamic>;
        _statuses[bridge] = ShellyStatus.fromJson(json);
        notifyListeners();
      } catch (_) {
        // Ignore malformed payloads.
      }
    }
  }

  String? get _hostWithoutPort {
    final url = _connection.serverUrl;
    if (url == null || url.isEmpty) return null;
    return url.contains(':') ? url.split(':').first : url;
  }

  void disconnect() {
    _client?.disconnect();
    _client = null;
  }

  @override
  void dispose() {
    disconnect();
    super.dispose();
  }
}
