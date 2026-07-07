import {TrackRecord} from "./TrackRecord";

export class ManualEntry {
  id!: number;
  name!: string;
  value!: string;
  record!: TrackRecord;
  createdAt!: Date;
}
