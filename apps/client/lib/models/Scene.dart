import 'package:json_annotation/json_annotation.dart';

part 'Scene.g.dart';

/// A lighting scene preset (apps/client/.../models/Scene.ts).
@JsonSerializable()
class Scene {
  final int? id;
  final String? name;
  @JsonKey(name: 'R')
  final int? r;
  @JsonKey(name: 'G')
  final int? g;
  @JsonKey(name: 'B')
  final int? b;
  @JsonKey(name: 'BRI')
  final int? bri;

  Scene({this.id, this.name, this.r, this.g, this.b, this.bri});

  factory Scene.fromJson(Map<String, dynamic> json) => _$SceneFromJson(json);

  Map<String, dynamic> toJson() => _$SceneToJson(this);
}
