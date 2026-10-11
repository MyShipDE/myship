// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'SignalKDatasource.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SignalKDatasource _$SignalKDatasourceFromJson(Map<String, dynamic> json) =>
    SignalKDatasource(
      id: (json['id'] as num?)?.toInt(),
      name: json['name'] as String?,
      path: json['path'] as String?,
      unit: json['unit'] as String?,
    );

Map<String, dynamic> _$SignalKDatasourceToJson(SignalKDatasource instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'path': instance.path,
      'unit': instance.unit,
    };
