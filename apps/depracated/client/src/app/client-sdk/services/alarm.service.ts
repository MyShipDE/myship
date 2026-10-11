import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Alarm} from '../models/Alarm';
import {SignalKDatasource} from '../models/SignalKDatasource';
import {HttpService} from './http.service';

@Injectable({
  providedIn: 'root'
})
export class AlarmService {

  constructor(private http: HttpClient,
              private httpService: HttpService) {
  }

  get(): Promise<Alarm[]> {
    return new Promise<Alarm[]>(resolve => {
      this.http
        .get<Alarm[]>(this.httpService.api + '/alarms', this.httpService.options)
        .subscribe(alarms => resolve(alarms), () => resolve([]));
    });
  }

  getSensors(): Promise<SignalKDatasource[]> {
    return new Promise<SignalKDatasource[]>(resolve => {
      this.http
        .get<SignalKDatasource[]>(this.httpService.api + '/sensors', this.httpService.options)
        .subscribe(data => resolve(data), () => resolve([]));
    });
  }

  save(alarm: Alarm): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.http
        .put(this.httpService.api + '/alarm', alarm, this.httpService.options)
        .subscribe(() => resolve(true), () => resolve(false));
    });
  }

  remove(alarm: Alarm): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.http
        .delete(this.httpService.api + '/alarm/' + alarm.id, this.httpService.options)
        .subscribe(() => resolve(true), () => resolve(false));
    });
  }

}
