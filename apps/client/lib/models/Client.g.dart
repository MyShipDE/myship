// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'Client.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Client _$ClientFromJson(Map<String, dynamic> json) => Client(
  id: (json['id'] as num?)?.toInt(),
  uuid: json['uuid'] as String?,
  comment: json['comment'] as String?,
  isAdmin: json['isAdmin'] as bool?,
  name: json['name'] as String?,
  platform: json['platform'] as String?,
  model: json['model'] as String?,
  manufacturer: json['manufacturer'] as String?,
);

Map<String, dynamic> _$ClientToJson(Client instance) => <String, dynamic>{
  'id': instance.id,
  'uuid': instance.uuid,
  'comment': instance.comment,
  'isAdmin': instance.isAdmin,
  'name': instance.name,
  'platform': instance.platform,
  'model': instance.model,
  'manufacturer': instance.manufacturer,
};
