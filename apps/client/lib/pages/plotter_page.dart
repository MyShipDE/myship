import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';

import '../services/app_settings_service.dart';
import '../services/map_tiles.dart';
import '../services/signalk_paths.dart';
import '../services/signalk_service.dart';
import '../widgets/myship_widgets.dart';

/// Navigation plotter (flutter_map), ported from apps/client/.../navigation-plotter:
/// OSM base + OpenSeaMap overlay, ship marker rotated by COG, a course-over-ground
/// line, and a north-up/vehicle-up toggle. Follows the vessel position.
///
/// Camera control (move/rotate) is driven by a [SignalKService] listener — not
/// from build() — so we never issue camera commands on every rebuild.
class PlotterPage extends StatefulWidget {
  const PlotterPage({super.key});

  @override
  State<PlotterPage> createState() => _PlotterPageState();
}

class _PlotterPageState extends State<PlotterPage> {
  final _controller = MapController();
  static const _distance = Distance();

  late final SignalKService _sk;
  bool _mapReady = false;
  bool _northUp = true;
  bool _follow = true;

  @override
  void initState() {
    super.initState();
    _sk = context.read<SignalKService>();
    _sk.addListener(_updateCamera);
  }

  @override
  void dispose() {
    _sk.removeListener(_updateCamera);
    super.dispose();
  }

  LatLng? get _ship {
    final pos = _sk.firstValue(SignalKPaths.position);
    if (pos is Map && pos['latitude'] is num && pos['longitude'] is num) {
      return LatLng((pos['latitude'] as num).toDouble(),
          (pos['longitude'] as num).toDouble());
    }
    return null;
  }

  double get _cogDeg => (_sk.firstNumber(SignalKPaths.cog)?.toDouble() ?? 0) *
      180 /
      math.pi;

  /// Applies follow + rotation to the map camera on new SignalK data.
  void _updateCamera() {
    if (!_mapReady) return;
    final ship = _ship;
    if (_follow && ship != null) {
      _controller.move(ship, _controller.camera.zoom);
    }
    _controller.rotate(_northUp ? 0 : -_cogDeg);
  }

  @override
  Widget build(BuildContext context) {
    final sk = context.watch<SignalKService>();
    final settings = context.watch<AppSettingsService>();
    final ship = _ship;
    final cogRad = sk.firstNumber(SignalKPaths.cog)?.toDouble() ?? 0;
    final cogDeg = _cogDeg;
    final sogKn = (sk.firstNumber(SignalKPaths.sog) ?? 0) * 1.94384;

    // Course-over-ground line: project ~2 NM ahead along the bearing.
    final cogLine = (ship != null && sogKn > 0.4)
        ? [ship, _distance.offset(ship, 3704, cogDeg)]
        : <LatLng>[];

    return MyShipScaffold(
      title: 'Plotter',
      actions: [
        IconButton(
          tooltip: _northUp ? 'Nord oben' : 'Fahrtrichtung oben',
          icon: Icon(_northUp ? Icons.explore : Icons.navigation),
          onPressed: () {
            setState(() => _northUp = !_northUp);
            _updateCamera();
          },
        ),
        IconButton(
          tooltip: _follow ? 'Folgen an' : 'Folgen aus',
          icon: Icon(_follow ? Icons.my_location : Icons.location_searching),
          onPressed: () {
            setState(() => _follow = !_follow);
            _updateCamera();
          },
        ),
      ],
      body: Stack(
        children: [
          FlutterMap(
            mapController: _controller,
            options: MapOptions(
              initialCenter: ship ?? const LatLng(54.32, 10.14), // Kiel fallback
              initialZoom: 13,
              onMapReady: () {
                _mapReady = true;
                _updateCamera();
              },
              onPositionChanged: (camera, hasGesture) {
                if (hasGesture && _follow) setState(() => _follow = false);
              },
            ),
            children: [
              TileLayer(
                urlTemplate:
                    MapTiles.base(settings.mapTilerKey, settings.mapTilerStyle),
                userAgentPackageName: MapTiles.userAgent,
              ),
              TileLayer(
                urlTemplate: MapTiles.openSeaMap,
                userAgentPackageName: MapTiles.userAgent,
              ),
              if (cogLine.isNotEmpty)
                PolylineLayer(polylines: [
                  Polyline(points: cogLine, color: Colors.red, strokeWidth: 3),
                ]),
              if (ship != null)
                MarkerLayer(markers: [
                  Marker(
                    point: ship,
                    width: 40,
                    height: 40,
                    child: Transform.rotate(
                      angle: _northUp ? cogRad : 0,
                      child: const Icon(Icons.navigation,
                          color: Colors.red, size: 36),
                    ),
                  ),
                ]),
            ],
          ),
          Positioned(
            left: 12,
            bottom: 12,
            child: Card(
              color: Colors.black54,
              child: Padding(
                padding: const EdgeInsets.all(8),
                child: Text(
                  'SOG ${sogKn.toStringAsFixed(1)} kn   COG ${(cogDeg % 360).toStringAsFixed(0)}°',
                  style: const TextStyle(color: Colors.white),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
