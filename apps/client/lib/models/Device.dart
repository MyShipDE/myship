import 'package:json_annotation/json_annotation.dart';

import 'Bridge.dart';

part 'Device.g.dart';

/// An onboard device/consumer (apps/client/.../models/Device.ts). Keeps the
/// gateway's uppercase keys for the security-block / voltage fields.
@JsonSerializable()
class Device {
  final int? id;
  final String? name;
  final String? identifier;
  final String? type;
  final bool? isActive;
  final bool? isHidden;
  final bool? error;
  final Bridge? bridge;
  final int? bridgePort;
  @JsonKey(name: 'SecurityBlock')
  final int? securityBlock;
  @JsonKey(name: 'SecurityBlockPort')
  final int? securityBlockPort;
  @JsonKey(name: 'SecurityBlockAmpere')
  final int? securityBlockAmpere;
  @JsonKey(name: 'Voltage')
  final String? voltage;
  final String? notes;

  Device({
    this.id,
    this.name,
    this.identifier,
    this.type,
    this.isActive,
    this.isHidden,
    this.error,
    this.bridge,
    this.bridgePort,
    this.securityBlock,
    this.securityBlockPort,
    this.securityBlockAmpere,
    this.voltage,
    this.notes,
  });

  factory Device.fromJson(Map<String, dynamic> json) => _$DeviceFromJson(json);

  Map<String, dynamic> toJson() => _$DeviceToJson(this);
}
