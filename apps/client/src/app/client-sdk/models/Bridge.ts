import {BridgeType} from './BridgeType';
import {Device} from './Device';

export class Bridge {
  id: number;
  name: string;
  ip: string;
  type: BridgeType;
  devices: Device[];
  createdAt: Date;
  updatedAt: Date;
}
