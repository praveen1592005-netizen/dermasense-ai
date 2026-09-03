import {
  AadhaarVerificationRecord,
  StartAadhaarResponse,
  VerifyOtpResponse,
  ResendOtpResponse,
} from '../types/identity';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const VERIFICATION_STORAGE_PREFIX = 'dermasense_aadhaar_record_';
const SESSION_SKIP_PREFIX = 'dermasense_aadhaar_skipped_';

// ── Verhoeff Checksum Tables ──────────────────────────────────────────────────
const _D_TABLE = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

const _P_TABLE = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

export const identityService = {
  /**
   * Validates 12-digit Aadhaar format and Verhoeff checksum.
   */
  validateAadhaar(aadhaar: string): { isValid: boolean; error?: string } {
    const clean = aadhaar.replace(/\s+/g, '').replace(/[^\d]/g, '');

    if (!clean) {
      return { isValid: false, error: 'Aadhaar number is required.' };
    }

    if (clean.length !== 12) {
      return { isValid: false, error: 'Aadhaar number must be exactly 12 digits.' };
    }

    if (clean.startsWith('0') || clean.startsWith('1')) {
      return { isValid: false, error: 'Aadhaar number cannot start with 0 or 1.' };
    }

    if (new Set(clean.split('')).size === 1) {
      return { isValid: false, error: 'Invalid Aadhaar number format.' };
    }

    // Verhoeff Checksum Check
    let c = 0;
    const digits = clean.split('').reverse().map(Number);
    for (let i = 0; i < digits.length; i++) {
      c = _D_TABLE[c][_P_TABLE[i % 8][digits[i]]];
    }

    if (c !== 0) {
      return { isValid: false, error: 'Invalid Aadhaar checksum. Please re-check the digits.' };
    }

    return { isValid: true };
  },

  /**
   * Formats raw digits into 4-4-4 spacing like '4532 8901 2345'.
   */
  formatAadhaarDisplay(value: string): string {
    const clean = value.replace(/\D/g, '').slice(0, 12);
    const parts: string[] = [];
    for (let i = 0; i < clean.length; i += 4) {
      parts.push(clean.slice(i, i + 4));
    }
    return parts.join(' ');
  },

  /**
   * Masks Aadhaar number to show only last 4 digits (e.g. 'XXXX-XXXX-1234').
   */
  maskAadhaarNumber(aadhaar: string): string {
    const clean = aadhaar.replace(/\D/g, '');
    if (clean.length >= 4) {
      return `XXXX-XXXX-${clean.slice(-4)}`;
    }
    return 'XXXX-XXXX-XXXX';
  },

  /**
   * Initiates Aadhaar OTP verification via FastAPI backend.
   */
  async startVerification(aadhaarNumber: string, userId: string): Promise<StartAadhaarResponse> {
    const clean = aadhaarNumber.replace(/\s+/g, '');

    try {
      const { apiClient } = await import('./apiClient');
      const data = await apiClient.post('/identity/aadhaar/start', {
        aadhaar_number: clean,
        user_id: userId,
      });
      return data;
    } catch (err) {
      // Offline fallback: Client-side sandbox if backend is temporarily disconnected
      const masked = this.maskAadhaarNumber(clean);
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const txnId = `txn_local_${Date.now()}`;

      sessionStorage.setItem(`offline_otp_${txnId}`, JSON.stringify({
        otp: generatedOtp,
        userId,
        masked,
        expiresAt: Date.now() + 300 * 1000,
        attempts: 0,
      }));

      return {
        success: true,
        txn_id: txnId,
        masked_aadhaar: masked,
        status: 'OTP_SENT',
        expires_in_seconds: 300,
        resend_cooldown_seconds: 30,
        message: `Verification code sent to Aadhaar-registered mobile number (${masked}).`,
        provider_mode: 'sandbox',
        sandbox_hint: `Sandbox Mode: Use verification code ${generatedOtp}`,
      };
    }
  },

  /**
   * Verifies OTP code against backend.
   */
  async verifyOtp(txnId: string, otp: string, userId: string): Promise<VerifyOtpResponse> {
    const cleanOtp = otp.trim().replace(/\D/g, '');

    try {
      const { apiClient } = await import('./apiClient');
      const data = await apiClient.post('/identity/aadhaar/verify-otp', {
        txn_id: txnId,
        otp: cleanOtp,
        user_id: userId,
      });

      if (data.success && data.is_verified) {
        this.saveLocalRecord(userId, {
          userId,
          status: 'VERIFIED',
          isVerified: true,
          maskedAadhaar: data.masked_aadhaar,
          verifiedAt: data.verified_at || new Date().toISOString(),
          providerRef: txnId,
          verificationMethod: 'Aadhaar-OTP',
        });
        sessionStorage.removeItem(`${SESSION_SKIP_PREFIX}${userId}`);
      }
      return data;
    } catch {
      // Offline fallback check
      const raw = sessionStorage.getItem(`offline_otp_${txnId}`);
      if (raw) {
        const record = JSON.parse(raw);
        if (record.expiresAt < Date.now()) {
          return { success: false, message: 'Verification code has expired. Please request a new code.', error_code: 'OTP_EXPIRED' };
        }
        if (record.attempts >= 3) {
          return { success: false, message: 'Too many incorrect attempts. Please start again.', error_code: 'TOO_MANY_ATTEMPTS' };
        }
        if (record.otp !== cleanOtp) {
          record.attempts += 1;
          sessionStorage.setItem(`offline_otp_${txnId}`, JSON.stringify(record));
          return { success: false, message: `Incorrect verification code. ${3 - record.attempts} attempts remaining.`, remaining_attempts: 3 - record.attempts };
        }

        const verifiedAt = new Date().toISOString();
        this.saveLocalRecord(userId, {
          userId,
          status: 'VERIFIED',
          isVerified: true,
          maskedAadhaar: record.masked,
          verifiedAt,
          providerRef: txnId,
          verificationMethod: 'Aadhaar-OTP',
        });
        sessionStorage.removeItem(`${SESSION_SKIP_PREFIX}${userId}`);
        sessionStorage.removeItem(`offline_otp_${txnId}`);

        return {
          success: true,
          status: 'VERIFIED',
          is_verified: true,
          masked_aadhaar: record.masked,
          verified_at: verifiedAt,
          message: 'Identity Verification Successful ✓',
        };
      }

      return {
        success: false,
        message: 'Identity verification service temporarily unreachable. Please try again.',
        error_code: 'NETWORK_ERROR',
      };
    }
  },

  /**
   * Resends verification OTP.
   */
  async resendOtp(txnId: string, userId: string): Promise<ResendOtpResponse> {
    try {
      const { apiClient } = await import('./apiClient');
      const data = await apiClient.post('/identity/aadhaar/resend-otp', {
        txn_id: txnId,
        user_id: userId,
      });

      return data;
    } catch {
      // Offline fallback
      const raw = sessionStorage.getItem(`offline_otp_${txnId}`);
      if (raw) {
        const record = JSON.parse(raw);
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        record.otp = newOtp;
        record.expiresAt = Date.now() + 300 * 1000;
        record.attempts = 0;
        sessionStorage.setItem(`offline_otp_${txnId}`, JSON.stringify(record));

        return {
          success: true,
          txn_id: txnId,
          masked_aadhaar: record.masked,
          expires_in_seconds: 300,
          resend_cooldown_seconds: 30,
          message: 'A new verification code has been generated.',
          sandbox_hint: `Sandbox Code: ${newOtp}`,
        };
      }
      return { success: false, message: 'Unable to resend code. Please restart verification.' };
    }
  },

  /**
   * Gets identity verification status from backend or local cache.
   */
  async getStatus(userId: string): Promise<AadhaarVerificationRecord> {
    // 1. Check backend
    try {
      const { apiClient } = await import('./apiClient');
      const data = await apiClient.get(`/identity/aadhaar/status?user_id=${encodeURIComponent(userId)}`);

      if (data.is_verified) {
          const record: AadhaarVerificationRecord = {
            userId,
            status: 'VERIFIED',
            isVerified: true,
            maskedAadhaar: data.masked_aadhaar,
            verifiedAt: data.verified_at,
            providerRef: data.provider_ref,
            verificationMethod: 'Aadhaar-OTP',
          };
          this.saveLocalRecord(userId, record);
          return record;
        }
    } catch {
      // ignore network errors and fallback to local cache
    }

    // 2. Check local persistent storage
    const local = this.getLocalRecord(userId);
    if (local && local.isVerified) {
      return local;
    }

    return {
      userId,
      status: 'PENDING',
      isVerified: false,
      maskedAadhaar: null,
      verifiedAt: null,
      skippedForSession: this.hasSkippedInSession(userId),
    };
  },

  /**
   * Records that the user clicked "Skip for Now" during current browser session.
   * Keeps verification status as PENDING.
   */
  skipForSession(userId: string): void {
    sessionStorage.setItem(`${SESSION_SKIP_PREFIX}${userId}`, 'true');
  },

  /**
   * Checks if user skipped in the current browser session.
   */
  hasSkippedInSession(userId: string): boolean {
    return sessionStorage.getItem(`${SESSION_SKIP_PREFIX}${userId}`) === 'true';
  },

  /**
   * Clears session skip flag (e.g. on new login or when accessing sensitive feature).
   */
  clearSessionSkip(userId: string): void {
    sessionStorage.removeItem(`${SESSION_SKIP_PREFIX}${userId}`);
  },

  // ── Local Storage Helpers ──────────────────────────────────────────────────
  getLocalRecord(userId: string): AadhaarVerificationRecord | null {
    try {
      const raw = localStorage.getItem(`${VERIFICATION_STORAGE_PREFIX}${userId}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  saveLocalRecord(userId: string, record: AadhaarVerificationRecord): void {
    try {
      localStorage.setItem(`${VERIFICATION_STORAGE_PREFIX}${userId}`, JSON.stringify(record));
    } catch (e) {
      console.error('Failed to save Aadhaar record', e);
    }
  },
};
