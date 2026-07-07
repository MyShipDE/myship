import {Crew} from "./Crew";
import {Gateway} from "./Gateway";
import {UserDetails} from "./UserDetail";
import {JournalEntity} from "./JournalEntity";
import {Track} from "./Track";

export class Journal {
  id!: number;
  title!: string;
  revier!: string;
  boatName!: string;
  boatType!: string;
  miles!: number;
  year?: number;
  country?: string;
  crew!: Crew;
  gateway!: Gateway;
  user!: UserDetails;
  journals!: JournalEntity[];
  createdAt!: Date;
  updatedAt!: Date;
  tracks: Track[] = [];
  readonly = false;
}
