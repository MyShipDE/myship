import {Bridge} from './Bridge';

export class Device {
  id: number;
  name: string;
  identifier: string;
  type: string;
  isActive: boolean;
  isHidden: boolean;
  error: boolean;
  bridge: Bridge;
  bridgePort: number;
  SecurityBlock: number;
  SecurityBlockPort: number;
  SecurityBlockAmpere: number;
  Voltage: string;
  notes: string;
  InstallationDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

