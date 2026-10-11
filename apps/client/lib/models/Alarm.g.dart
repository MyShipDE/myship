// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'Alarm.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Alarm _$AlarmFromJson(Map<String, dynamic> json) => Alarm(
  id: (json['id'] as num?)?.toInt(),
  name: json['name'] as String?,
  interval: (json['interval'] as num?)?.toInt(),
  email: json['email'] as String?,
  phone: json['phone'] as String?,
  showInApp: json['showInApp'] as bool?,
  minValue: json['minValue'] as num?,
  maxValue: json['maxValue'] as num?,
  lastCheck: json['lastCheck'] == null
      ? null
      : DateTime.parse(json['lastCheck'] as String),
  customMailMessage: json['customMailMessage'] as String?,
  active: json['active'] as bool?,
  reached: json['reached'] as bool?,
  signalKDatasource: json['signalKDatasource'] == null
      ? null
      : SignalKDatasource.fromJson(
          json['signalKDatasource'] as Map<String, dynamic>,
        ),
);

Map<String, dynamic> _$AlarmToJson(Alarm instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'interval': instance.interval,
  'email': instance.email,
  'phone': instance.phone,
  'showInApp': instance.showInApp,
  'minValue': instance.minValue,
  'maxValue': instance.maxValue,
  'lastCheck': instance.lastCheck?.toIso8601String(),
  'customMailMessage': instance.customMailMessage,
  'active': instance.active,
  'reached': instance.reached,
  'signalKDatasource': instance.signalKDatasource,
};
