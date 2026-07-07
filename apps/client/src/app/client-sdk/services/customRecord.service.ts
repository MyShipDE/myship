import {Injectable} from '@angular/core';
import {ManualInputType} from '../models/ManualInput';
import {ManualEntry} from '../models/ManualEntry';
import { HttpClient } from '@angular/common/http';
import {HttpService} from './http.service';
import {AlertsService, AlertState} from '../../service/alerts.service';
import {NgBaseService} from "./ng-base.service";

@Injectable({
  providedIn: 'root'
})
export class CustomRecordService extends NgBaseService {

  constructor(private http: HttpClient,
              private httpService: HttpService,
              private alertService: AlertsService) {
    super();
  }

  async createManualRecord(manualInputTypes: ManualInputType[]): Promise<void> {
    const values: ManualEntry[] = [];

    manualInputTypes.forEach(item => {
      item.values.forEach(x => {
        if (x.IsSelected) {
          const manualEntry = new ManualEntry();
          manualEntry.name = item.name;
          manualEntry.value = x.name;
          x.IsSelected = false;
          values.push(manualEntry);
        }
      });
    });
    await this.PostEntry(values);
    this.setVisibility(false);
  }

  PostEntry(values: ManualEntry[]): Promise<void> {
    return new Promise<void>(resolve => {
      this.http
        .post(this.httpService.api + '/api/vdr/record/manual', {values}, this.httpService.options)
        .subscribe(() => {
          this.alertService.alert(AlertState.Success, 'Der Logbuch-Eintrag wurde angelegt.');
          resolve();
        }, err => {
          if (err.status === 405) {
            this.alertService.alert(AlertState.Error, 'Der Logbuch-Eintrag kann nicht angelegt werden, da kein aktivier Track vorhanden ist!');
          } else {
            this.alertService.alert(AlertState.Error, 'Der Logbuch-Eintrag konnte nicht angelegt werden!');
          }
          resolve();
        });
    });
  }

}

