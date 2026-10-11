import 'package:json_annotation/json_annotation.dart';

part 'SignalKDatasource.g.dart';

/// A SignalK path used as an alarm sensor (apps/server/src/modals/SignalKDatasource.ts).
@JsonSerializable()
class SignalKDatasource {
  final int? id;
  final String? name;
  final String? path;
  final String? unit;

  SignalKDatasource({this.id, this.name, this.path, this.unit});

  factory SignalKDatasource.fromJson(Map<String, dynamic> json) =>
      _$SignalKDatasourceFromJson(json);

  Map<String, dynamic> toJson() => _$SignalKDatasourceToJson(this);
}
