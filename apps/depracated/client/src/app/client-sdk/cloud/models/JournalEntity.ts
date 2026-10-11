import {Journal} from "./Journal";
import {JournalEntityAsset} from "./JournalEntityAsset";
import {VoiceEntry} from "./VoiceEntry";

export class JournalEntity {
  id!: number;
  text!: string;
  date!: Date;
  journal!: Journal;
  assets!: JournalEntityAsset[];
  createdAt!: Date;
  voiceEntries!: VoiceEntry[];

  // Non database fields
  assetsLoaded: boolean = false;
  isVisible = false;
}
