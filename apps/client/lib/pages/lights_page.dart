import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart';
import 'package:provider/provider.dart';

import '../api/core/api_provider.dart';
import '../models/LightGroup.dart';
import '../models/Scene.dart';
import '../services/socket_channels.dart';
import '../services/socket_service.dart';
import '../widgets/myship_widgets.dart';

/// Lighting control: groups, scenes and manual colour, ported from
/// apps/client/.../lights. Mirrors the Angular control() heuristic.
class LightsPage extends StatefulWidget {
  const LightsPage({super.key});

  @override
  State<LightsPage> createState() => _LightsPageState();
}

class _LightsPageState extends State<LightsPage> {
  List<LightGroup> _groups = [];
  bool _loading = true;
  StreamSubscription<dynamic>? _sub;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _load();
      _sub = context
          .read<SocketService>()
          .on(SocketChannels.lightGroupObject)
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
      final groups = await _api.lightsApi.getLightGroups();
      if (mounted) {
        setState(() {
          _groups = groups;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _toggle(LightGroup g) async {
    final Map<String, dynamic> body;
    if (g.isActive) {
      body = {'group_id': g.id, 'r': 0, 'g': 0, 'b': 0, 'brightness': 255};
    } else if (g.lastSceneId != null && g.lastSceneId != 0) {
      body = {'group_id': g.id, 'scene_id': g.lastSceneId};
    } else {
      body = {'group_id': g.id, 'r': 255, 'g': 180, 'b': 80, 'brightness': 255};
    }
    await _api.lightsApi.controlGroup(body);
    await _load();
  }

  Future<void> _applyScene(LightGroup g, Scene s) async {
    await _api.lightsApi.controlGroup({'group_id': g.id, 'scene_id': s.id});
    await _load();
  }

  Future<void> _pickColor(LightGroup g) async {
    Color color = const Color(0xFFFFB450);
    final apply = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(g.name ?? 'Farbe'),
        content: SingleChildScrollView(
          child: ColorPicker(
            pickerColor: color,
            onColorChanged: (c) => color = c,
            enableAlpha: false,
          ),
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Abbrechen')),
          FilledButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Anwenden')),
        ],
      ),
    );
    if (apply == true) {
      await _api.lightsApi.controlGroup({
        'group_id': g.id,
        'r': (color.r * 255).round(),
        'g': (color.g * 255).round(),
        'b': (color.b * 255).round(),
        'brightness': 255,
      });
      await _load();
    }
  }

  void _openSettings(LightGroup g) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: const Color(0xFF0A0A0A),
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Text(g.name ?? 'Gruppe ${g.id}',
                  style: Theme.of(ctx).textTheme.titleMedium),
            ),
            ...g.scenes.map((s) => ListTile(
                  leading: const Icon(Icons.palette),
                  title: Text(s.name ?? 'Szene ${s.id}'),
                  onTap: () {
                    Navigator.pop(ctx);
                    _applyScene(g, s);
                  },
                )),
            ListTile(
              leading: const Icon(Icons.color_lens),
              title: const Text('Farbe wählen …'),
              onTap: () {
                Navigator.pop(ctx);
                _pickColor(g);
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return MyShipScaffold(
      title: 'Beleuchtung',
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: GridView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _groups.length,
                gridDelegate:
                    const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  mainAxisExtent: 64,
                ),
                itemBuilder: (_, i) {
                  final g = _groups[i];
                  return MyShipPowerRow(
                    label: g.name ?? 'Gruppe ${g.id}',
                    active: g.isActive,
                    onToggle: () => _toggle(g),
                    onSettings: () => _openSettings(g),
                  );
                },
              ),
            ),
    );
  }
}
