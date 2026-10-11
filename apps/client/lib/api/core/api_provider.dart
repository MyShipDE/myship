import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../services/connection_service.dart';
import '../AlarmApi.dart';
import '../DeviceApi.dart';
import '../EnergyApi.dart';
import '../LightsApi.dart';
import '../SystemApi.dart';
import '../WeatherApi.dart';
import 'RestClient.dart';

/// Owns the single shared [Dio] instance and exposes one retrofit API per
/// domain (mirrors DiLog's ApiProvider). Provided app-wide via `provider`.
class ApiProvider extends ChangeNotifier {
  ApiProvider(this._connection) {
    _initialize();
  }

  final ConnectionService _connection;

  late final Dio dio;

  SystemApi? _systemApi;
  LightsApi? _lightsApi;
  DeviceApi? _deviceApi;
  EnergyApi? _energyApi;
  WeatherApi? _weatherApi;
  AlarmApi? _alarmApi;

  bool _isInitialized = false;
  bool get isInitialized => _isInitialized;

  SystemApi get systemApi => _systemApi!;
  LightsApi get lightsApi => _lightsApi!;
  DeviceApi get deviceApi => _deviceApi!;
  EnergyApi get energyApi => _energyApi!;
  WeatherApi get weatherApi => _weatherApi!;
  AlarmApi get alarmApi => _alarmApi!;

  void _initialize() {
    dio = RestClient.createDio(_connection);
    _systemApi = SystemApi(dio);
    _lightsApi = LightsApi(dio);
    _deviceApi = DeviceApi(dio);
    _energyApi = EnergyApi(dio);
    _weatherApi = WeatherApi(dio);
    _alarmApi = AlarmApi(dio);
    _isInitialized = true;
    notifyListeners();
  }
}
