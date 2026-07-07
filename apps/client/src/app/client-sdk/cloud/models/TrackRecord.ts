import {Track} from "./Track";
import {TrackData} from "./TrackData";
import {VoiceEntry} from "./VoiceEntry";
import {ManualEntry} from "./ManualEntry";

export class TrackRecord {
  id!: number;
  track!: Track;
  data!: TrackData[];
  voiceEntry!: VoiceEntry;
  manualEntries!: ManualEntry[];
  createdAt!: Date;
}
