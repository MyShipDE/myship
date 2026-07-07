export interface MailChangeRequest {
  id: number;
  user_id: number;
  email: string;
  newMailVerified: boolean;
  newMailToken: number;
  oldMailVerified: boolean;
  oldMailToken: number;
  expire_at: Date;
}
