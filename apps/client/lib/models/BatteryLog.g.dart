// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'BatteryLog.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BatteryLog _$BatteryLogFromJson(Map<String, dynamic> json) => BatteryLog(
  id: (json['id'] as num?)?.toInt(),
  voltage: json['voltage'] as num?,
  current: json['current'] as num?,
  state: json['state'] as num?,
  remaining: json['remaining'] as num?,
  createdAt: json['createdAt'] == null
      ? null
      : DateTime.parse(json['createdAt'] as String),
);

Map<String, dynamic> _$BatteryLogToJson(BatteryLog instance) =>
    <String, dynamic>{
      'id': instance.id,
      'voltage': instance.voltage,
      'current': instance.current,
      'state': instance.state,
      'remaining': instance.remaining,
      'createdAt': instance.createdAt?.toIso8601String(),
    };
