import 'package:json_annotation/json_annotation.dart';

part 'BatteryLog.g.dart';

/// Historical battery reading (apps/server/src/modals/BatteryLog.ts).
@JsonSerializable()
class BatteryLog {
  final int? id;
  final num? voltage;
  final num? current;
  final num? state;
  final num? remaining;
  final DateTime? createdAt;

  BatteryLog({
    this.id,
    this.voltage,
    this.current,
    this.state,
    this.remaining,
    this.createdAt,
  });

  factory BatteryLog.fromJson(Map<String, dynamic> json) =>
      _$BatteryLogFromJson(json);

  Map<String, dynamic> toJson() => _$BatteryLogToJson(this);
}
