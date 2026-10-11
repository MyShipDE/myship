import {TrackRecord} from "./TrackRecord";
import {TrackDataKey} from "./TrackDataKey";
import {TrackDataUnit} from "./TrackDataUnit";

export class TrackData {
  id: number;
  record: TrackRecord;
  identifier: TrackDataKey;
  identifierId: number;
  unit: TrackDataUnit;
  unitId: number;
  value: number;
}
