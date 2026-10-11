import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../api/core/api_provider.dart';
import '../models/Alarm.dart';
import '../widgets/myship_widgets.dart';

/// Alarm list with active toggle, ported from apps/client/.../settings/arlams.
class AlarmsPage extends StatefulWidget {
  const AlarmsPage({super.key});

  @override
  State<AlarmsPage> createState() => _AlarmsPageState();
}

class _AlarmsPageState extends State<AlarmsPage> {
  List<Alarm> _alarms = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    try {
      final alarms = await context.read<ApiProvider>().alarmApi.getAlarms();
      if (mounted) {
        setState(() {
          _alarms = alarms;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _toggle(Alarm a, bool active) async {
    await context.read<ApiProvider>().alarmApi.putAlarm(a.copyWith(active: active));
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    return MyShipScaffold(
      title: 'Alarme',
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _alarms.isEmpty
              ? const Center(child: Text('Keine Alarme konfiguriert.'))
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView(
                    children: _alarms.map((a) {
                      final src = a.signalKDatasource;
                      final unit = src?.unit ?? '';
                      return Card(
                        child: SwitchListTile(
                          secondary: Icon(
                            a.reached == true
                                ? Icons.warning_amber
                                : Icons.notifications,
                            color: a.reached == true ? Colors.red : null,
                          ),
                          title: Text(a.name ?? 'Alarm ${a.id}'),
                          subtitle: Text(
                              '${src?.path ?? '—'} · ${a.minValue ?? '—'}–${a.maxValue ?? '—'} $unit'),
                          value: a.active == true,
                          onChanged: (v) => _toggle(a, v),
                        ),
                      );
                    }).toList(),
                  ),
                ),
    );
  }
}
