import {JournalEntity} from "./JournalEntity";

export class JournalEntityAsset {
  id!: number;
  filename!: string;
  journalEntity!: JournalEntity;
  createdAt!: Date;
  updatedAt!: Date;
  latitude!: number;
  longitude!: number;

  imageLoaded = false;
  largeImageLoaded = false;
  imageUrl = '';

}
