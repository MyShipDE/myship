import 'package:json_annotation/json_annotation.dart';

part 'ConsumptionStats.g.dart';

/// Response of `/api/electricityConsumption/stats` — energy totals in Wh
/// (ElectricityConsumptionController.GetStats).
@JsonSerializable()
class ConsumptionStats {
  final num? lastDay;
  final num? lastWeek;
  final num? lastMonth;
  final num? lastYear;
  final num? custom;
  final num? itemsCounter;

  ConsumptionStats({
    this.lastDay,
    this.lastWeek,
    this.lastMonth,
    this.lastYear,
    this.custom,
    this.itemsCounter,
  });

  factory ConsumptionStats.fromJson(Map<String, dynamic> json) =>
      _$ConsumptionStatsFromJson(json);

  Map<String, dynamic> toJson() => _$ConsumptionStatsToJson(this);
}
