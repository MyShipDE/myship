import 'package:flutter/material.dart';

import '../widgets/myship_widgets.dart';

/// Logbook placeholder. The logbook is being reworked and will move to a cloud
/// variant powered by DiLog; this page just points there.
class LogbookPage extends StatelessWidget {
  const LogbookPage({super.key});

  @override
  Widget build(BuildContext context) {
    return MyShipScaffold(
      title: 'Logbuch',
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 420),
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Image.asset(
                  'assets/logo_white_text.png',
                  height: 96,
                  fit: BoxFit.contain,
                  errorBuilder: (_, _, _) => const Icon(Icons.menu_book, size: 72),
                ),
                const SizedBox(height: 24),
                Text(
                  'Das digitale Logbuch kommt mit DiLog',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 12),
                Text(
                  'Die Logbuch-Funktion wird überarbeitet und künftig als '
                  'Cloud-Variante über DiLog bereitgestellt — das digitale '
                  'Logbuch für maritime und landgebundene Reisen.',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 24),
                Text(
                  'dilog.page',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: Theme.of(context).colorScheme.primary,
                      ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
