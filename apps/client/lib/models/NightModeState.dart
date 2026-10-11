import 'package:json_annotation/json_annotation.dart';

part 'NightModeState.g.dart';

/// Response of `GET /nightmode` — a BooleanDataRegistry property whose `value`
/// carries the vessel-wide night-mode state
/// (apps/server/src/controllers/NightModeController.ts).
@JsonSerializable()
class NightModeState {
  final String? name;
  final bool? value;

  NightModeState({this.name, this.value});

  factory NightModeState.fromJson(Map<String, dynamic> json) =>
      _$NightModeStateFromJson(json);

  Map<String, dynamic> toJson() => _$NightModeStateToJson(this);
}
