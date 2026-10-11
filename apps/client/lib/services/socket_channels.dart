/// Socket.IO channel names, ported from the Angular client's SocketChannel enum
/// (apps/client/src/app/client-sdk/resources/SocketChannel.ts). All names are
/// prefixed `MyShipServer.`.
class SocketChannels {
  static const String _p = 'MyShipServer';

  // Notifications (payload-less reload triggers)
  static const clientNotify = '$_p.client.manage.notify';
  static const deviceNotify = '$_p.device.manage.notify';
  static const lightNotify = '$_p.light.manage.notify';
  static const lightGroupNotify = '$_p.lightGroup.manage.notify';
  static const bridgeNotify = '$_p.bridge.manage.notify';
  static const alarmNotify = '$_p.alarm.manage.notify';
  static const fileNotify = '$_p.file.manage.notify';
  static const sceneNotify = '$_p.scene.manage.notify';
  static const settingsNotify = '$_p.settings.manage.notify';
  static const trackNotify = '$_p.track.manage.notify';
  static const nightModeNotify = '$_p.night_mode.state.notify';

  // Objects (carry a payload)
  static const deviceObject = '$_p.device.manage.object';
  static const lightObject = '$_p.light.manage.object';
  static const lightGroupObject = '$_p.lightGroup.manage.object';
  static const trackDetailObject = '$_p.track_detail.manage.object';
  static const trackObject = '$_p.track.manage.object';
  static const audioRecordStateObject = '$_p.audio_record.state.object';
  static const whisperStateObject = '$_p.whisper_service.state.object';
  static const whisperResultObject = '$_p.whisper_service.result.object';
  static const alarmTriggeredObject = '$_p.alarm.triggered.object';
  static const nightModeStateObject = '$_p.night_mode.state.object';
  static const engineLogUpdateObject = '$_p.engine_log_update.object';
  static const engineLogUpdateByDayObject = '$_p.engine_log_update.object.byDay';
  static const powerConnectionObject = '$_p.power_connection.object';
  static const signalKBroadcastObject = '$_p.signalK_data.broadcast.object';
}
