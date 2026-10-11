import {Membership} from "./Membership";
import {UserDetails} from "./UserDetail";

export interface ActiveMembership {
  id: number;
  user: UserDetails;
  membership: Membership;
  expiredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  modalVisible: boolean;
}
