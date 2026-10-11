import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/Bridge.dart';
import '../models/Device.dart';
import 'core/RestClient.dart';

part 'DeviceApi.g.dart';

/// Device/consumer endpoints (apps/server/src/routes/index.ts).
@RestApi()
abstract class DeviceApi extends RestClient {
  factory DeviceApi(Dio dio, {String baseUrl}) = _DeviceApi;

  @GET('/devices')
  Future<List<Device>> getDevices();

  @GET('/device/{id}/status')
  Future<String> getStatus(@Path('id') int id);

  /// Toggles a device by id (`{ "device_id": <id> }`).
  @POST('/device/control')
  Future<void> control(@Body() Map<String, dynamic> body);

  @PUT('/device')
  Future<void> put(@Body() Device device);

  @DELETE('/device/{id}')
  Future<void> delete(@Path('id') int id);

  @GET('/bridges')
  Future<List<Bridge>> getBridges();
}
