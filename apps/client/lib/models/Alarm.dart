import 'package:json_annotation/json_annotation.dart';

import 'SignalKDatasource.dart';

part 'Alarm.g.dart';

/// A monitoring alarm rule (apps/client/.../models/Alarm.ts).
@JsonSerializable()
class Alarm {
  final int? id;
  final String? name;
  final int? interval;
  final String? email;
  final String? phone;
  final bool? showInApp;
  final num? minValue;
  final num? maxValue;
  final DateTime? lastCheck;
  final String? customMailMessage;
  final bool? active;
  final bool? reached;
  final SignalKDatasource? signalKDatasource;

  Alarm({
    this.id,
    this.name,
    this.interval,
    this.email,
    this.phone,
    this.showInApp,
    this.minValue,
    this.maxValue,
    this.lastCheck,
    this.customMailMessage,
    this.active,
    this.reached,
    this.signalKDatasource,
  });

  Alarm copyWith({bool? active}) => Alarm(
        id: id,
        name: name,
        interval: interval,
        email: email,
        phone: phone,
        showInApp: showInApp,
        minValue: minValue,
        maxValue: maxValue,
        lastCheck: lastCheck,
        customMailMessage: customMailMessage,
        active: active ?? this.active,
        reached: reached,
        signalKDatasource: signalKDatasource,
      );

  factory Alarm.fromJson(Map<String, dynamic> json) => _$AlarmFromJson(json);

  Map<String, dynamic> toJson() => _$AlarmToJson(this);
}
