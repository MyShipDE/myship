import {Membership} from "./Membership";

export interface MembershipProperty {
  id: number;
  name: string;
  value: number;
  membership: Membership;
}
