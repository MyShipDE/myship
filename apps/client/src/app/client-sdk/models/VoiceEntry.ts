import {TrackRecord} from './TrackRecord';
import {TrackDetail} from "./TrackDetails";

export class VoiceEntry {
  id: number;
  message: string;
  createdAt: Date;
  updatedAt: Date;
  records: TrackRecord[];
  trackDetail: TrackDetail;
}
