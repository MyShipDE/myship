import 'package:json_annotation/json_annotation.dart';

part 'InfoDto.g.dart';

/// Response of `GET /info` (apps/server/src/controllers/HomeController.ts).
@JsonSerializable()
class InfoDto {
  final String? name;
  final String? version;
  final String? platform;
  final String? os;
  final String? arch;
  final String? hostname;
  final num? memory;
  final num? uptime;

  InfoDto({
    this.name,
    this.version,
    this.platform,
    this.os,
    this.arch,
    this.hostname,
    this.memory,
    this.uptime,
  });

  factory InfoDto.fromJson(Map<String, dynamic> json) =>
      _$InfoDtoFromJson(json);

  Map<String, dynamic> toJson() => _$InfoDtoToJson(this);
}
