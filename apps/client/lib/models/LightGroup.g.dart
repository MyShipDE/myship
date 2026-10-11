// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'LightGroup.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

LightGroup _$LightGroupFromJson(Map<String, dynamic> json) => LightGroup(
  id: (json['id'] as num?)?.toInt(),
  name: json['name'] as String?,
  lastSceneId: (json['lastSceneId'] as num?)?.toInt(),
  lights:
      (json['lights'] as List<dynamic>?)
          ?.map((e) => Light.fromJson(e as Map<String, dynamic>))
          .toList() ??
      [],
  scenes:
      (json['scenes'] as List<dynamic>?)
          ?.map((e) => Scene.fromJson(e as Map<String, dynamic>))
          .toList() ??
      [],
);

Map<String, dynamic> _$LightGroupToJson(LightGroup instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'lastSceneId': instance.lastSceneId,
      'lights': instance.lights,
      'scenes': instance.scenes,
    };
