import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Local-only UI settings. Currently the UTC offset (whole hours) used by the
/// dashboard clock — stored under the `utc` key, matching the Angular client.
class AppSettingsService extends ChangeNotifier {
  static const _keyUtc = 'utc';
  static const _keyCameras = 'camera.streams';
  static const _keyMapKey = 'maptiler.key';
  static const _keyMapStyle = 'maptiler.style';

  int _utcOffset = 0;
  List<String> _cameraStreams = [];
  String _mapTilerKey = '';
  String _mapTilerStyle = 'streets-v2';

  /// Hours to add to UTC for the displayed time.
  int get utcOffset => _utcOffset;

  /// Last-known camera stream URLs (cached from the gateway for offline use).
  List<String> get cameraStreams => _cameraStreams;

  /// MapTiler key + style (from the gateway, cached for offline use).
  String get mapTilerKey => _mapTilerKey;
  String get mapTilerStyle => _mapTilerStyle;

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    _utcOffset = prefs.getInt(_keyUtc) ?? 0;
    _cameraStreams = prefs.getStringList(_keyCameras) ?? [];
    _mapTilerKey = prefs.getString(_keyMapKey) ?? '';
    _mapTilerStyle = prefs.getString(_keyMapStyle) ?? 'streets-v2';
    notifyListeners();
  }

  Future<void> setMapConfig(String key, String style) async {
    _mapTilerKey = key;
    _mapTilerStyle = style.isEmpty ? 'streets-v2' : style;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyMapKey, _mapTilerKey);
    await prefs.setString(_keyMapStyle, _mapTilerStyle);
    notifyListeners();
  }

  Future<void> setCameraStreams(List<String> streams) async {
    _cameraStreams = streams;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(_keyCameras, streams);
    notifyListeners();
  }

  Future<void> setUtcOffset(int hours) async {
    final clamped = hours.clamp(-12, 14);
    if (clamped == _utcOffset) return;
    _utcOffset = clamped;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_keyUtc, _utcOffset);
    notifyListeners();
  }

  void increment() => setUtcOffset(_utcOffset + 1);
  void decrement() => setUtcOffset(_utcOffset - 1);
}
