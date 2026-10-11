import { HttpClient } from '@angular/common/http';
import {HttpService} from './http.service';
import {SocketService} from '../../service/socket.service';
import {LightGroup} from '../models/LightGroup';
import {Scene} from '../models/Scene';
import {Light} from '../models/Light';
import {Injectable} from '@angular/core';
import {SocketChannel} from '../resources/SocketChannel';
import {Helper} from '../../service/Helper';

@Injectable({
  providedIn: 'root'
})
export class LightGroupService {

  list: LightGroup[] = [];

  wsInit = false;

  constructor(private http: HttpClient,
              private httpService: HttpService,
              private socket: SocketService) {
    //
  }

  getState(lightGroup: LightGroup): boolean {
    return lightGroup.lights.find(x => x.isActive) != null;
  }

  load(): Promise<void> {
    return new Promise((resolve) => {
      this.http.get<LightGroup[]>(this.httpService.api + '/lightGroups', this.httpService.options)
        .subscribe((lightGroups: LightGroup[]) => {
          this.list = [];
          lightGroups.forEach(lightGroup => {
            this.list.push(Object.assign(new LightGroup(), lightGroup));
          });
          this.listenWebSocket();
          resolve();
        });
    });
  }

  control(lightGroup: LightGroup, scene: Scene = null): Promise<boolean> {
    return new Promise<boolean>(async resolve => {
      if (scene !== null) {
        this.http.post(this.httpService.api + '/lights/group/control', {
          group_id: lightGroup.id,
          scene_id: scene.id
        }, this.httpService.options).subscribe(async () => {
          resolve(true);
          lightGroup.lights.map(x => x.isActive = true);
        }, error => {
          resolve(false);
        });
      } else if (this.getState(lightGroup)) {
        resolve(await this.controlManual(lightGroup, 0, 0, 0, 255));
      } else if (lightGroup.lastSceneId != null && lightGroup.lastSceneId !== 0) {
        this.http.post(this.httpService.api + '/lights/group/control', {
          group_id: lightGroup.id,
          scene_id: lightGroup.lastSceneId
        }, this.httpService.options).subscribe(() => {
          resolve(true);
          lightGroup.lights.map(x => x.isActive = true);
        }, () => {
          resolve(false);
        });
      } else {
        resolve(await this.controlManual(lightGroup, 255, 180, 80, 255));
      }
    });
  }

  controlManual(lightGroup: LightGroup, r: number, g: number, b: number, brightness: number): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.http.post(this.httpService.api + '/lights/group/control', {
        group_id: lightGroup.id,
        r,
        g,
        b,
        brightness
      }, this.httpService.options).subscribe(() => {
        resolve(true);
        if (r === 0 && g === 0 && b === 0) {
          lightGroup.lights.map(x => x.isActive = false);
        } else {
          lightGroup.lights.map(x => x.isActive = true);
        }
      }, () => {
        resolve(false);
      });
    });
  }

  update(lightGroup: LightGroup): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      if (lightGroup.name !== '' && lightGroup.name != null) {
        this.http.post(this.httpService.api + '/lightGroup', lightGroup, this.httpService.options)
          .subscribe(async () => resolve(true), () => resolve(false));
      } else {
        resolve(false);
      }
    });
  }

  delete(lightGroup: LightGroup): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.http.delete(this.httpService.api + '/lightGroup/' + lightGroup.id, this.httpService.options)
        .subscribe(async () => resolve(true), () => resolve(false));
    });
  }

  async listenWebSocket(): Promise<void> {
    while (!this.wsInit) {
      if (this.socket.client != null && !this.wsInit) {
        this.wsInit = true;
        this.socket.client.on(SocketChannel.LightGroupManagedObject.toString(), (light: Light) => {
          this.list.forEach(lightGroup => {
            lightGroup.lights.forEach(x => {
              if (x.id === light.id) {
                this.list.find(lg => lg.id === lightGroup.id).lights.find(l => l.id === light.id).isActive = light.isActive;
              }
            });
          });
        });
      }
      await Helper.sleep(2000);
    }
  }

}
