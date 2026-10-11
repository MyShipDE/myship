import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:go_router/go_router.dart';

import '../resources/colors.dart';

/// Page scaffold matching the MyShip panel: black background, a home icon
/// top-left, a large blue (accent) title centred, and optional actions right.
class MyShipScaffold extends StatelessWidget {
  const MyShipScaffold({
    super.key,
    required this.title,
    required this.body,
    this.actions = const [],
    this.showHome = true,
    this.onHome,
  });

  final String title;
  final Widget body;
  final List<Widget> actions;
  final bool showHome;
  final VoidCallback? onHome;

  @override
  Widget build(BuildContext context) {
    final accent = Theme.of(context).colorScheme.primary;
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 10, 20, 6),
              child: SizedBox(
                height: 64,
                child: Stack(
                  children: [
                    Align(
                      alignment: Alignment.center,
                      child: Text(
                        title,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: accent,
                          fontSize: 28,
                          fontWeight: FontWeight.w300,
                        ),
                      ),
                    ),
                    if (showHome)
                      Align(
                        alignment: Alignment.centerLeft,
                        child: IconButton(
                          icon: const FaIcon(FontAwesomeIcons.house, size: 32),
                          color: Colors.white,
                          onPressed: onHome ?? () => context.go('/home'),
                        ),
                      ),
                    if (actions.isNotEmpty)
                      Align(
                        alignment: Alignment.centerRight,
                        child: Row(mainAxisSize: MainAxisSize.min, children: actions),
                      ),
                  ],
                ),
              ),
            ),
            Expanded(child: body),
          ],
        ),
      ),
    );
  }
}

/// A thin-bordered, rounded accent button — the signature MyShip tile used on
/// the home grid. Wide text-only on tablet/desktop; on mobile ([compact]) it
/// shows the [icon] with a small label underneath.
class MyShipTile extends StatelessWidget {
  const MyShipTile({
    super.key,
    required this.label,
    required this.onTap,
    this.icon,
    this.compact = false,
  });

  final String label;
  final VoidCallback onTap;
  final FaIconData? icon;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final accent = Theme.of(context).colorScheme.primary;

    final Widget content = (compact && icon != null)
        ? Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              FaIcon(icon, color: accent, size: 16),
              const SizedBox(height: 8),
              Text(
                label,
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                    color: accent, fontSize: 10, fontWeight: FontWeight.w500),
              ),
            ],
          )
        : Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
                color: accent, fontSize: 22, fontWeight: FontWeight.w500),
          );

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: accent, width: 1.5),
          ),
          alignment: Alignment.center,
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
          child: content,
        ),
      ),
    );
  }
}

/// A bordered control row: a label on the left, a glowing power toggle, and an
/// optional gear (settings) action — used for lights, position lights and
/// consumers.
class MyShipPowerRow extends StatelessWidget {
  const MyShipPowerRow({
    super.key,
    required this.label,
    required this.active,
    required this.onToggle,
    this.onSettings,
  });

  final String label;
  final bool active;
  final VoidCallback onToggle;
  final VoidCallback? onSettings;

  @override
  Widget build(BuildContext context) {
    final accent = Theme.of(context).colorScheme.primary;
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: accent, width: 1.5),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: [
          Expanded(
            child: Text(label,
                style: TextStyle(color: accent, fontSize: 18)),
          ),
          _PowerButton(active: active, onTap: onToggle),
          if (onSettings != null) ...[
            const SizedBox(width: 20),
            IconButton(
              icon: FaIcon(FontAwesomeIcons.gear, color: accent, size: 20),
              onPressed: onSettings,
            ),
          ],
        ],
      ),
    );
  }
}

class _PowerButton extends StatelessWidget {
  const _PowerButton({required this.active, required this.onTap});

  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: active
            ? BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: MyShipColors.onGlow.withValues(alpha: 0.7),
                    blurRadius: 18,
                    spreadRadius: 1,
                  ),
                ],
              )
            : null,
        child: FaIcon(
          FontAwesomeIcons.powerOff,
          size: 24,
          color: active ? Colors.white : MyShipColors.off,
        ),
      ),
    );
  }
}
