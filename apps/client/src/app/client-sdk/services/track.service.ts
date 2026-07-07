import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {HttpService} from './http.service';
import {Track} from '../models/Track';
import {Injectable} from '@angular/core';
import {TrackDataKey} from '../models/TrackDataKey';
import {TrackDataUnit} from '../models/TrackDataUnit';
import {TrackData} from '../models/TrackData';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {Resource} from '../../Resource';
import {AlertsService, AlertState} from '../../service/alerts.service';
import {TrackRecord} from '../models/TrackRecord';
import {ManualEntry} from '../models/ManualEntry';
import {VoiceEntry} from '../models/VoiceEntry';
import {SortedManualEntries} from './vdr.service';

@Injectable({
  providedIn: 'root'
})
export class TrackService {

  constructor(private http: HttpClient,
              private httpService: HttpService,
              private alertService: AlertsService) {
  }

  saveTrack(track: Track): Promise<boolean> {
    const trackData = Object.assign(new Track(), track);
    delete trackData.records;
    return new Promise<boolean>(resolve => {
      this.http
        .put(this.httpService.api + '/track', trackData, this.httpService.options)
        .subscribe(() => resolve(true), () => resolve(false));
    });
  }

  getDates(): Promise<Date[]> {
    return new Promise<Date[]>(resolve => {
      this.http
        .get(this.httpService.api + '/tracks/dates', this.httpService.options)
        .subscribe((result: any) => resolve(result.dates), () => resolve([]));
    });
  }

  getTracksWithPaginationByDate(date: Date, page: number): Promise<Track[]> {
    return new Promise<Track[]>(resolve => {
      this.http
        .get(`${this.httpService.api}/tracks/date/${date.toString()}/${page}`, this.httpService.options)
        .subscribe((tracks: Track[]) => {
          resolve(tracks);
        }, () => resolve(null));
    });
  }

  getTrackDataKeys(): Promise<TrackDataKey[]> {
    return new Promise<TrackDataKey[]>(resolve => {
      this.http
        .get(this.httpService.api + '/track/data/keys', this.httpService.options)
        .subscribe((result: any) => resolve(result), () => resolve([]));
    });
  }

  getTrackDataUnits(): Promise<TrackDataUnit[]> {
    return new Promise<TrackDataUnit[]>(resolve => {
      this.http
        .get(this.httpService.api + '/track/data/units', this.httpService.options)
        .subscribe((result: any) => resolve(result), () => resolve([]));
    });
  }

  getTrackData(recordId: number, key: string): Promise<TrackData> {
    return new Promise<TrackData>(resolve => {
      const req = this.http
        .get(`${this.httpService.api}/track/data/${recordId}/${key}`, this.httpService.options);
      req.pipe(catchError((err: HttpErrorResponse) => {
        return throwError(() => new Error(Resource.TrackDataNotFound));
      }));
      req.subscribe((result: TrackData) => resolve(result), () => resolve(null));
    });
  }

  getTrack(trackId: number): Promise<Track> {
    return new Promise<Track>(resolve => {
      this.http
        .get<Track>(this.httpService.api + '/track/' + trackId, this.httpService.options)
        .subscribe(track => {
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
