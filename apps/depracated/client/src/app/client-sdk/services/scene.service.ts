import { HttpClient } from '@angular/common/http';
import {HttpService} from './http.service';
import {Scene} from '../models/Scene';
import {LightGroup} from '../models/LightGroup';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SceneService {

  constructor(private http: HttpClient,
              private httpService: HttpService) {
    //
  }

  create(scene: Scene): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.http.post(this.httpService.api + '/scene', scene, this.httpService.options)
        .subscribe(async (result: Array<number>) => {
          resolve(true);
        }, () => {
          resolve(false);
        });
    });
  }

  link(scene: Scene, group: LightGroup): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      if (group.id !== 0 && group.id !== null) {
        this.http.post(this.httpService.api + '/scene/link', {
          group_id: group.id,
          scene_id: scene.id
        }, this.httpService.options).subscribe(() => resolve(true), () => resolve(false));
      }
    });
  }

  delete(scene: Scene): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.http.delete(this.httpService.api + '/scene/' + scene.id, this.httpService.options)
        .subscribe(() => resolve(true), () => resolve(false));
    });
  }

}
