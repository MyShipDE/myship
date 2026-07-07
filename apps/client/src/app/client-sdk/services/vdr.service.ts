import { HttpClient } from '@angular/common/http';
import {Track} from '../models/Track';
import {Injectable} from '@angular/core';
import {ManualEntry} from '../models/ManualEntry';
import {AlertsService, AlertState} from '../../service/alerts.service';
import {HttpService} from './http.service';
import {TrackRecord} from "../models/TrackRecord";
import {VoiceEntry} from "../models/VoiceEntry";

@Injectable({
  providedIn: 'root'
})
export class VdrService {

  constructor(private http: HttpClient,
              private alertService: AlertsService,
              private httpService: HttpService) {
  }

  getTrack(trackId: number): Promise<Track> {
    return new Promise<Track>(resolve => {
      this.http
        .get(this.httpService.api + '/track/' + trackId, this.httpService.options)
        .subscribe((track: Track) => {
          resolve(track);
        }, () => resolve(null));
    });
  }

  getTracks(): Promise<Track[]> {
    return new Promise<Track[]>(resolve => {
      this.http
        .get(this.httpService.api + '/tracks', this.httpService.options)
        .subscribe((tracks: Track[]) => {
          resolve(tracks);
        }, () => resolve(null));
    });
  }

  getTracksWithPagination(page: number): Promise<Track[]> {
    return new Promise<Track[]>(resolve => {
      this.http
        .get(this.httpService.api + '/tracks/' + page, this.httpService.options)
        .subscribe((tracks: Track[]) => {
          resolve(tracks);
        }, () => resolve(null));
    });
  }

  getTracksByDateWithPagination(page: number, date: Date): Promise<Track[]> {
    return new Promise<Track[]>(resolve => {
      this.http
        .get(this.httpService.api + `/tracks/date/${date}/${page}`, this.httpService.options)
        .subscribe((tracks: Track[]) => {
          resolve(tracks);
        }, () => resolve(null));
    });
  }

  getTracksWithCustomOperation(take: number, skip: number): Promise<Track[]> {
    return new Promise<Track[]>(resolve => {
      this.http
        .get(this.httpService.api + `/tracks/custom/${take}/${skip}`, this.httpService.options)
        .subscribe((tracks: Track[]) => {
          resolve(tracks);
        }, () => resolve(null));
    });
  }

  getCoordsByDateRange(start: string, end: string): Promise<number[][]> {
    return new Promise<number[][]>(resolve => {
      this.http
        .get(this.httpService.api + `/tracks/coords/${start}/${end}`, this.httpService.options)
        .subscribe((coords: number[][]) => {
          resolve(coords);
        }, () => resolve(null));
    });
  }

  getTracksCount(): Promise<number> {
    return new Promise<number>(resolve => {
      this.http
        .get(this.httpService.api + '/tracks/count', this.httpService.options)
        .subscribe((tracks: any) => {
          resolve(tracks.tracksCount);
        }, () => resolve(0));
    });
  }

  startTrackOnlyDevelopment(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.http
        .post(this.httpService.api + '/api/test/vdr/start', {}, this.httpService.options)
        .subscribe(() => {
          this.alertService.alert(AlertState.Success, 'Der VDR wurde für Test / Entwicklungszwecke gestartet!', 8000);
        }, () => {
          this.alertService.alert(AlertState.Error, 'Der VDR konnte für Test / Entwicklungszwecke nicht gestartet werden!', 8000);
        });
    });
  }

  getRecord(id: number): Promise<TrackRecord> {
    return new Promise<TrackRecord>(resolve => {
      this.http
        .get(this.httpService.api + '/record/' + id, this.httpService.options)
        .subscribe((track: TrackRecord) => {
          resolve(track);
        }, () => resolve(null));
    });
  }

  setGroupOfManualEntries(manualEntries: ManualEntry[]): SortedManualEntries[] {

    if (manualEntries == null) {
      return [];
    }

    const result: SortedManualEntries[] = [];

    for (const manualEntry of manualEntries) {
      const item = result.find(x => x.name === manualEntry.name);
      if (item == null) {
        result.push(new SortedManualEntries(manualEntry.name, [manualEntry.value]));
      } else {
        item.values.push(manualEntry.value);
      }
    }

    return result;
  }

  getVoiceEntries(): Promise<VoiceEntry[]> {
    return new Promise<VoiceEntry[]>(resolve => {
      this.http
        .get<VoiceEntry[]>(this.httpService.api + '/logbook/entries/voice', this.httpService.options)
        .subscribe((entries: VoiceEntry[]) => {
          resolve(entries);
        }, () => resolve(null));
    });
  }

}

export class SortedManualEntries {
  constructor(
    public name?: string,
    public values?: string[]
  ) {
  }
}
