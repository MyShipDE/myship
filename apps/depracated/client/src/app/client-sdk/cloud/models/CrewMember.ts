import {UserDetails} from "./UserDetail";
import {Gateway} from "./Gateway";

export class CrewMember {
  id!: number;
  name!: string;
  email!: string;
  gateway!: Gateway;
  user!: UserDetails;
  imageUrl = 'assets/profile-user.svg';
}
