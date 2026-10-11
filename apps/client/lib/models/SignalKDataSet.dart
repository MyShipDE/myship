import 'package:json_annotation/json_annotation.dart';

part 'SignalKDataSet.g.dart';

/// Mirrors the server's SignalKDataSet (apps/server/src/classes/SignalKDataSet.ts):
/// a single cached SignalK path/value with its unit, as returned by `/data` and
/// broadcast over the Socket.IO `signalK_data.broadcast.object` channel.
@JsonSerializable()
class SignalKDataSet {
  final String? path;
  final num? value;
  final String? unit;
  final DateTime? lastUpdate;

  SignalKDataSet({this.path, this.value, this.unit, this.lastUpdate});

  factory SignalKDataSet.fromJson(Map<String, dynamic> json) =>
      _$SignalKDataSetFromJson(json);

  Map<String, dynamic> toJson() => _$SignalKDataSetToJson(this);
}
