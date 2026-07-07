import {Light} from './Light';
import {Scene} from './Scene';

export class LightGroup {
  id: number;
  name: string;
  lastSceneId: number;
  createdAt: Date;
  updateAt: Date;
  lights: Array<Light> = [];
  scenes: Array<Scene> = [];

  get isActive(): boolean {
    return this.lights.find(x => x.isActive) != null;
  }

  r: number;
  g: number;
  b: number;
}
