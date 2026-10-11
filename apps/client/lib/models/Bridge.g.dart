// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'Bridge.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Bridge _$BridgeFromJson(Map<String, dynamic> json) => Bridge(
  id: (json['id'] as num?)?.toInt(),
  name: json['name'] as String?,
  ip: json['ip'] as String?,
);

Map<String, dynamic> _$BridgeToJson(Bridge instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'ip': instance.ip,
};
