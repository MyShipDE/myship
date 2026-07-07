import {TrackRecord} from "./TrackRecord";

export class Track {
  id: number;
  name: string;
  stopAt: Date;
  isHidden = false;
  isSaved = false;
  identifier: string;
  records: TrackRecord[];
  createdAt: Date;
}
