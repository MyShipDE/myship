import {TrackRecord} from "./TrackRecord";
import {Gateway} from "./Gateway";
import {Journal} from "./Journal";

export class Track {
  id!: number;
  name!: string;
  stopAt!: Date;
  lastReminder!: Date;
  records!: TrackRecord[];
  createdAt!: Date;
  gateway!: Gateway;
  journal?: Journal;
}
