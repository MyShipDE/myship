import {io, Socket} from 'socket.io-client';
import {Injectable} from '@angular/core';
import {HttpService} from '../client-sdk/services/http.service';
import {CoreService} from './core.service';
import {NightModeService} from '../client-sdk/services/nightMode.service';

@Injectable()
export class SocketService {

  public state = false;
  public client: Socket;

  constructor(private httpService: HttpService, private coreService: CoreService) {
    this.coreService.ConnectionChangesSubject.subscribe((state) => {
      if (this.client == null) {
        this.setupSocketConnection();
      }
    });
  }

  public setupSocketConnection(): void {

    if (localStorage.getItem('MyShip.ServerUrl') != null) {
      const serverUrl = localStorage.getItem('MyShip.ServerUrl');
      if (serverUrl != null || serverUrl !== '') {
        this.client = io(this.httpService.protocol + serverUrl);
      }

      this.client.on('connect', async () => {
        console.log('Die Socket-Verbindung wurde hergestellt!');
        this.state = true;
        this.coreService.ConnectionChangesSubject.next(true);
      });

      this.client.on('disconnect', () => {
        console.log('Die Socket-Verbindung wurde unterbrochen!');
        this.state = false;
        this.coreService.ConnectionChangesSubject.next(false);
      });
    }

  }

}
