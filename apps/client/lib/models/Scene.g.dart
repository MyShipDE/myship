// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'Scene.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Scene _$SceneFromJson(Map<String, dynamic> json) => Scene(
  id: (json['id'] as num?)?.toInt(),
  name: json['name'] as String?,
  r: (json['R'] as num?)?.toInt(),
  g: (json['G'] as num?)?.toInt(),
  b: (json['B'] as num?)?.toInt(),
  bri: (json['BRI'] as num?)?.toInt(),
);

Map<String, dynamic> _$SceneToJson(Scene instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'R': instance.r,
  'G': instance.g,
  'B': instance.b,
  'BRI': instance.bri,
};
