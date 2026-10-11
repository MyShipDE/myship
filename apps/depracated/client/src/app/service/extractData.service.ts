import {Injectable, OnInit} from '@angular/core';
import {TrackData} from '../client-sdk/models/TrackData';
import {SignalKIdentifier} from '../client-sdk/classes/SignalKIdentifier';
import {TrackDataKey} from '../client-sdk/models/TrackDataKey';
import {TrackDataUnit} from '../client-sdk/models/TrackDataUnit';
import {TrackService} from '../client-sdk/services/track.service';

@Injectable()
export class ExtractDataService {

  trackDataKeys: TrackDataKey[] = [];
  trackDataUnits: TrackDataUnit[] = [];

  constructor(private trackService: TrackService) {
    //
  }

  async init(): Promise<void> {
    if (this.trackDataKeys.length < 1) {
      this.trackDataKeys = await this.trackService.getTrackDataKeys();
    }
    if (this.trackDataUnits.length < 1) {
      this.trackDataUnits = await this.trackService.getTrackDataUnits();
    }
  }

  getData(data: TrackData[], identifierKey: string): number {

    if (data == null) {
      return 0;
    }

    const key = this.trackDataKeys.find(x => x.identifier === identifierKey);
    if (key == null) {
      return 0;
    }

    const item = data.find(d => d.identifierId === key.id)?.value;
    if (item != null) {
      return item;
    }
    return 0;
  }

  getLatitude(data: TrackData[]): number {
    return this.getData(data, SignalKIdentifier.navigationPositionValueLatitude);
  }

  getLongitude(data: TrackData[]): number {
    return this.getData(data, SignalKIdentifier.navigationPositionValueLongitude);
  }

  getCourse(data: TrackData[]): number {
    return this.getData(data, SignalKIdentifier.navigationCourseOverGroundTrue);
  }

  getSpeed(data: TrackData[]): number {
    return this.getData(data, SignalKIdentifier.navigationSpeedOverGround);
  }

  getWindAngle(data: TrackData[]): number {
    return this.getData(data, SignalKIdentifier.environmentWindAngleApparent);
  }

  getWindSpeed(data: TrackData[]): number {
    return this.getData(data, SignalKIdentifier.environmentWindSpeedApparent);
  }

  getOutsideTemperature(data: TrackData[]): number {
    return this.getData(data, SignalKIdentifier.environmentOutsideTemperature);
  }

  getFrequencyTerminalW(data: TrackData[]): number {
    return this.getData(data, SignalKIdentifier.electricalAlternators0RevolutionsValue);
  }

}
