/// Candidate SignalK paths. MyShip gateways emit navigation data under a custom
/// `position-lights.*` prefix (see apps/client/.../ship + maschine components);
/// the standard `navigation.*` paths are listed as fallbacks. Electrical and
/// environment paths follow the SignalK standard.
class SignalKPaths {
  static const position = ['position-lights.position', 'navigation.position'];
  static const sog = [
    'position-lights.speedOverGround',
    'navigation.speedOverGround',
  ];
  static const cog = [
    'position-lights.courseOverGroundTrue',
    'navigation.courseOverGroundTrue',
  ];
  static const heading = [
    'position-lights.headingMagnetic',
    'navigation.headingMagnetic',
  ];
  static const depthBelowKeel = ['environment.depth.belowKeel'];
  static const windSpeedApparent = ['environment.wind.speedApparent'];
  static const windAngleApparent = ['environment.wind.angleApparent'];
  static const outsideTemperature = ['environment.outside.temperature'];

  // Electrical (standard SignalK)
  static const batteryMainVoltage = ['electrical.batteries.main.voltage'];
  static const batteryMainCurrent = ['electrical.batteries.main.current'];
  static const batteryMainSoc = [
    'electrical.batteries.main.capacity.stateOfCharge',
  ];
  static const batteryStarterVoltage = ['electrical.batteries.starter.voltage'];
  static const engineRevolutions = ['electrical.alternators.0.revolutions'];
}
