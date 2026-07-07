import {Injectable} from '@angular/core';

@Injectable()
export class AlertsService {

  visibility = false;

  type: AlertState;
  message: string;

  constructor() {
    //
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
