import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:media_kit/media_kit.dart';
import 'package:provider/provider.dart';

import 'api/core/api_provider.dart';
import 'nav.dart';
import 'resources/colors.dart';
import 'services/auth_service.dart';
import 'services/connection_service.dart';
import 'services/lock_service.dart';
import 'services/mqtt_service.dart';
import 'services/night_mode_service.dart';
import 'services/app_settings_service.dart';
import 'services/signalk_service.dart';
import 'services/socket_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  MediaKit.ensureInitialized();
  await initializeDateFormatting('de');

  final connection = ConnectionService();
  await connection.load();

  final lock = LockService();
  await lock.load();

  final settings = AppSettingsService();
  await settings.load();

  final apiProvider = ApiProvider(connection);
  final socket = SocketService(connection);
  final signalk = SignalKService(connection);
  final mqtt = MqttService(connection);
  final auth = AuthService(apiProvider.systemApi);
  final nightMode = NightModeService(apiProvider.systemApi, socket);

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: connection),
        ChangeNotifierProvider.value(value: lock),
        ChangeNotifierProvider.value(value: settings),
        ChangeNotifierProvider.value(value: apiProvider),
        ChangeNotifierProvider.value(value: socket),
        ChangeNotifierProvider.value(value: signalk),
        ChangeNotifierProvider.value(value: mqtt),
        Provider.value(value: auth),
        ChangeNotifierProvider.value(value: nightMode),
      ],
      child: MyShipApp(router: buildRouter(lock)),
    ),
  );
}

class MyShipApp extends StatelessWidget {
  const MyShipApp({super.key, required this.router});

  final GoRouter router;

  @override
  Widget build(BuildContext context) {
    // Only the accent colour changes (blue→red) for night mode; the layout stays.
    final isNight = context.watch<NightModeService>().isNight;
    final accent = MyShipColors.seed(isNight);

    final baseText = GoogleFonts.nunitoTextTheme(ThemeData.dark().textTheme)
        .apply(bodyColor: MyShipColors.textWhite, displayColor: MyShipColors.textWhite);

    return MaterialApp.router(
      title: 'MyShip',
      debugShowCheckedModeBanner: false,
      routerConfig: router,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: MyShipColors.background,
        canvasColor: MyShipColors.background,
        textTheme: baseText,
        colorScheme: ColorScheme.dark(
          primary: accent,
          onPrimary: Colors.white,
          secondary: accent,
          onSecondary: Colors.white,
          surface: MyShipColors.background,
          onSurface: MyShipColors.textWhite,
          error: const Color(0xFFCC2727),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: MyShipColors.background,
          foregroundColor: MyShipColors.textWhite,
          elevation: 0,
          centerTitle: true,
        ),
        iconTheme: IconThemeData(color: accent),
        dividerColor: const Color(0xFF222222),
        cardColor: MyShipColors.surface,
        switchTheme: SwitchThemeData(
          thumbColor: WidgetStateProperty.resolveWith(
              (s) => s.contains(WidgetState.selected) ? accent : MyShipColors.off),
          trackColor: WidgetStateProperty.resolveWith((s) =>
              (s.contains(WidgetState.selected) ? accent : MyShipColors.off)
                  .withValues(alpha: 0.4)),
        ),
      ),
    );
  }
}
