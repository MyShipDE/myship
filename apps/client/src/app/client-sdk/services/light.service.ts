import { HttpClient } from '@angular/common/http';
import {HttpService} from './http.service';
import {SocketService} from '../../service/socket.service';
import {Light} from '../models/Light';
import {Injectable} from '@angular/core';
import {SocketChannel} from '../resources/SocketChannel';

@Injectable({
  providedIn: 'root'
})
export class LightService {

  list: Light[] = [];

  constructor(private http: HttpClient,
              private httpService: HttpService,
              private socket: SocketService) {
    //
  }

  load(): Promise<void> {
    return new Promise((resolve) => {
      this.http.get<Light[]>(this.httpService.api + '/lights', this.httpService.options)
        .subscribe((lights: Light[]) => {
          this.list = [];
          lights.forEach(light => {
            this.list.push(Object.assign(new Light(), light));
          });
          this.listenWebSocket();
          resolve();
        });
    });
  }

  control(light: Light, r: number, g: number, b: number, brightness: number): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.http.post(this.httpService.api + '/lights/control', {
        light_id: light.id,
        r,
        g,
        b,
        brightness
      }, this.httpService.options).subscribe(async () => {
        resolve(true);
      }, error => {
        resolve(false);
      });
    });
  }

  listenWebSocket(): void {
    this.socket.client.on(SocketChannel.LightManagedObject.toString(), (light: Light) => {
      this.list.forEach(x => {
        if (x.id === light.id) {
          x = light;
        }
      });
    });
  }

}
