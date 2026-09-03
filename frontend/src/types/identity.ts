export type AadhaarVerificationStatus = 'PENDING' | 'OTP_SENT' | 'VERIFIED' | 'FAILED' | 'EXPIRED' | 'LOCKED';

export interface AadhaarVerificationRecord {
  userId: string;
  status: AadhaarVerificationStatus;
  isVerified: boolean;
  maskedAadhaar?: string | null;
  verifiedAt?: string | null;
  providerRef?: string | null;
  verificationMethod?: string;
  skippedForSession?: boolean;
}

export interface StartAadhaarResponse {
  success: boolean;
  txn_id?: string;
  masked_aadhaar?: string;
  status?: AadhaarVerificationStatus;
  expires_in_seconds?: number;
  resend_cooldown_seconds?: number;
  message: string;
  error_code?: string;
  provider_mode?: string;
  sandbox_hint?: string | null;
}

export interface VerifyOtpResponse {
  success: boolean;
  status?: AadhaarVerificationStatus;
  is_verified?: boolean;
  masked_aadhaar?: string;
  verified_at?: string;
  message: string;
  error_code?: string;
  remaining_attempts?: number;
}

export interface ResendOtpResponse {
  success: boolean;
  txn_id?: string;
  masked_aadhaar?: string;
  resend_count?: number;
  expires_in_seconds?: number;
  resend_cooldown_seconds?: number;
  message: string;
  error_code?: string;
  sandbox_hint?: string | null;
}
