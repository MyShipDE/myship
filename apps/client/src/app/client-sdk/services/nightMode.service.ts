import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {HttpService} from './http.service';
import {SocketService} from '../../service/socket.service';
import {SocketChannel} from '../resources/SocketChannel';
import {Subject} from 'rxjs';

@Injectable()
export class NightModeService {
  status = false;
  nightModeChangedSubject: Subject<boolean> = new Subject<boolean>();

  wsRetryInterval: NodeJS.Timeout;

  constructor(private http: HttpClient, private httpService: HttpService, private websocket: SocketService) {
    const state = localStorage.getItem('MyShip.NightModeState');
    if (state != null) {
      this.status = state === 'true';
    }
  }

  getState(): Promise<boolean> {
    return new Promise(resolve => {
      this.http
        .get(this.httpService.api + '/nightmode', this.httpService.options)
        .subscribe((result: any) => {
          resolve(result.value);
          localStorage.setItem('MyShip.NightModeState', result.value ? 'true' : 'false');
          this.wsRetryInterval = setInterval(() => {
            if (this.websocket.client.connected) {
              this.listenWebSocket();
              clearInterval(this.wsRetryInterval);
            }
          }, 2000);
        }, () => resolve(null));
    });
  }

  setState(status: boolean): Promise<boolean> {
    localStorage.setItem('MyShip.NightModeState', status ? 'true' : 'false');
    return new Promise(resolve => {
      this.http
        .put(this.httpService.api + '/nightmode', {
          state: status
        }, this.httpService.options)
        .subscribe(() => resolve(true), () => resolve(false));
    });
  }

  listenWebSocket(): void {
    this.websocket.client.on(SocketChannel.NightModeStateManagedObject.toString(), (state: boolean) => {
      this.status = state;
      localStorage.setItem('MyShip.NightModeState', state ? 'true' : 'false');
      this.nightModeChangedSubject.next(state);
    });
  }
}
