import {Injectable} from '@angular/core';

@Injectable()
export class Data {

  private monitoringWindowOpen = false;

  constructor() { }

  public isMonitoringWindowOpen(): boolean {
    return this.monitoringWindowOpen;
  }

  public setMonitoringWindowOpen(monitoringWindowOpen): void {
    this.monitoringWindowOpen = monitoringWindowOpen;
  }

}
