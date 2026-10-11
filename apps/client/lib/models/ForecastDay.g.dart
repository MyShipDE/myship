// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'ForecastDay.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

DaytimeForecast _$DaytimeForecastFromJson(Map<String, dynamic> json) =>
    DaytimeForecast(
      windSpeed: (json['windSpeed'] as num?)?.toDouble(),
      windDirection: (json['windDirection'] as num?)?.toDouble(),
    );

Map<String, dynamic> _$DaytimeForecastToJson(DaytimeForecast instance) =>
    <String, dynamic>{
      'windSpeed': instance.windSpeed,
      'windDirection': instance.windDirection,
    };

ForecastDay _$ForecastDayFromJson(Map<String, dynamic> json) => ForecastDay(
  forecastStart: json['forecastStart'] == null
      ? null
      : DateTime.parse(json['forecastStart'] as String),
  temperatureMax: (json['temperatureMax'] as num?)?.toDouble(),
  temperatureMin: (json['temperatureMin'] as num?)?.toDouble(),
  conditionCode: json['conditionCode'] as String?,
  daytimeForecast: json['daytimeForecast'] == null
      ? null
      : DaytimeForecast.fromJson(
          json['daytimeForecast'] as Map<String, dynamic>,
        ),
);

Map<String, dynamic> _$ForecastDayToJson(ForecastDay instance) =>
    <String, dynamic>{
      'forecastStart': instance.forecastStart?.toIso8601String(),
      'temperatureMax': instance.temperatureMax,
      'temperatureMin': instance.temperatureMin,
      'conditionCode': instance.conditionCode,
      'daytimeForecast': instance.daytimeForecast,
    };

ForecastDaily _$ForecastDailyFromJson(Map<String, dynamic> json) =>
    ForecastDaily(
      days:
          (json['days'] as List<dynamic>?)
              ?.map((e) => ForecastDay.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );

Map<String, dynamic> _$ForecastDailyToJson(ForecastDaily instance) =>
    <String, dynamic>{'days': instance.days};

ForecastResponse _$ForecastResponseFromJson(Map<String, dynamic> json) =>
    ForecastResponse(
      forecastDaily: json['forecastDaily'] == null
          ? null
          : ForecastDaily.fromJson(
              json['forecastDaily'] as Map<String, dynamic>,
            ),
    );

Map<String, dynamic> _$ForecastResponseToJson(ForecastResponse instance) =>
    <String, dynamic>{'forecastDaily': instance.forecastDaily};
