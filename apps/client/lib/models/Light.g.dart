// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'Light.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Light _$LightFromJson(Map<String, dynamic> json) => Light(
  id: (json['id'] as num?)?.toInt(),
  name: json['name'] as String?,
  bridgeId: (json['bridgeId'] as num?)?.toInt(),
  bridgePort: (json['bridgePort'] as num?)?.toInt(),
  isActive: json['isActive'] as bool?,
  r: (json['R'] as num?)?.toInt(),
  g: (json['G'] as num?)?.toInt(),
  b: (json['B'] as num?)?.toInt(),
  bri: (json['BRI'] as num?)?.toInt(),
);

Map<String, dynamic> _$LightToJson(Light instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'bridgeId': instance.bridgeId,
  'bridgePort': instance.bridgePort,
  'isActive': instance.isActive,
  'R': instance.r,
  'G': instance.g,
  'B': instance.b,
  'BRI': instance.bri,
};
