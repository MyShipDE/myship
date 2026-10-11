// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'CurrentWeather.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CurrentWeather _$CurrentWeatherFromJson(Map<String, dynamic> json) =>
    CurrentWeather(
      temperature: (json['temperature'] as num?)?.toDouble(),
      temperatureApparent: (json['temperatureApparent'] as num?)?.toDouble(),
      windSpeed: (json['windSpeed'] as num?)?.toDouble(),
      windDirection: (json['windDirection'] as num?)?.toDouble(),
      pressure: (json['pressure'] as num?)?.toDouble(),
      pressureTrend: json['pressureTrend'] as String?,
      humidity: (json['humidity'] as num?)?.toDouble(),
      visibility: (json['visibility'] as num?)?.toDouble(),
      conditionCode: json['conditionCode'] as String?,
    );

Map<String, dynamic> _$CurrentWeatherToJson(CurrentWeather instance) =>
    <String, dynamic>{
      'temperature': instance.temperature,
      'temperatureApparent': instance.temperatureApparent,
      'windSpeed': instance.windSpeed,
      'windDirection': instance.windDirection,
      'pressure': instance.pressure,
      'pressureTrend': instance.pressureTrend,
      'humidity': instance.humidity,
      'visibility': instance.visibility,
      'conditionCode': instance.conditionCode,
    };

CurrentWeatherResponse _$CurrentWeatherResponseFromJson(
  Map<String, dynamic> json,
) => CurrentWeatherResponse(
  currentWeather: json['currentWeather'] == null
      ? null
      : CurrentWeather.fromJson(json['currentWeather'] as Map<String, dynamic>),
);

Map<String, dynamic> _$CurrentWeatherResponseToJson(
  CurrentWeatherResponse instance,
) => <String, dynamic>{'currentWeather': instance.currentWeather};
