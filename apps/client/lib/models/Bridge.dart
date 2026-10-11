import 'package:json_annotation/json_annotation.dart';

part 'Bridge.g.dart';

/// A hardware bridge/controller (apps/client/.../models/Bridge.ts). `name` is
/// also the MQTT topic prefix for Shelly devices (`<name>/status/switch:0`).
@JsonSerializable()
class Bridge {
  final int? id;
  final String? name;
  final String? ip;

  Bridge({this.id, this.name, this.ip});

  factory Bridge.fromJson(Map<String, dynamic> json) => _$BridgeFromJson(json);

  Map<String, dynamic> toJson() => _$BridgeToJson(this);
}
