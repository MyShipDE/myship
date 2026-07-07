import {TrackRecord} from "./TrackRecord";
import {TrackDataKey} from "./TrackDataKey";
import {TrackDataUnit} from "./TrackDataUnit";

export class TrackData {
  id!: number;
  record!: TrackRecord;
  identifierId!: number;
  identifier!: TrackDataKey;
  unitId!: number;
  unit!: TrackDataUnit;
  value!: number;
}
