import 'package:json_annotation/json_annotation.dart';

part 'MapConfig.g.dart';

/// Map provider config served by the gateway (`GET /map/config`).
@JsonSerializable()
class MapConfig {
  final String? key;
  final String? style;

  MapConfig({this.key, this.style});

  factory MapConfig.fromJson(Map<String, dynamic> json) =>
      _$MapConfigFromJson(json);

  Map<String, dynamic> toJson() => _$MapConfigToJson(this);
}
