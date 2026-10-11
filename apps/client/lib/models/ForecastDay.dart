import 'package:json_annotation/json_annotation.dart';

part 'ForecastDay.g.dart';

@JsonSerializable()
class DaytimeForecast {
  final double? windSpeed;
  final double? windDirection;

  DaytimeForecast({this.windSpeed, this.windDirection});

  factory DaytimeForecast.fromJson(Map<String, dynamic> json) =>
      _$DaytimeForecastFromJson(json);

  Map<String, dynamic> toJson() => _$DaytimeForecastToJson(this);
}

/// One entry of Apple WeatherKit `forecastDaily.days[]`.
@JsonSerializable()
class ForecastDay {
  final DateTime? forecastStart;
  final double? temperatureMax;
  final double? temperatureMin;
  final String? conditionCode;
  final DaytimeForecast? daytimeForecast;

  ForecastDay({
    this.forecastStart,
    this.temperatureMax,
    this.temperatureMin,
    this.conditionCode,
    this.daytimeForecast,
  });

  factory ForecastDay.fromJson(Map<String, dynamic> json) =>
      _$ForecastDayFromJson(json);

  Map<String, dynamic> toJson() => _$ForecastDayToJson(this);
}

@JsonSerializable()
class ForecastDaily {
  @JsonKey(defaultValue: [])
  final List<ForecastDay> days;

  ForecastDaily({this.days = const []});

  factory ForecastDaily.fromJson(Map<String, dynamic> json) =>
      _$ForecastDailyFromJson(json);

  Map<String, dynamic> toJson() => _$ForecastDailyToJson(this);
}

/// Top-level wrapper (`{ "forecastDaily": { "days": [ ... ] } }`).
@JsonSerializable()
class ForecastResponse {
  final ForecastDaily? forecastDaily;

  ForecastResponse({this.forecastDaily});

  factory ForecastResponse.fromJson(Map<String, dynamic> json) =>
      _$ForecastResponseFromJson(json);

  Map<String, dynamic> toJson() => _$ForecastResponseToJson(this);
}
