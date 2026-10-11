import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../api/core/api_provider.dart';
import '../models/InfoDto.dart';
import '../services/app_settings_service.dart';
import '../services/connection_service.dart';
import '../services/lock_service.dart';
import '../services/night_mode_service.dart';
import '../widgets/myship_widgets.dart';
import 'alarms_page.dart';

/// Settings hub, ported from apps/client/.../settings: gateway info, night mode,
/// app PIN, alarms and disconnect.
class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  InfoDto? _info;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    try {
      final info = await context.read<ApiProvider>().systemApi.getInfo();
      if (mounted) setState(() => _info = info);
    } catch (_) {
      // ignore
    }
  }

  Future<void> _setPin() async {
    final controller = TextEditingController();
    final lock = context.read<LockService>();
    final pin = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(lock.isPinSet ? 'PIN ändern' : 'PIN setzen'),
        content: TextField(
          controller: controller,
          obscureText: true,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(labelText: 'Neue PIN (leer = aus)'),
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Abbrechen')),
          FilledButton(
              onPressed: () => Navigator.pop(ctx, controller.text),
              child: const Text('Speichern')),
        ],
      ),
    );
    if (pin != null) await lock.setPin(pin);
  }

  @override
  Widget build(BuildContext context) {
    final night = context.watch<NightModeService>();
    final lock = context.watch<LockService>();
    final settings = context.watch<AppSettingsService>();
    final conn = context.read<ConnectionService>();
    final accent = Theme.of(context).colorScheme.primary;
    final offsetLabel =
        '${settings.utcOffset >= 0 ? '+' : ''}${settings.utcOffset}';

    return MyShipScaffold(
      title: 'Einstellungen',
      body: ListView(
        children: [
          const _SectionHeader('Server'),
          ListTile(
            leading: const Icon(Icons.dns),
            title: Text(conn.serverUrl ?? '—'),
            subtitle: Text(_info == null
                ? 'MyShip Gateway'
                : '${_info!.name ?? ''} v${_info!.version ?? ''} · '
                    '${_info!.platform ?? ''}/${_info!.arch ?? ''} · '
                    '${_info!.hostname ?? ''}'),
          ),
          const _SectionHeader('Darstellung'),
          SwitchListTile(
            secondary: const Icon(Icons.dark_mode),
            title: const Text('Nachtmodus (rot)'),
            subtitle: const Text('Schiffsweit, server-synchronisiert'),
            value: night.isNight,
            onChanged: night.setNightMode,
          ),
          const _SectionHeader('Zeit'),
          ListTile(
            leading: const Icon(Icons.schedule),
            title: const Text('UTC-Offset'),
            subtitle: Text('Angezeigte Zeit = UTC $offsetLabel h'),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  icon: const Icon(Icons.remove_circle_outline),
                  onPressed: settings.decrement,
                ),
                SizedBox(
                  width: 36,
                  child: Text(offsetLabel,
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 18, color: accent)),
                ),
                IconButton(
                  icon: const Icon(Icons.add_circle_outline),
                  onPressed: settings.increment,
                ),
              ],
            ),
          ),
          const _SectionHeader('Sicherheit'),
          ListTile(
            leading: const Icon(Icons.lock),
            title: Text(lock.isPinSet ? 'App-PIN ändern/entfernen' : 'App-PIN setzen'),
            onTap: _setPin,
          ),
          const _SectionHeader('System'),
          ListTile(
            leading: const Icon(Icons.notifications_active),
            title: const Text('Alarme'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const AlarmsPage())),
          ),
          ListTile(
            leading: const Icon(Icons.logout),
            title: const Text('Verbindung trennen'),
            onTap: () async {
              await conn.reset();
              if (context.mounted) context.go('/welcome');
            },
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader(this.title);
  final String title;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
        child: Text(title,
            style: Theme.of(context)
                .textTheme
                .labelLarge
                ?.copyWith(color: Theme.of(context).colorScheme.primary)),
      );
}
