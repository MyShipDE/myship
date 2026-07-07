import {Gateway} from "./Gateway";

export class TrackImportJob {
  id!: number;
  path!: string;
  finishedAt!: Date;
  occurredError!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  gateway!: Gateway;
}
