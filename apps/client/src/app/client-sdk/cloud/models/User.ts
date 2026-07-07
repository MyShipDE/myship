import {WebAuthnRegistration} from "./WebAuthnRegistration";

export interface User {
  id: number;
  group_id: number;
  team_id: number;
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  birthday: Date;
  email: string;
  phone: string;
  street: string;
  houseNr: string;
  zip: number;
  city: string;
  country: string;
  nationality: string;
  isActive: boolean;
  verifyCode: number;
  verified: boolean;
  otpActive: boolean;
  otpSecret: string;
  createdAt: Date;
  updatedAt: Date;
  webAuthnRegistrations: WebAuthnRegistration[];
}
