import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:intl/intl.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';

import '../api/core/api_provider.dart';
import '../models/CurrentWeather.dart';
import '../models/ForecastDay.dart';
import '../services/app_settings_service.dart';
import '../services/map_tiles.dart';
import '../services/signalk_paths.dart';
import '../services/signalk_service.dart';
import '../widgets/myship_widgets.dart';

/// Weather overview, ported from apps/client/.../weather: current conditions +
/// daily forecast (Apple WeatherKit via the gateway) and a map with optional
/// OpenWeatherMap overlay. Position comes from SignalK.
class WeatherPage extends StatefulWidget {
  const WeatherPage({super.key});

  @override
  State<WeatherPage> createState() => _WeatherPageState();
}

const _overlays = {
  '': 'Keine',
  'clouds_new': 'Wolken',
  'precipitation_new': 'Niederschlag',
  'wind_new': 'Wind',
  'pressure_new': 'Druck',
  'temp_new': 'Temperatur',
};

class _WeatherPageState extends State<WeatherPage> {
  CurrentWeather? _current;
  List<ForecastDay> _forecast = [];
  String _overlay = '';
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  LatLng _position() {
    final sk = context.read<SignalKService>();
    final pos = sk.firstValue(SignalKPaths.position);
    if (pos is Map && pos['latitude'] is num && pos['longitude'] is num) {
      return LatLng((pos['latitude'] as num).toDouble(),
          (pos['longitude'] as num).toDouble());
    }
    return const LatLng(54.32, 10.14); // Kiel fallback
  }

  Future<void> _load() async {
    final api = context.read<ApiProvider>();
    final p = _position();
    try {
      final current = await api.weatherApi.getCurrent(p.latitude, p.longitude);
      final forecast = await api.weatherApi.getForecast(p.latitude, p.longitude);
      if (mounted) {
        setState(() {
          _current = current.currentWeather;
          _forecast = forecast.forecastDaily?.days ?? [];
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = _position();
    final c = _current;
    final settings = context.watch<AppSettingsService>();

    return MyShipScaffold(
      title: 'Wetter',
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              children: [
                SizedBox(
                  height: 260,
                  child: FlutterMap(
                    options: MapOptions(initialCenter: p, initialZoom: 7),
                    children: [
                      TileLayer(
                        urlTemplate: MapTiles.base(
                            settings.mapTilerKey, settings.mapTilerStyle),
                        userAgentPackageName: MapTiles.userAgent,
                      ),
                      if (_overlay.isNotEmpty)
                        TileLayer(
                          urlTemplate: MapTiles.owm(_overlay),
                          userAgentPackageName: MapTiles.userAgent,
                        ),
                      MarkerLayer(markers: [
                        Marker(
                          point: p,
                          child: const Icon(Icons.sailing, color: Colors.blue),
                        ),
                      ]),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    children: [
                      const Text('Kartenebene: '),
                      const SizedBox(width: 8),
                      DropdownButton<String>(
                        value: _overlay,
                        items: _overlays.entries
                            .map((e) => DropdownMenuItem(
                                value: e.key, child: Text(e.value)))
                            .toList(),
                        onChanged: (v) => setState(() => _overlay = v ?? ''),
                      ),
                    ],
                  ),
                ),
                if (c != null)
                  Card(
                    margin: const EdgeInsets.symmetric(horizontal: 12),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Aktuell',
                              style: Theme.of(context).textTheme.titleMedium),
                          const SizedBox(height: 8),
                          Text(
                              '${c.temperature?.toStringAsFixed(1) ?? '—'} °C '
                              '(gefühlt ${c.temperatureApparent?.toStringAsFixed(1) ?? '—'} °C)'),
                          Text(
                              'Wind ${((c.windSpeed ?? 0) * 1.94384).toStringAsFixed(0)} kn '
                              'aus ${c.windDirection?.toStringAsFixed(0) ?? '—'}°'),
                          Text('Druck ${c.pressure?.toStringAsFixed(0) ?? '—'} hPa '
                              '(${c.pressureTrend ?? '—'})'),
                        ],
                      ),
                    ),
                  ),
                const SizedBox(height: 8),
                ..._forecast.take(5).map(_forecastTile),
              ],
            ),
    );
  }

  Widget _forecastTile(ForecastDay d) {
    final day = d.forecastStart != null
        ? DateFormat('EEE', 'de').format(d.forecastStart!)
        : '—';
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      child: ListTile(
        leading: Text(day, style: const TextStyle(fontWeight: FontWeight.bold)),
        title: Text(
            '${d.temperatureMin?.toStringAsFixed(0) ?? '—'}° / '
            '${d.temperatureMax?.toStringAsFixed(0) ?? '—'}°'),
        trailing: Text(
            '${((d.daytimeForecast?.windSpeed ?? 0) * 1.94384).toStringAsFixed(0)} kn'),
      ),
    );
  }
}
