import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/InfoDto.dart';
import '../models/MapConfig.dart';
import '../models/NightModeState.dart';
import 'core/RestClient.dart';

part 'SystemApi.g.dart';

/// System, pairing and night-mode endpoints. Paths are root-mounted on the
/// gateway (apps/server/src/routes/index.ts), not under `/api`.
@RestApi()
abstract class SystemApi extends RestClient {
  factory SystemApi(Dio dio, {String baseUrl}) = _SystemApi;

  /// Health check used by onboarding to validate reachability.
  @GET('/test')
  Future<void> test();

  @GET('/info')
  Future<InfoDto> getInfo();

  /// Pairs this device: the gateway authorises the `Authorization` device UUID
  /// against the supplied PIN/token.
  @POST('/login')
  Future<void> login(@Field('token') String token);

  /// Validates the device: a 200 means authenticated/authorised. Returns no
  /// body (the gateway may send an empty/null client), so we don't deserialize.
  @GET('/client')
  Future<void> getClient();

  /// RTSP camera stream URLs, configured server-side via CAMERA_STREAMS.
  @GET('/cameras')
  Future<List<String>> getCameras();

  /// Map provider config (`{key, style}`) from the gateway's .env.
  @GET('/map/config')
  Future<MapConfig> getMapConfig();

  @GET('/nightmode')
  Future<NightModeState> getNightMode();

  @PUT('/nightmode')
  Future<void> setNightMode(@Field('state') bool state);
}
