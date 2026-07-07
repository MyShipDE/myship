import {TrackRecord} from "./TrackRecord";

export class VoiceEntry {
  id!: number;
  message!: string;
  createdAt!: Date;
  updatedAt!: Date;
  record!: TrackRecord;
  date!: Date;
}
