import {HttpClient, HttpErrorResponse} from '@angular/common/http';
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
import {SignalKDataSet} from "../models/SignalKDataSet";

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient,
              private httpService: HttpService) {
  }

  getData(type: string) {
    return new Promise<SignalKDataSet[] | undefined>(resolve => {
      this.http
        .get<SignalKDataSet[]>(this.httpService.api + '/data?type=' + type, this.httpService.options)
        .subscribe((data) => resolve(data), () => resolve(undefined));
    });
  }

}
