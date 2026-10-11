// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'InfoDto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

InfoDto _$InfoDtoFromJson(Map<String, dynamic> json) => InfoDto(
  name: json['name'] as String?,
  version: json['version'] as String?,
  platform: json['platform'] as String?,
  os: json['os'] as String?,
  arch: json['arch'] as String?,
  hostname: json['hostname'] as String?,
  memory: json['memory'] as num?,
  uptime: json['uptime'] as num?,
);

Map<String, dynamic> _$InfoDtoToJson(InfoDto instance) => <String, dynamic>{
  'name': instance.name,
  'version': instance.version,
  'platform': instance.platform,
  'os': instance.os,
  'arch': instance.arch,
  'hostname': instance.hostname,
  'memory': instance.memory,
  'uptime': instance.uptime,
};
