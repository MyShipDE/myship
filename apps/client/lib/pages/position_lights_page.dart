import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../api/core/api_provider.dart';
import '../models/Device.dart';
import '../services/socket_channels.dart';
import '../services/socket_service.dart';
import '../widgets/myship_widgets.dart';

/// Navigation/position lights: toggles devices of type `pos`, ported from
/// apps/client/.../position-lights.
class PositionLightsPage extends StatefulWidget {
  const PositionLightsPage({super.key});

  @override
  State<PositionLightsPage> createState() => _PositionLightsPageState();
}

class _PositionLightsPageState extends State<PositionLightsPage> {
  List<Device> _devices = [];
  bool _loading = true;
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
          _devices = devices.where((d) => d.type == 'pos').toList();
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

  @override
  Widget build(BuildContext context) {
    return MyShipScaffold(
      title: 'Navigationslichter',
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : GridView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _devices.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 16,
                crossAxisSpacing: 16,
                mainAxisExtent: 64,
              ),
              itemBuilder: (_, i) {
                final d = _devices[i];
                return MyShipPowerRow(
                  label: d.name ?? 'Licht ${d.id}',
                  active: d.isActive == true,
                  onToggle: () => _toggle(d),
                );
              },
            ),
    );
  }
}
