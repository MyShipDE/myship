import {Gateway} from './Gateway';

export class User {
  id: number;
  username: string;
  password: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UserDetails {
  id: number;
  firstname: string;
  lastname: string;

  // tslint:disable-next-line:variable-name
  permitted_gateways: Gateway[];
  gateways: Gateway[];
  user: User;
}
