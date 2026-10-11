import 'package:json_annotation/json_annotation.dart';

part 'Light.g.dart';

/// A single controllable light (apps/client/.../models/Light.ts). Colour
/// channels use the gateway's uppercase JSON keys.
@JsonSerializable()
class Light {
  final int? id;
  final String? name;
  final int? bridgeId;
  final int? bridgePort;
  final bool? isActive;
  @JsonKey(name: 'R')
  final int? r;
  @JsonKey(name: 'G')
  final int? g;
  @JsonKey(name: 'B')
  final int? b;
  @JsonKey(name: 'BRI')
  final int? bri;

  Light({
    this.id,
    this.name,
    this.bridgeId,
    this.bridgePort,
    this.isActive,
    this.r,
    this.g,
    this.b,
    this.bri,
  });

  factory Light.fromJson(Map<String, dynamic> json) => _$LightFromJson(json);

  Map<String, dynamic> toJson() => _$LightToJson(this);
}
