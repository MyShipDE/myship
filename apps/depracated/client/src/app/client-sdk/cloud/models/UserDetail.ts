import {Gateway} from "./Gateway";
import {Journal} from "./Journal";
import {User} from "./User";

export class UserDetails {
  id!: number;
  firstname!: string;
  lastname!: string;
  user!: User;
  gateways!: Gateway[];
  permitted_gateways!: Gateway[];
  journals!: Journal[];
  phone!: string;
  usedStorageSpace!: number;
  mapType!: any; // MapType;
}
