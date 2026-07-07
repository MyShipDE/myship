export class Coordinate {
  latitude: number;
  longitude: number;

  constructor(lon: number = null, lat: number = null) {
    if (lon != null) {
      this.longitude = lon;
    }
    if (lat != null) {
      this.latitude = lat;
    }
  }
}
