export interface Client {
  id: number;
  token: string;
  comment: string;
  secret: string;
  identifier: string;
  isAdmin: boolean;
  ip: string;
  language: string;
  platform: string;
  osType: string;
  osVersion: string;
  name: string;
  model: string;
  manufacturer: string;
  createdAt: Date;
  updatedAt: Date;
}
