import {AddressComponent} from './AddressComponent';
import {ManualEntry} from './ManualEntry';

export class TrackDetail {
  readonly id: number;
  trackId: number;
  lon: number;
  lat: number;
  sog: number;
  cog: number;
  aws: number;
  awa: number;
  frequencyTerminalW: number;
  state: string;
  outsideTemperature: number;
  createdAt: Date;

  addressComponents: AddressComponent[];
  manualEntries: ManualEntry[];
  voiceEntry: VoiceEntry;
}

export class VoiceEntry {
  id: number;
  message: string;
  createdAt: Date;
  updatedAt: Date;
  trackDetail: TrackDetail[];
}
