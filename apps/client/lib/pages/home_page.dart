import 'dart:async';

import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../services/app_settings_service.dart';
import '../services/night_mode_service.dart';
import '../services/signalk_paths.dart';
import '../services/signalk_service.dart';
import '../widgets/myship_widgets.dart';

/// Home dashboard: header (clock, wordmark, night/connection), a grid of
/// bordered menu tiles and a bottom status bar — matching the MyShip panel.
class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _MenuItem {
  final String label;
  final String route;
  final FaIconData icon;
  const _MenuItem(this.label, this.route, this.icon);
}

const _menu = [
  _MenuItem('Beleuchtung', '/lights', FontAwesomeIcons.solidLightbulb),
  _MenuItem('Instrumente', '/instruments', FontAwesomeIcons.gaugeHigh),
  _MenuItem('Batterie', '/battery', FontAwesomeIcons.carBattery),
  _MenuItem(
      'Positionslichter', '/position-lights', FontAwesomeIcons.lightbulb),
  _MenuItem('Verbraucher', '/verbraucher', FontAwesomeIcons.plugCircleBolt),
  _MenuItem('Navigation', '/plotter', FontAwesomeIcons.mapLocationDot),
  _MenuItem('Wetter', '/weather', FontAwesomeIcons.cloudSun),
  _MenuItem('Kamera', '/cam', FontAwesomeIcons.video),
  _MenuItem('Schiff', '/ship', FontAwesomeIcons.sailboat),
  _MenuItem('Logbuch', '/logbook', FontAwesomeIcons.bookOpen),
  _MenuItem('Einstellungen', '/settings', FontAwesomeIcons.gear),
];

class _HomePageState extends State<HomePage> {
  Timer? _clock;

  @override
  void initState() {
    super.initState();
    _clock = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _clock?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final night = context.watch<NightModeService>();
    final accent = Theme.of(context).colorScheme.primary;
    final isMobile = MediaQuery.sizeOf(context).width < 600;

    return Scaffold(
      body: SafeArea(
        child: Column(
          mainAxisAlignment:
              isMobile ? MainAxisAlignment.start : MainAxisAlignment.spaceEvenly,
          children: [
            _header(context, night, accent, isMobile),
            isMobile
                ? Expanded(child: _grid(isMobile: true))
                : _grid(isMobile: false),
            _StatusBar(compact: isMobile),
          ],
        ),
      ),
    );
  }

  Widget _grid({required bool isMobile}) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: isMobile ? 12 : 16),
      child: GridView.builder(
        shrinkWrap: !isMobile,
        physics:
            isMobile ? null : const NeverScrollableScrollPhysics(),
        itemCount: _menu.length,
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          mainAxisSpacing: isMobile ? 10 : 14,
          crossAxisSpacing: isMobile ? 10 : 14,
          mainAxisExtent: isMobile ? 80 : 52,
        ),
        itemBuilder: (_, i) => MyShipTile(
          label: _menu[i].label,
          icon: _menu[i].icon,
          compact: isMobile,
          onTap: () => context.go(_menu[i].route),
        ),
      ),
    );
  }

  Widget _header(
      BuildContext context, NightModeService night, Color accent, bool isMobile) {
    final offset = context.watch<AppSettingsService>().utcOffset;
    final sk = context.read<SignalKService>();
    final dtVal = sk.value('navigation.datetime');
    final baseUtc =
        (dtVal is String ? DateTime.tryParse(dtVal)?.toUtc() : null) ??
            DateTime.now().toUtc();
    final local = baseUtc.add(Duration(hours: offset));
    final utc = DateFormat('HH:mm').format(local);
    final utcLabel = 'UTC ${offset >= 0 ? '+' : ''}$offset';

    return Padding(
      padding: EdgeInsets.fromLTRB(isMobile ? 12 : 24, isMobile ? 24 : 32,
          isMobile ? 12 : 24, isMobile ? 14 : 32),
      child: Row(
        children: [
          Expanded(
            child: InkWell(
              onTap: () => context.go('/settings'),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(utc,
                      style: TextStyle(
                          color: night.isNight ? accent : Colors.white,
                          fontSize: isMobile ? 22 : 32,
                          fontWeight: FontWeight.w600)),
                  Text(utcLabel,
                      style: TextStyle(
                          color: night.isNight
                              ? accent.withValues(alpha: 0.8)
                              : Colors.white54,
                          fontSize: isMobile ? 11 : 14)),
                ],
              ),
            ),
          ),
          Expanded(
            child: Center(
              child: Image.asset(
                night.isNight
                    ? 'assets/myship_red.png'
                    : 'assets/myship_light.png',
                height: isMobile ? 56 : 128,
                fit: BoxFit.contain,
              ),
            ),
          ),
          Expanded(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  tooltip: night.isNight ? 'Tagmodus' : 'Nachtmodus',
                  icon: FaIcon(FontAwesomeIcons.moon,
                      color: night.isNight ? accent : Colors.white,
                      size: isMobile ? 26 : 45),
                  onPressed: () => night.setNightMode(!night.isNight),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusBar extends StatelessWidget {
  const _StatusBar({this.compact = false});

  final bool compact;

  @override
  Widget build(BuildContext context) {
    final sk = context.watch<SignalKService>();
    final accent = Theme.of(context).colorScheme.primary;
    final isNight = context.watch<NightModeService>().isNight;
    final valueColor = isNight ? accent : Colors.white;

    String v(List<String> paths, String unit, {num scale = 1, int d = 2}) {
      final n = sk.firstNumber(paths);
      return n == null ? '—' : '${(n * scale).toStringAsFixed(d)} $unit';
    }

    final items = <List<String>>[
      ['Starterbatterie', v(SignalKPaths.batteryStarterVoltage, 'V')],
      ['Verbraucherbatterie', v(SignalKPaths.batteryMainVoltage, 'V')],
      ['Ladezustand', v(SignalKPaths.batteryMainSoc, '%', scale: 100, d: 0)],
      ['Wind', v(SignalKPaths.windSpeedApparent, 'kn', scale: 1.94384, d: 1)],
      ['SOG', v(SignalKPaths.sog, 'kn', scale: 1.94384, d: 1)],
    ];

    Widget statCol(List<String> it) => Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(it[0],
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(color: accent, fontSize: compact ? 11 : 13)),
            SizedBox(height: compact ? 2 : 4),
            Text(it[1],
                textAlign: TextAlign.center,
                style: TextStyle(
                    color: valueColor, fontSize: compact ? 15 : 20)),
          ],
        );

    Widget rowOf(Iterable<List<String>> slice) => Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children:
              slice.map((it) => Expanded(child: statCol(it))).toList(),
        );

    if (compact) {
      // Two rows (3 + 2) so the labels aren't cramped on narrow screens.
      const firstRow = 3;
      return Padding(
        padding: const EdgeInsets.fromLTRB(10, 12, 10, 16),
        child: Column(
          children: [
            rowOf(items.take(firstRow)),
            const SizedBox(height: 14),
            rowOf(items.skip(firstRow)),
          ],
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 45),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: items.map((it) => Expanded(child: statCol(it))).toList(),
      ),
    );
  }
}
