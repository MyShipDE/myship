import 'package:flutter/widgets.dart';
import 'package:go_router/go_router.dart';

import 'pages/alarms_page.dart';
import 'pages/battery_page.dart';
import 'pages/cam_page.dart';
import 'pages/home_page.dart';
import 'pages/instruments_page.dart';
import 'pages/lights_page.dart';
import 'pages/lock_page.dart';
import 'pages/logbook_page.dart';
import 'pages/plotter_page.dart';
import 'pages/position_lights_page.dart';
import 'pages/settings_page.dart';
import 'pages/ship_page.dart';
import 'pages/verbraucher_page.dart';
import 'pages/weather_page.dart';
import 'pages/welcome_page.dart';
import 'services/lock_service.dart';

/// Wraps a page in a short cross-fade instead of the default slide transition —
/// pages simply appear.
CustomTransitionPage<void> _fade(Widget child) => CustomTransitionPage<void>(
      child: child,
      transitionDuration: const Duration(milliseconds: 150),
      reverseTransitionDuration: const Duration(milliseconds: 150),
      transitionsBuilder: (context, animation, secondaryAnimation, child) =>
          FadeTransition(opacity: animation, child: child),
    );

/// Builds the app router. Onboarding is the entry point and navigates to /home
/// once the gateway connection + pairing succeed (mirrors the Angular
/// WelcomeComponent). When an app PIN is set, [lock] gates everything behind
/// the lock screen until the PIN is entered.
GoRouter buildRouter(LockService lock) => GoRouter(
      initialLocation: '/welcome',
      refreshListenable: lock,
      redirect: (context, state) {
        final loc = state.matchedLocation;
        if (lock.isLocked && loc != '/lock') return '/lock';
        if (!lock.isLocked && loc == '/lock') return '/home';
        return null;
      },
      routes: [
        GoRoute(
            path: '/welcome', pageBuilder: (_, _) => _fade(const WelcomePage())),
        GoRoute(path: '/lock', pageBuilder: (_, _) => _fade(const LockPage())),
        GoRoute(path: '/home', pageBuilder: (_, _) => _fade(const HomePage())),
        GoRoute(path: '/ship', pageBuilder: (_, _) => _fade(const ShipPage())),
        GoRoute(path: '/cam', pageBuilder: (_, _) => _fade(const CamPage())),
        GoRoute(
            path: '/instruments',
            pageBuilder: (_, _) => _fade(const InstrumentsPage())),
        GoRoute(
            path: '/battery', pageBuilder: (_, _) => _fade(const BatteryPage())),
        GoRoute(
            path: '/lights', pageBuilder: (_, _) => _fade(const LightsPage())),
        GoRoute(
            path: '/position-lights',
            pageBuilder: (_, _) => _fade(const PositionLightsPage())),
        GoRoute(
            path: '/verbraucher',
            pageBuilder: (_, _) => _fade(const VerbraucherPage())),
        GoRoute(
            path: '/plotter', pageBuilder: (_, _) => _fade(const PlotterPage())),
        GoRoute(
            path: '/weather', pageBuilder: (_, _) => _fade(const WeatherPage())),
        GoRoute(
            path: '/logbook', pageBuilder: (_, _) => _fade(const LogbookPage())),
        GoRoute(
            path: '/settings',
            pageBuilder: (_, _) => _fade(const SettingsPage())),
        GoRoute(
            path: '/alarms', pageBuilder: (_, _) => _fade(const AlarmsPage())),
      ],
    );
