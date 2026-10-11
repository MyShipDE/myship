import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/Alarm.dart';
import '../models/SignalKDatasource.dart';
import 'core/RestClient.dart';

part 'AlarmApi.g.dart';

/// Alarm configuration endpoints (apps/server/src/routes/index.ts).
@RestApi()
abstract class AlarmApi extends RestClient {
  factory AlarmApi(Dio dio, {String baseUrl}) = _AlarmApi;

  @GET('/alarms')
  Future<List<Alarm>> getAlarms();

  @GET('/sensors')
  Future<List<SignalKDatasource>> getSensors();

  @PUT('/alarm')
  Future<void> putAlarm(@Body() Alarm alarm);

  @DELETE('/alarm/{id}')
  Future<void> deleteAlarm(@Path('id') int id);
}
