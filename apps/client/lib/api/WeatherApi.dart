import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/CurrentWeather.dart';
import '../models/ForecastDay.dart';
import 'core/RestClient.dart';

part 'WeatherApi.g.dart';

/// Apple WeatherKit proxy endpoints (apps/server/src/controllers/WeatherController.ts).
@RestApi()
abstract class WeatherApi extends RestClient {
  factory WeatherApi(Dio dio, {String baseUrl}) = _WeatherApi;

  @GET('/api/weather/current/{lat}/{lon}')
  Future<CurrentWeatherResponse> getCurrent(
      @Path('lat') double lat, @Path('lon') double lon);

  @GET('/api/weather/forecast/{lat}/{lon}')
  Future<ForecastResponse> getForecast(
      @Path('lat') double lat, @Path('lon') double lon);
}
