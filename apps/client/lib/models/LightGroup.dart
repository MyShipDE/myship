import 'package:json_annotation/json_annotation.dart';

import 'Light.dart';
import 'Scene.dart';

part 'LightGroup.g.dart';

/// A group of lights with associated scenes (apps/client/.../models/LightGroup.ts).
@JsonSerializable()
class LightGroup {
  final int? id;
  final String? name;
  final int? lastSceneId;
  @JsonKey(defaultValue: [])
  final List<Light> lights;
  @JsonKey(defaultValue: [])
  final List<Scene> scenes;

  LightGroup({
    this.id,
    this.name,
    this.lastSceneId,
    this.lights = const [],
    this.scenes = const [],
  });

  /// Group is "on" if any of its lights is active.
  bool get isActive => lights.any((l) => l.isActive == true);

  factory LightGroup.fromJson(Map<String, dynamic> json) =>
      _$LightGroupFromJson(json);

  Map<String, dynamic> toJson() => _$LightGroupToJson(this);
}
