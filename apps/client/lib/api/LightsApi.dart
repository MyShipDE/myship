import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/Light.dart';
import '../models/LightGroup.dart';
import '../models/Scene.dart';
import 'core/RestClient.dart';

part 'LightsApi.g.dart';

/// Lighting endpoints (apps/server/src/routes/index.ts). Control bodies carry
/// either a `scene_id` or explicit `r`/`g`/`b`/`brightness` values.
@RestApi()
abstract class LightsApi extends RestClient {
  factory LightsApi(Dio dio, {String baseUrl}) = _LightsApi;

  @GET('/lightGroups')
  Future<List<LightGroup>> getLightGroups();

  @POST('/lightGroup')
  Future<void> saveLightGroup(@Body() LightGroup group);

  @DELETE('/lightGroup/{id}')
  Future<void> deleteLightGroup(@Path('id') int id);

  @POST('/lights/group/control')
  Future<void> controlGroup(@Body() Map<String, dynamic> body);

  @GET('/lights')
  Future<List<Light>> getLights();

  @POST('/light/control')
  Future<void> controlLight(@Body() Map<String, dynamic> body);

  @GET('/scenes/{groupId}')
  Future<List<Scene>> getScenesByGroup(@Path('groupId') int groupId);

  @POST('/scene')
  Future<void> createScene(@Body() Scene scene);

  @PUT('/scene')
  Future<void> updateScene(@Body() Scene scene);

  @DELETE('/scene/{id}')
  Future<void> deleteScene(@Path('id') int id);

  @POST('/scene/link')
  Future<void> linkScene(@Body() Map<String, dynamic> body);

  @POST('/scene/unlink')
  Future<void> unlinkScene(@Body() Map<String, dynamic> body);
}
