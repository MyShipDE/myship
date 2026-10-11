import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:syncfusion_flutter_gauges/gauges.dart';

import '../services/signalk_paths.dart';
import '../services/signalk_service.dart';
import '../widgets/myship_widgets.dart';

/// Engine/navigation instruments with live gauges, ported from
/// apps/client/.../instruments/maschine. Values come from [SignalKService].
class InstrumentsPage extends StatelessWidget {
  const InstrumentsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final sk = context.watch<SignalKService>();

    final sogKn = (sk.firstNumber(SignalKPaths.sog) ?? 0) * 1.94384;
    final cogDeg = (sk.firstNumber(SignalKPaths.cog) ?? 0) * 180 / math.pi;
    final depth = sk.firstNumber(SignalKPaths.depthBelowKeel)?.toDouble() ?? 0;
    final windKn = (sk.firstNumber(SignalKPaths.windSpeedApparent) ?? 0) * 1.94384;

    return MyShipScaffold(
      title: 'Instrumente',
      body: GridView.count(
        padding: const EdgeInsets.all(12),
        crossAxisCount: 2,
        children: [
          _speedGauge('SOG', sogKn.toDouble(), 20, 'kn'),
          _compassGauge('COG', cogDeg.toDouble()),
          _speedGauge('Wind (scheinbar)', windKn.toDouble(), 60, 'kn'),
          _speedGauge('Tiefe', depth, 20, 'm'),
        ],
      ),
    );
  }

  Widget _speedGauge(String label, double value, double max, String unit) {
    return SfRadialGauge(
      title: GaugeTitle(text: label),
      axes: <RadialAxis>[
        RadialAxis(
          minimum: 0,
          maximum: max,
          pointers: <GaugePointer>[NeedlePointer(value: value.clamp(0, max))],
          annotations: <GaugeAnnotation>[
            GaugeAnnotation(
              positionFactor: 0.7,
              angle: 90,
              widget: Text('${value.toStringAsFixed(1)} $unit',
                  style: const TextStyle(
                      fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ],
    );
  }

  Widget _compassGauge(String label, double deg) {
    return SfRadialGauge(
      title: GaugeTitle(text: label),
      axes: <RadialAxis>[
        RadialAxis(
          minimum: 0,
          maximum: 360,
          startAngle: 270,
          endAngle: 270,
          interval: 45,
          pointers: <GaugePointer>[
            NeedlePointer(value: deg % 360),
          ],
          annotations: <GaugeAnnotation>[
            GaugeAnnotation(
              positionFactor: 0.1,
              angle: 90,
              widget: Text('${(deg % 360).toStringAsFixed(0)}°',
                  style: const TextStyle(
                      fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ],
    );
  }
}
