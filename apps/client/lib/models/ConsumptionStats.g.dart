// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'ConsumptionStats.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ConsumptionStats _$ConsumptionStatsFromJson(Map<String, dynamic> json) =>
    ConsumptionStats(
      lastDay: json['lastDay'] as num?,
      lastWeek: json['lastWeek'] as num?,
      lastMonth: json['lastMonth'] as num?,
      lastYear: json['lastYear'] as num?,
      custom: json['custom'] as num?,
      itemsCounter: json['itemsCounter'] as num?,
    );

Map<String, dynamic> _$ConsumptionStatsToJson(ConsumptionStats instance) =>
    <String, dynamic>{
      'lastDay': instance.lastDay,
      'lastWeek': instance.lastWeek,
      'lastMonth': instance.lastMonth,
      'lastYear': instance.lastYear,
      'custom': instance.custom,
      'itemsCounter': instance.itemsCounter,
    };
