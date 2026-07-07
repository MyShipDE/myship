import {MembershipProperty} from "./MembershipProperty";

export interface Membership {
  id: number;
  name: string;
  properties: MembershipProperty[];
}
