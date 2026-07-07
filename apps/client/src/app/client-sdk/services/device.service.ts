import { HttpClient } from '@angular/common/http';
import {HttpService} from './http.service';
import {Device} from '../models/Device';
import {SocketService} from '../../service/socket.service';
import {Injectable} from '@angular/core';
import {Bridge} from '../models/Bridge';
import {SocketChannel} from '../resources/SocketChannel';
import {Subject} from 'rxjs';
import {Helper} from "../../service/Helper";

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  listChangeNotifier: Subject<void> = new Subject<void>();

  showDevicePreview = false;

  list: Device[] = [];

  wsInit = false;

  constructor(private http: HttpClient,
              private httpService: HttpService,
              private socket: SocketService) {
    //
  }

  load(): Promise<void> {
    return new Promise((resolve) => {
      this.http.get<Device[]>(this.httpService.api + '/devices', this.httpService.options)
        .subscribe((devices: Device[]) => {
          this.list = [];
          devices.forEach(device => {
            this.list.push(Object.assign(new Device(), device));
          });
          this.listenWebSocket();
          resolve();
        });
    });
  }

  control(device: Device): Promise<boolean> {
    return new Promise((resolve) => {
      this.http.post(this.httpService.api + '/device/control', {
        device_id: device.id
      }, this.httpService.options)
        .subscribe(() => resolve(true), () => resolve(false));
    });
  }

  Put(device: Device): Promise<boolean> {
    return new Promise((resolve) => {
      this.http.put(this.httpService.api + '/device', device, this.httpService.options)
        .subscribe(() => resolve(true), () => resolve(false));
    });
  }

  Delete(device: Device): Promise<boolean> {
    return new Promise((resolve) => {
      this.http.delete(this.httpService.api + '/device/' + device.id, this.httpService.options)
        .subscribe(() => resolve(true), () => resolve(false));
    });
  }

  GetBridges(): Promise<Bridge[]> {
    return new Promise((resolve) => {
      this.http.get<Bridge[]>(this.httpService.api + '/bridges', this.httpService.options)
        .subscribe((bridges) => resolve(bridges), () => resolve([]));
    });
  }

  getQRCodeContent(device: Device): string {
    return 'MyShip.Device.QR#' + device.identifier;
  }

  async listenWebSocket(): Promise<void> {
    while (!this.wsInit) {
      if (this.socket.client != null && !this.wsInit) {
        this.wsInit = true;
        console.log('Listen Device Changes via WS');
        this.socket.client.on(SocketChannel.DeviceManagedObject.toString(), (device: Device) => {
          if (device == null) {
            return;
          }
          const index = this.list.findIndex(x => x.id === device.id);
          this.list[index] = device;
          this.listChangeNotifier.next();
        });
      }
      await Helper.sleep(2000);
    }

  }

}
