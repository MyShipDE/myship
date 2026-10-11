import {SignalKDatasource} from './SignalKDatasource';

export class Alarm {
  id: number;
  name: string;
  interval: number;
  email: string;
  phone: string;
  showInApp = false;
  minValue: number;
  maxValue: number;
  lastCheck: Date;
  customMailMessage: string;
  active = false;
  reached = false;
  signalKDatasource: SignalKDatasource;
}
