import {Track} from "./Track";
import {VoiceEntry} from "./VoiceEntry";
import {ManualEntry} from "./ManualEntry";
import {TrackData} from "./TrackData";

export class TrackRecord {
  id: number;
  track: Track;
  data: TrackData[];
  voiceEntry: VoiceEntry;
  manualEntries: ManualEntry[];
  createdAt: Date;
}
