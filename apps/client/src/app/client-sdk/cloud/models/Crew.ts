import {CrewMember} from "./CrewMember";
import {UserDetails} from "./UserDetail";
import {Gateway} from "./Gateway";

export class Crew {
    id!: number;
    skipper!: CrewMember|undefined;
    coSkipper!: CrewMember|undefined;
    navigator!: CrewMember|undefined;
    smutje!: CrewMember|undefined;
    gateway!: Gateway;
    user!: UserDetails;
    crewMembers!: CrewMember[];
}
