import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/BatteryLog.dart';
import '../models/ConsumptionStats.dart';
import '../models/SignalKDataSet.dart';
import 'core/RestClient.dart';

part 'EnergyApi.g.dart';

/// Battery, electricity-consumption and cached SignalK data endpoints.
@RestApi()
abstract class EnergyApi extends RestClient {
  factory EnergyApi(Dio dio, {String baseUrl}) = _EnergyApi;

  @GET('/battery/logs')
  Future<List<BatteryLog>> getBatteryLogs();

  @GET('/api/electricityConsumption/stats')
  Future<ConsumptionStats> getConsumptionStats();

  @POST('/api/electricityConsumption/save')
  Future<void> saveConsumption();

  /// Latest cached SignalK values for a path group, e.g. `type=electrical`.
  @GET('/data')
  Future<List<SignalKDataSet>> getData(@Query('type') String type);
}
