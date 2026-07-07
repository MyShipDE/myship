import {GatewayIP} from './GatewayIP';
import {User} from './User';

export class Gateway {
  id: number;
  name: string;
  fingerprint: string;
  secret: string;
  owner: User;
  members: User[];
  ips: GatewayIP[];
  lastHelloRequest: Date;
  createdAt: Date;
  updatedAt: Date;
}
