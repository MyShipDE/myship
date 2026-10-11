import 'package:json_annotation/json_annotation.dart';

part 'Client.g.dart';

/// Paired client/device record (apps/server/src/modals/Client.ts). Returned by
/// `GET /client`; `token`/`secret` are redacted server-side.
@JsonSerializable()
class Client {
  final int? id;
  final String? uuid;
  final String? comment;
  final bool? isAdmin;
  final String? name;
  final String? platform;
  final String? model;
  final String? manufacturer;

  Client({
    this.id,
    this.uuid,
    this.comment,
    this.isAdmin,
    this.name,
    this.platform,
    this.model,
    this.manufacturer,
  });

  factory Client.fromJson(Map<String, dynamic> json) => _$ClientFromJson(json);

  Map<String, dynamic> toJson() => _$ClientToJson(this);
}
