import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../api/core/api_provider.dart';
import '../models/Device.dart';
import '../services/socket_channels.dart';
import '../services/socket_service.dart';
import '../widgets/myship_widgets.dart';

/// Device/consumer management with type filter and control, ported from
/// apps/client/.../verbraucher.
class VerbraucherPage extends StatefulWidget {
  const VerbraucherPage({super.key});

  @override
  State<VerbraucherPage> createState() => _VerbraucherPageState();
}

const _filters = {
  'all': 'Alle',
  'ver': 'Verbraucher',
  'nav': 'Navigation',
  'light': 'Licht',
};

class _VerbraucherPageState extends State<VerbraucherPage> {
  List<Device> _devices = [];
  bool _loading = true;
  String _filter = 'all';
  StreamSubscription<dynamic>? _sub;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _load();
      _sub = context
          .read<SocketService>()
          .on(SocketChannels.deviceObject)
          .listen((_) => _load());
    });
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }

  ApiProvider get _api => context.read<ApiProvider>();

  Future<void> _load() async {
    try {
      final devices = await _api.deviceApi.getDevices();
      if (mounted) {
        setState(() {
          _devices = devices;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _toggle(Device d) async {
    await _api.deviceApi.control({'device_id': d.id});
    await _load();
  }

  List<Device> get _visible => _filter == 'all'
      ? _devices.where((d) => d.isHidden != true).toList()
      : _devices
          .where((d) => d.type == _filter && d.isHidden != true)
          .toList();

  @override
  Widget build(BuildContext context) {
    return MyShipScaffold(
      title: 'Verbraucher',
      body: Column(
        children: [
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: _filters.entries
                  .map((e) => Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: ChoiceChip(
                          label: Text(e.value),
                          selected: _filter == e.key,
                          onSelected: (_) => setState(() => _filter = e.key),
                        ),
                      ))
                  .toList(),
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: _load,
                    child: ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: _visible.length,
                      separatorBuilder: (_, _) => const SizedBox(height: 14),
                      itemBuilder: (_, i) {
                        final d = _visible[i];
                        return MyShipPowerRow(
                          label: d.name ?? 'Gerät ${d.id}',
                          active: d.isActive == true,
                          onToggle: () => _toggle(d),
                        );
                      },
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}
