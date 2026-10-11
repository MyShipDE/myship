import {Injectable} from '@angular/core';
import {CustomButtonType} from '../components/controls/ButtonComponent/Button.Component';
import {SocketService} from './socket.service';
import {AlertsService, AlertState} from '../client-sdk/services/alerts.service';
import {SocketChannel} from '../client-sdk/resources/SocketChannel';
import {ConfigurationService} from './configuration.service';
import {AuthService} from '../client-sdk/services/auth.service';
import {Subject} from 'rxjs';
import {IMqttServiceOptions} from "ngx-mqtt";

@Injectable({
  providedIn: 'root'
})
export class CoreService {

  ConnectionChangesSubject: Subject<boolean> = new Subject<boolean>();

  isBusy = false;

  // tslint:disable-next-line:typedef
  get CustomButtonType() {
    return CustomButtonType;
  }

  constructor(private websocket: SocketService,
              private alert: AlertsService,
              private confService: ConfigurationService,
              private authService: AuthService) {
    //
  }

  async isConnectedAndAuthorized(): Promise<boolean> {
    const serverUrl = localStorage.getItem('MyShip.ServerUrl');
    if (serverUrl == null) {
      return false;
    }
    const state = await this.confService.tryConnect(serverUrl) && await this.authService.checkAuth();
    this.ConnectionChangesSubject.next(state);
    return state;
  }

  listenPowerConnection(): void {
    this.websocket.client.on(SocketChannel.PowerConnectionObject.toString(), (state: boolean) => {
      if (state) {
        // this.alert.alert(AlertState.Success, 'Die Netzspannung (220V) liegt an.');
      } else {
        // this.alert.alert(AlertState.Error, 'Es liegt keine Netzspannung (220V) mehr an.');
      }
    });
  }

}


