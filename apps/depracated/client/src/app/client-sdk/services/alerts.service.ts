import {Injectable} from '@angular/core';
import {BaseService} from './base.service';
import {NgBaseService} from "./ng-base.service";

@Injectable({
  providedIn: 'root'
})
export class AlertsService extends NgBaseService {

  type: AlertState;
  message: string;

  constructor() {
    super();
  }

  alert(type: AlertState, msg: string, time: number = 4000): void {
    this.type = type;
    this.message = msg;
    this.visibility = true;
    if (time > 1) {
      setTimeout(() => {
        this.visibility = false;
      }, time);
    }
  }

}

export enum AlertState {
  Success,
  Info,
  Error
}
