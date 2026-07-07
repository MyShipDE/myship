import { HttpClient } from '@angular/common/http';
import {HttpService} from './http.service';
import {Injectable} from '@angular/core';
import {ElectricityConsumption} from '../models/ElectricityConsumption';
import {AlertsService, AlertState} from '../../service/alerts.service';

@Injectable({
  providedIn: 'root'
})
export class ElectricityConsumptionService {

  constructor(private http: HttpClient,
              private httpService: HttpService,
              private alert: AlertsService) {
  }

  get(): Promise<ElectricityConsumption[]> {
    return new Promise<ElectricityConsumption[]>(resolve => {
      this.http
        .get<ElectricityConsumption[]>(this.httpService.api + '/api/electricityConsumption', this.httpService.options)
        .subscribe(items => resolve(items), () => resolve([]));
    });
  }

  save(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.http
        .post(this.httpService.api + '/api/electricityConsumption/save', {}, this.httpService.options)
        .subscribe(() => {
          this.alert.alert(AlertState.Success, 'Die aktuellen Zählerstände wurde gespeichert.');
          resolve(true);
        }, () => resolve(false));
    });
  }

  getStats(): Promise<ConsumptionStats> {
    return new Promise<ConsumptionStats>(resolve => {
      this.http
        .get<ConsumptionStats>(this.httpService.api + '/api/electricityConsumption/stats', this.httpService.options)
        .subscribe((stats) => resolve(stats), () => resolve(null));
    });
  }

}

export interface ConsumptionStats {
  lastDay: number;
  lastWeek: number;
  lastMonth: number;
  lastYear: number;
}
