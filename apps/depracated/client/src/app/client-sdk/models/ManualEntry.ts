import {TrackRecord} from "./TrackRecord";
import {TrackDetail} from "./TrackDetails";

export class ManualEntry {
  id: number;
  name: string;
  value: string;
  record: TrackRecord;
  createdAt: Date;
  trackDetail: TrackDetail;
}
