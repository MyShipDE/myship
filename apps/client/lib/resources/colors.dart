import 'package:flutter/material.dart';

/// MyShip palette — a black marine dashboard with blue accents. The "dark mode"
/// is a red night mode (blue → red primary) that preserves crew night vision;
/// only the accent changes, the layout stays identical.
class MyShipColors {
  /// Day accent (`$primary` #3399FF in the Angular client).
  static const Color dayPrimary = Color(0xFF3399FF);

  /// Night accent (#C32626 in nightmode.scss).
  static const Color nightPrimary = Color(0xFFC32626);

  /// App background — pure black like the PlanB/MyShip panel.
  static const Color background = Color(0xFF000000);

  /// Slightly lifted surface for panels/cards.
  static const Color surface = Color(0xFF0A0A0A);

  static const Color textWhite = Color(0xFFFFFFFF);

  /// "On" glow for power toggles.
  static const Color onGlow = Color(0xFFFFE24D);

  /// Inactive / off state.
  static const Color off = Color(0xFF555555);

  static Color seed(bool isNight) => isNight ? nightPrimary : dayPrimary;
}
