import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../api/core/api_provider.dart';
import '../models/ConsumptionStats.dart';
import '../models/Device.dart';
import '../services/mqtt_service.dart';
import '../services/signalk_paths.dart';
import '../services/signalk_service.dart';
import '../widgets/myship_widgets.dart';

/// Energy overview: main/starter battery (SignalK electrical), Shelly consumers
/// (MQTT) and consumption statistics (REST). Ported from
/// apps/client/.../battery.
class BatteryPage extends StatefulWidget {
  const BatteryPage({super.key});

  @override
  State<BatteryPage> createState() => _BatteryPageState();
}

class _BatteryPageState extends State<BatteryPage> {
  ConsumptionStats? _stats;
  List<Device> _shellyDevices = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    final api = context.read<ApiProvider>();
    final mqtt = context.read<MqttService>();
    try {
      final stats = await api.energyApi.getConsumptionStats();
      final devices = await api.deviceApi.getDevices();
      final shelly =
          devices.where((d) => (d.bridge?.name ?? '').isNotEmpty).toList();
      for (final d in shelly) {
        mqtt.subscribeBridge(d.bridge!.name!);
      }
      if (mounted) {
        setState(() {
          _stats = stats;
          _shellyDevices = shelly;
        });
      }
    } catch (_) {
      // Leave defaults if the gateway is unreachable.
    }
  }

  @override
  Widget build(BuildContext context) {
    final sk = context.watch<SignalKService>();
    final mqtt = context.watch<MqttService>();

    final voltage = sk.firstNumber(SignalKPaths.batteryMainVoltage);
    final current = sk.firstNumber(SignalKPaths.batteryMainCurrent);
    final soc = sk.firstNumber(SignalKPaths.batteryMainSoc);
    final starter = sk.firstNumber(SignalKPaths.batteryStarterVoltage);
    final power = (voltage != null && current != null)
        ? (voltage * current)
        : null;

    String v(num? x, String unit, {int d = 1, num? scale}) => x == null
        ? '—'
        : '${((scale ?? 1) * x).toStringAsFixed(d)} $unit';

    return MyShipScaffold(
      title: 'Energie',
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('Hauptbatterie', style: Theme.of(context).textTheme.titleMedium),
          Card(
            child: Column(
              children: [
                _row('Spannung', v(voltage, 'V', d: 2)),
                _row('Strom', v(current, 'A', d: 1)),
                _row('Leistung', v(power, 'W', d: 0)),
                _row('Ladezustand', v(soc, '%', d: 0, scale: 100)),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Text('Starterbatterie', style: Theme.of(context).textTheme.titleMedium),
          Card(child: _row('Spannung', v(starter, 'V', d: 2))),
          const SizedBox(height: 8),
          if (_stats != null) ...[
            Text('Verbrauch', style: Theme.of(context).textTheme.titleMedium),
            Card(
              child: Column(
                children: [
                  _row('Letzter Tag', v(_stats!.lastDay, 'kWh', scale: 0.001, d: 2)),
                  _row('Letzte Woche',
                      v(_stats!.lastWeek, 'kWh', scale: 0.001, d: 2)),
                  _row('Letztes Jahr',
                      v(_stats!.lastYear, 'kWh', scale: 0.001, d: 2)),
                ],
              ),
            ),
          ],
          const SizedBox(height: 8),
          if (_shellyDevices.isNotEmpty) ...[
            Text('Verbraucher', style: Theme.of(context).textTheme.titleMedium),
            ..._shellyDevices.map((d) {
              final status = mqtt.statusOf(d.bridge!.name!);
              return Card(
                child: ListTile(
                  leading: Icon(
                    Icons.power,
                    color: status?.output == true ? Colors.green : Colors.grey,
                  ),
                  title: Text(d.name ?? d.bridge!.name!),
                  subtitle: status == null
                      ? const Text('—')
                      : Text(
                          '${status.apower?.toStringAsFixed(0) ?? '—'} W · '
                          '${status.voltage?.toStringAsFixed(0) ?? '—'} V · '
                          '${status.current?.toStringAsFixed(2) ?? '—'} A'),
                ),
              );
            }),
          ],
        ],
      ),
    );
  }

  Widget _row(String label, String value) => ListTile(
        dense: true,
        title: Text(label),
        trailing: Text(value,
            style:
                const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
      );
}
