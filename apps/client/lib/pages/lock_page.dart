import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../services/lock_service.dart';

/// PIN entry gate, ported from apps/client/.../lockpage.
class LockPage extends StatefulWidget {
  const LockPage({super.key});

  @override
  State<LockPage> createState() => _LockPageState();
}

class _LockPageState extends State<LockPage> {
  String _input = '';
  bool _error = false;

  void _press(String digit) {
    setState(() {
      _error = false;
      _input += digit;
    });
    if (_input.length >= 4) _submit();
  }

  void _submit() {
    final lock = context.read<LockService>();
    if (lock.unlock(_input)) {
      context.go('/home');
    } else {
      setState(() {
        _error = true;
        _input = '';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.lock, size: 64),
            const SizedBox(height: 16),
            Text(_error ? 'Falsche PIN' : 'PIN eingeben',
                style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 16),
            Text('●' * _input.length,
                style: const TextStyle(fontSize: 28, letterSpacing: 8)),
            const SizedBox(height: 24),
            SizedBox(
              width: 240,
              child: GridView.count(
                shrinkWrap: true,
                crossAxisCount: 3,
                mainAxisSpacing: 8,
                crossAxisSpacing: 8,
                children: [
                  ...List.generate(9, (i) => _key('${i + 1}')),
                  const SizedBox(),
                  _key('0'),
                  IconButton(
                    icon: const Icon(Icons.backspace),
                    onPressed: () => setState(() => _input = _input.isEmpty
                        ? ''
                        : _input.substring(0, _input.length - 1)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _key(String digit) => OutlinedButton(
        onPressed: () => _press(digit),
        child: Text(digit, style: const TextStyle(fontSize: 22)),
      );
}
