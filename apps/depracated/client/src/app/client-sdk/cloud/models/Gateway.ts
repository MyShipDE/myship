import {UserDetails} from "./UserDetail";
import {Journal} from "./Journal";
import {Crew} from "./Crew";
import {CrewMember} from "./CrewMember";
import {Track} from "./Track";
import {GatewayIP} from "./GatewayIP";

export class Gateway {
  id!: number;
  name!: string;
  owner: UserDetails|null = null;
  members!: UserDetails[];
  ips!: GatewayIP[];
  journals!: Journal[];
  crews!: Crew[];
  crewMembers!: CrewMember[];
  savedTracks!: Track[];
  lastHelloRequest!: Date;
  createdAt!: Date;
  updatedAt!: Date;

  isOwner = false;
  isMember = false;
}
