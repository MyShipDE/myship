import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../resources/colors.dart';
import '../services/signalk_paths.dart';
import '../services/signalk_service.dart';
import '../widgets/myship_widgets.dart';

/// Minimal SignalK live view (PoC), ported from apps/client/.../ship.
/// Shows position, SOG, COG and heading straight from [SignalKService].
class ShipPage extends StatelessWidget {
  const ShipPage({super.key});

  @override
  Widget build(BuildContext context) {
    final sk = context.watch<SignalKService>();

    final position = sk.firstValue(SignalKPaths.position);
    final lat = position is Map ? position['latitude'] : null;
    final lon = position is Map ? position['longitude'] : null;
    final sogMs = sk.firstNumber(SignalKPaths.sog);
    final cogRad = sk.firstNumber(SignalKPaths.cog);
    final headingRad = sk.firstNumber(SignalKPaths.heading);

    String knots(num? ms) =>
        ms == null ? '—' : '${(ms * 1.94384).toStringAsFixed(1)} kn';
    String deg(num? rad) =>
        rad == null ? '—' : '${(rad * 180 / 3.141592653589793).toStringAsFixed(0)}°';

    return MyShipScaffold(
      title: 'Schiff',
      actions: [
        Icon(
          sk.isConnected ? Icons.cloud_done : Icons.cloud_off,
          color: sk.isConnected ? Colors.green : MyShipColors.off,
        ),
      ],
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _tile('Breite', lat == null ? '—' : lat.toString()),
          _tile('Länge', lon == null ? '—' : lon.toString()),
          _tile('Fahrt über Grund (SOG)', knots(sogMs)),
          _tile('Kurs über Grund (COG)', deg(cogRad)),
          _tile('Steuerkurs (Heading)', deg(headingRad)),
          const SizedBox(height: 16),
          Text('${sk.values.length} SignalK-Pfade empfangen',
              style: Theme.of(context).textTheme.bodySmall),
        ],
      ),
    );
  }

  Widget _tile(String label, String value) => Card(
        child: ListTile(
          title: Text(label),
          trailing: Text(value,
              style: const TextStyle(
                  fontSize: 18, fontWeight: FontWeight.bold)),
        ),
      );
}
