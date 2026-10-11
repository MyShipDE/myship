import 'package:json_annotation/json_annotation.dart';

part 'CurrentWeather.g.dart';

/// Apple WeatherKit `currentWeather` dataset (returned by
/// `/api/weather/current/:lat/:lon`). Temperatures in °C, wind in m/s.
@JsonSerializable()
class CurrentWeather {
  final double? temperature;
  final double? temperatureApparent;
  final double? windSpeed;
  final double? windDirection;
  final double? pressure;
  final String? pressureTrend;
  final double? humidity;
  final double? visibility;
  final String? conditionCode;

  CurrentWeather({
    this.temperature,
    this.temperatureApparent,
    this.windSpeed,
    this.windDirection,
    this.pressure,
    this.pressureTrend,
    this.humidity,
    this.visibility,
    this.conditionCode,
  });

  factory CurrentWeather.fromJson(Map<String, dynamic> json) =>
      _$CurrentWeatherFromJson(json);

  Map<String, dynamic> toJson() => _$CurrentWeatherToJson(this);
}

/// Top-level wrapper (`{ "currentWeather": { ... } }`).
@JsonSerializable()
class CurrentWeatherResponse {
  final CurrentWeather? currentWeather;

  CurrentWeatherResponse({this.currentWeather});

  factory CurrentWeatherResponse.fromJson(Map<String, dynamic> json) =>
      _$CurrentWeatherResponseFromJson(json);

  Map<String, dynamic> toJson() => _$CurrentWeatherResponseToJson(this);
}
