export interface Session {
  id: number;
  user_id: number;
  prefix: string;
  secret: string;
  ip: string;
  isVerified: boolean;
  otpActive: boolean;
  pubKey: string;
  expired_at: Date;
  ec?: boolean;
}
