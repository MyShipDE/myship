import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Optional app PIN lock (apps/client lockpage uses `MyShip.Password`). When a
/// PIN is set the app starts locked until the correct PIN is entered.
class LockService extends ChangeNotifier {
  static const _keyPin = 'MyShip.Password';

  String? _pin;
  bool _unlocked = false;

  bool get isPinSet => _pin != null && _pin!.isNotEmpty;

  /// Locked when a PIN is configured but not yet entered this launch.
  bool get isLocked => isPinSet && !_unlocked;

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    _pin = prefs.getString(_keyPin);
    _unlocked = !isPinSet;
    notifyListeners();
  }

  bool unlock(String pin) {
    if (pin == _pin) {
      _unlocked = true;
      notifyListeners();
      return true;
    }
    return false;
  }

  Future<void> setPin(String? pin) async {
    final prefs = await SharedPreferences.getInstance();
    if (pin == null || pin.isEmpty) {
      await prefs.remove(_keyPin);
      _pin = null;
      _unlocked = true;
    } else {
      await prefs.setString(_keyPin, pin);
      _pin = pin;
      _unlocked = true;
    }
    notifyListeners();
  }
}
