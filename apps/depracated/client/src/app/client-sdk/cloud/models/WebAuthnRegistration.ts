import {User} from "./User";

export interface WebAuthnRegistration {
  id: number;
  description: string;
  user: User;
  credentialID: string;
  credentialPublicKey: string;
  counter: number;
  createdAt: Date;

  // custom
  detailsModalVisible: boolean;

}
