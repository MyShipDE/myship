import {Injectable} from '@angular/core';
import {DateHelper} from './DateHelper';
import {dateDiff} from './DateDiff';
import convertGrade from 'convert-grades';
import {Track} from '../client-sdk/models/Track';
import {UnitService} from './unit.service';
import {Coordinate} from '../client-sdk/classes/Coordinate';
import {DistanceUnit} from '../client-sdk/classes/DistanceUnit';

@Injectable()
export class ConvertingService {

  constructor(private unit: UnitService) {
    //
  }

  round(val: number, decimalPlaces: number): number {
    const factor = 10 ** decimalPlaces;
    return Math.round(val * factor) / factor;
  }

  getSpeedAverage(track: Track, distance: number): number {
    return (60 * distance) / ((this.getTime(track).hour * 60) + this.getTime(track).minute);
  }

  getTime(track: Track): any {
    return dateDiff(new Date(track.createdAt), track.stopAt == null ? new Date : new Date(track.stopAt), 'hour', 'minute');
  }

  convert2Date(x): string {
    return DateHelper.convertToDate(x + '');
  }

  convert2Time(x): string {
    return DateHelper.convertToTime(x + '', false);
  }

  mpsToKnots(mps: number): number {
    const knotsPerMeterPerSecond = 1.94384;
    return mps * knotsPerMeterPerSecond;
  }

  rad2deg(rad: number): number {
    const x = rad * 180 / Math.PI;
    if (x < 0) {
      return x * (-1);
    }
    return x;
  }

  ToKnots(x: number): any {
    return x * 1.944;
  }

  secondsToDHMS(seconds: number): string {
    const oneMinute = 60;
    const oneHour = 60 * oneMinute;
    const oneDay = 24 * oneHour;

    const days = Math.floor(seconds / oneDay);
    seconds -= days * oneDay;

    const hours = Math.floor(seconds / oneHour);
    seconds -= hours * oneHour;

    const minutes = Math.floor(seconds / oneMinute);
    seconds -= minutes * oneMinute;

    let result = '';

    if (days > 0) {
      result += `${days}d `;
    }

    if (hours > 0 || result !== '') {
      result += `${hours}h `;
    }

    if (minutes > 0 || result !== '') {
      result += `${minutes}m `;
    }

    result += `${seconds}s`;

    return result;
  }

  calcCelsius(x: number): number {
    return convertGrade(x, 'k', 'c');
  }

  mpsToBeaufort(mps: number): number {
    if (mps < 1) {
      return 0;
    }
    const knots = mps / 0.514444; // 1 Knoten = 0,514444 m/s
    const beaufort = Math.floor((knots + 5) / 5);
    return beaufort;
  }

  getCompassDescription(value: number): string {
    if (value >= 11 && value <= 80) {
      return 'NE';
    } else if (value >= 81 && value <= 100) {
      return 'E';
    } else if (value >= 101 && value <= 170) {
      return 'SE';
    } else if (value >= 171 && value <= 190) {
      return 'S';
    } else if (value >= 191 && value <= 260) {
      return 'SW';
    } else if (value >= 261 && value <= 280) {
      return 'W';
    } else if (value >= 281 && value <= 349) {
      return 'NW';
    } else if (value >= 350 && value <= 10) {
      return 'N';
    } else {
      return '-';
    }
  }

  convertToDegreeMinutes(decimalCoord: number, latitude: boolean): string {
    const absoluteValue = Math.abs(decimalCoord);
    const degrees = Math.floor(absoluteValue);
    const minutes = (absoluteValue - degrees) * 60;
    let direction = '';
    if (latitude) {
      direction = degrees > 0 ? 'N' : 'S';
    } else {
      direction = degrees > 0 ? 'E' : 'W';
    }
    return `${degrees}° ${minutes.toFixed(3)}' ${direction}`;
  }

  getPositionDescription(latitude: number, longitude: number): string {
    if (latitude == null || longitude == null) {
      return '-';
    }
    return `${this.convertToDegreeMinutes(latitude, true)}<br>${this.convertToDegreeMinutes(longitude, false)}`;
  }

  getCourseString(course: number): string {
    if (course == null) {
      return '-';
    }
    return this.unit.convert(course, 'rad').value?.toFixed(0) + '°';
  }

  getSpeedString(speed: number): string {
    if (speed == null) {
      return '-';
    }
    return this.unit.convert(speed, 'm/s').value?.toFixed(1) + 'kn';
  }

  getRPMString(rpm: number): string {
    if (rpm == null) {
      return '-';
    }
    return rpm.toFixed(0) + ' RPM';
  }

  getWindSpeedString(windSpeed: number): string {
    if (windSpeed == null) {
      return '-';
    }
    return this.unit.convert(windSpeed, 'm/s').value?.toFixed(1) + 'kn';
  }

  getWindDirectionString(windDirection: number): string {
    if (windDirection == null) {
      return '-';
    }
    return this.unit.convert(windDirection, 'rad').value?.toFixed(0) + '°';
  }

  getTemperatureString(temperature: number): string {
    if (temperature == null) {
      return '-';
    }
    return this.unit.convert(temperature, 'K').value?.toFixed(1) + '°C';
  }

  secToHours(secs: number): string {
    return Math.floor(secs / 3600) + 'h';
  }

  calculateDistance(coordinates: Coordinate[], unit: DistanceUnit = DistanceUnit.Miles): number {
    let totalDistance = 0;

    for (let i = 1; i < coordinates.length; i++) {
      const prevCoord = coordinates[i - 1];
      const currCoord = coordinates[i];

      // Umrechnung der geografischen Koordinaten in Radianten
      const prevLatRad = this.toRadians(prevCoord.latitude);
      const prevLonRad = this.toRadians(prevCoord.longitude);
      const currLatRad = this.toRadians(currCoord.latitude);
      const currLonRad = this.toRadians(currCoord.longitude);

      // Haversine-Formel zur Berechnung der Distanz zwischen zwei Koordinaten
      const deltaLat = currLatRad - prevLatRad;
      const deltaLon = currLonRad - prevLonRad;
      const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(prevLatRad) *
        Math.cos(currLatRad) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      let distance = 6371 * c; // Erdradius in Kilometern

      if (unit === DistanceUnit.Miles) {
        distance *= 0.621371; // Umrechnung von Kilometern in Meilen
      }

      totalDistance += distance;
    }

    return totalDistance;
  }

  calculateAngle(currentLat: number, currentLon: number, targetLat: number, targetLon: number): number {
    const deltaY = targetLat - currentLat;
    const deltaX = targetLon - currentLon;

    const angleInRadians = Math.atan2(deltaY, deltaX);
    const angleInDegrees = (angleInRadians * 180) / Math.PI;

    // Der Winkel sollte zwischen 0 und 360 Grad liegen
    const positiveAngle = (90 - angleInDegrees + 360) % 360;

    return positiveAngle;
  }

  toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  splitBySeperator(text: string, seperator: string): string[] {
    return text.split(seperator);
  }

  ktsToKmh(knots: number): number {
    const kmPerKnot = 1.852; // 1 Knoten entspricht 1.852 km/h
    const kmph = knots * kmPerKnot;
    return kmph;
  }

}
