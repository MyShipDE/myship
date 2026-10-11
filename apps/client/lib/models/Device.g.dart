// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'Device.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Device _$DeviceFromJson(Map<String, dynamic> json) => Device(
  id: (json['id'] as num?)?.toInt(),
  name: json['name'] as String?,
  identifier: json['identifier'] as String?,
  type: json['type'] as String?,
  isActive: json['isActive'] as bool?,
  isHidden: json['isHidden'] as bool?,
  error: json['error'] as bool?,
  bridge: json['bridge'] == null
      ? null
      : Bridge.fromJson(json['bridge'] as Map<String, dynamic>),
  bridgePort: (json['bridgePort'] as num?)?.toInt(),
  securityBlock: (json['SecurityBlock'] as num?)?.toInt(),
  securityBlockPort: (json['SecurityBlockPort'] as num?)?.toInt(),
  securityBlockAmpere: (json['SecurityBlockAmpere'] as num?)?.toInt(),
  voltage: json['Voltage'] as String?,
  notes: json['notes'] as String?,
);

Map<String, dynamic> _$DeviceToJson(Device instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'identifier': instance.identifier,
  'type': instance.type,
  'isActive': instance.isActive,
  'isHidden': instance.isHidden,
  'error': instance.error,
  'bridge': instance.bridge,
  'bridgePort': instance.bridgePort,
  'SecurityBlock': instance.securityBlock,
  'SecurityBlockPort': instance.securityBlockPort,
  'SecurityBlockAmpere': instance.securityBlockAmpere,
  'Voltage': instance.voltage,
  'notes': instance.notes,
};
