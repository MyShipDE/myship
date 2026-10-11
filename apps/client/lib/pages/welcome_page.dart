import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:provider/provider.dart';

import '../api/core/api_provider.dart';
import '../services/app_settings_service.dart';
import '../services/auth_service.dart';
import '../services/connection_service.dart';
import '../services/mqtt_service.dart';
import '../services/night_mode_service.dart';
import '../services/signalk_service.dart';
import '../services/socket_service.dart';

/// First-run onboarding. On start it automatically probes for a reachable local
/// gateway and, if found, connects straight away WITHOUT an auth code (the
/// gateway trusts local/boat-network connections unconditionally). Otherwise the
/// user enters the gateway URL and, only for non-local gateways, pairs with a
/// PIN. Also supports the `MyShip.ExpressSetup;<server>#<key>` QR code.
class WelcomePage extends StatefulWidget {
  const WelcomePage({super.key});

  @override
  State<WelcomePage> createState() => _WelcomePageState();
}

enum _Step { url, pin }

class _WelcomePageState extends State<WelcomePage> {
  /// Hosted demo gateway (DEMO_MODE=true). Override at build time with
  /// `--dart-define=MYSHIP_DEMO_URL=<host>`; defaults to a public demo host.
  static const _demoServerUrl =
      String.fromEnvironment('MYSHIP_DEMO_URL', defaultValue: 'demo.myship.page');

  /// Local gateway candidates probed on startup (embedded / on-device case).
  static const _localCandidates = ['127.0.0.1', 'localhost'];

  final _serverCtrl = TextEditingController();
  final _pinCtrl = TextEditingController();

  bool _busy = true;
  _Step _step = _Step.url;
  String _message = 'Verbinde …';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _bootstrap());
  }

  @override
  void dispose() {
    _serverCtrl.dispose();
    _pinCtrl.dispose();
    super.dispose();
  }

  ConnectionService get _connection => context.read<ConnectionService>();
  AuthService get _auth => context.read<AuthService>();

  Future<void> _bootstrap() async {
    if (_connection.isConfigured) {
      _serverCtrl.text = _connection.serverUrl!;
      await _testAndAuthenticate();
      return;
    }
    await _tryLocalDirect();
  }

  /// Probes for a reachable local gateway; if one answers, connects straight to
  /// the app without an auth code (local connections are trusted by the gateway).
  Future<void> _tryLocalDirect() async {
    setState(() {
      _busy = true;
      _message = 'Suche lokalen Server …';
    });
    for (final host in _localCandidates) {
      await _connection.setServerUrl(host);
      if (await _auth.tryConnect()) {
        _serverCtrl.text = host;
        await _finish(); // local = trusted, no PIN needed
        return;
      }
    }
    await _connection.setServerUrl(null);
    if (!mounted) return;
    setState(() {
      _busy = false;
      _step = _Step.url;
      _message = 'Kein lokaler Server gefunden. Bitte Server-Adresse eingeben.';
    });
  }

  Future<void> _testAndAuthenticate() async {
    setState(() {
      _busy = true;
      _message = 'Prüfe Verbindung …';
    });
    if (await _auth.tryConnect()) {
      await _afterConnected();
    } else {
      setState(() {
        _busy = false;
        _step = _Step.url;
        _message = 'Verbindung fehlgeschlagen.';
      });
    }
  }

  Future<void> _afterConnected() async {
    if (await _auth.checkAuth()) {
      await _finish();
    } else {
      setState(() {
        _busy = false;
        _step = _Step.pin;
        _message = 'Bitte Kopplungs-PIN eingeben.';
      });
    }
  }

  Future<void> _submitUrl() async {
    final url = _serverCtrl.text.trim();
    if (url.isEmpty) return;
    await _connection.setServerUrl(url);
    await _testAndAuthenticate();
  }

  Future<void> _submitPin() async {
    final pin = _pinCtrl.text.trim();
    if (pin.isEmpty) return;
    setState(() {
      _busy = true;
      _message = 'Koppele …';
    });
    final ok = await _auth.login(pin);
    if (ok && await _auth.checkAuth()) {
      await _finish();
    } else {
      setState(() {
        _busy = false;
        _message = 'Kopplung fehlgeschlagen. PIN prüfen.';
      });
    }
  }

  /// Starts the realtime services and enters the app.
  Future<void> _finish() async {
    if (!mounted) return;
    // Capture everything that needs the context before awaiting.
    final socket = context.read<SocketService>();
    final signalk = context.read<SignalKService>();
    final mqtt = context.read<MqttService>();
    final nightMode = context.read<NightModeService>();
    final api = context.read<ApiProvider>();
    final settings = context.read<AppSettingsService>();
    final router = GoRouter.of(context);

    socket.connect();
    await signalk.connect();
    await mqtt.connect();
    await nightMode.init();

    // Fetch the gateway's map provider config (best-effort; cached otherwise).
    try {
      final cfg = await api.systemApi.getMapConfig();
      await settings.setMapConfig(cfg.key ?? '', cfg.style ?? '');
    } catch (_) {
      // keep cached config
    }

    router.go('/home');
  }

  /// One-tap connect to the hosted demo gateway (no PIN needed — the demo
  /// gateway authorises every device).
  Future<void> _connectToDemo() async {
    _serverCtrl.text = _demoServerUrl;
    await _connection.setServerUrl(_demoServerUrl);
    await _testAndAuthenticate();
  }

  Future<void> _scanQr() async {
    final code = await Navigator.of(context).push<String>(
      MaterialPageRoute(builder: (_) => const _QrScanPage()),
    );
    if (code == null) return;
    // Format: MyShip.ExpressSetup;<server>#<key>
    final parts = code.split(';');
    if (parts.length == 2 && parts[0] == 'MyShip.ExpressSetup') {
      final data = parts[1].split('#');
      if (data.length == 2) {
        await _connection.setServerUrl(data[0]);
        _serverCtrl.text = data[0];
        _pinCtrl.text = data[1];
        if (await _auth.tryConnect()) {
          await _submitPin();
          return;
        }
      }
    }
    setState(() => _message = 'Ungültiger QR-Code.');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 420),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Icon(Icons.sailing, size: 72),
                const SizedBox(height: 12),
                Text('Willkommen bei MyShip',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.headlineSmall),
                const SizedBox(height: 24),
                Text(_message, textAlign: TextAlign.center),
                const SizedBox(height: 24),
                if (_busy)
                  const Center(child: CircularProgressIndicator())
                else ...[
                  if (_step == _Step.url) ...[
                    TextField(
                      controller: _serverCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Server-Adresse (IP / Host)',
                        border: OutlineInputBorder(),
                      ),
                      onSubmitted: (_) => _submitUrl(),
                    ),
                    const SizedBox(height: 12),
                    FilledButton(
                        onPressed: _submitUrl, child: const Text('Verbinden')),
                  ] else ...[
                    TextField(
                      controller: _pinCtrl,
                      obscureText: true,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Kopplungs-PIN',
                        border: OutlineInputBorder(),
                      ),
                      onSubmitted: (_) => _submitPin(),
                    ),
                    const SizedBox(height: 12),
                    FilledButton(
                        onPressed: _submitPin, child: const Text('Koppeln')),
                  ],
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: _scanQr,
                    icon: const Icon(Icons.qr_code_scanner),
                    label: const Text('QR-Express-Setup'),
                  ),
                  const SizedBox(height: 4),
                  TextButton.icon(
                    onPressed: _connectToDemo,
                    icon: const Icon(Icons.play_circle_outline),
                    label: const Text('Demo ausprobieren'),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Minimal QR scanner that pops the first decoded value.
class _QrScanPage extends StatelessWidget {
  const _QrScanPage();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('QR-Code scannen')),
      body: MobileScanner(
        onDetect: (capture) {
          final value = capture.barcodes.firstOrNull?.rawValue;
          if (value != null) Navigator.of(context).pop(value);
        },
      ),
    );
  }
}
