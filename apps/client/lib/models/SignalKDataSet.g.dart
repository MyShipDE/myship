// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'SignalKDataSet.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SignalKDataSet _$SignalKDataSetFromJson(Map<String, dynamic> json) =>
    SignalKDataSet(
      path: json['path'] as String?,
      value: json['value'] as num?,
      unit: json['unit'] as String?,
      lastUpdate: json['lastUpdate'] == null
          ? null
          : DateTime.parse(json['lastUpdate'] as String),
    );

Map<String, dynamic> _$SignalKDataSetToJson(SignalKDataSet instance) =>
    <String, dynamic>{
      'path': instance.path,
      'value': instance.value,
      'unit': instance.unit,
      'lastUpdate': instance.lastUpdate?.toIso8601String(),
    };
