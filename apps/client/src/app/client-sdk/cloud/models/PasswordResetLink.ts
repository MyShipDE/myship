export interface PasswordResetLink {
  id: number;
  user_id: number;
  code: number;
  expired_at: Date;
}
