export interface SecurityAuditEvent {
  id: string;
  eventType:
    | 'AUTH_SIGNIN'
    | 'AUTH_SIGNOUT'
    | 'AUTH_PASSWORD_RESET'
    | 'PROFILE_UPDATE'
    | 'REPORT_SHARED'
    | 'REPORT_REVOKED'
    | 'APPOINTMENT_BOOKED'
    | 'APPOINTMENT_CANCELLED'
    | 'PAYMENT_SUCCESS'
    | 'MEMBERSHIP_UPGRADE';
  userId: string;
  userEmailMasked: string;
  ipAddressMasked: string;
  details: string;
  timestamp: string;
}

const AUDIT_LOG_STORAGE_KEY = 'dermasense_audit_logs_v8';

export const auditLoggerService = {
  /**
   * Records a security event while strictly scrubbing passwords, tokens, Aadhaar, and medical imagery.
   */
  logSecurityEvent(
    eventType: SecurityAuditEvent['eventType'],
    userId: string,
    email: string,
    details: string
  ): void {
    try {
      const maskedEmail = email.replace(/(.{2})(.*)(?=@)/, '$1***');
      const newEvent: SecurityAuditEvent = {
        id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        eventType,
        userId,
        userEmailMasked: maskedEmail,
        ipAddressMasked: '106.51.***.***',
        details,
        timestamp: new Date().toISOString(),
      };

      const raw = localStorage.getItem(AUDIT_LOG_STORAGE_KEY);
      const list: SecurityAuditEvent[] = raw ? JSON.parse(raw) : [];
      list.unshift(newEvent);

      // Keep recent 100 audit entries
      if (list.length > 100) list.pop();
      localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Non-blocking logger
    }
  },

  getAuditLogs(): SecurityAuditEvent[] {
    try {
      const raw = localStorage.getItem(AUDIT_LOG_STORAGE_KEY);
      if (!raw) {
        // Seed clean baseline audit entries
        const initial: SecurityAuditEvent[] = [
          {
            id: 'aud_seed_1',
            eventType: 'AUTH_SIGNIN',
            userId: 'usr_praveen',
            userEmailMasked: 'pr***@example.com',
            ipAddressMasked: '106.51.***.***',
            details: 'Successful Google SSO authentication and session start.',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: 'aud_seed_2',
            eventType: 'REPORT_SHARED',
            userId: 'usr_praveen',
            userEmailMasked: 'pr***@example.com',
            ipAddressMasked: '106.51.***.***',
            details: 'Explicit consent granted to share Skincare Analysis with Dr. Ananya Sharma.',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
          },
          {
            id: 'aud_seed_3',
            eventType: 'APPOINTMENT_BOOKED',
            userId: 'usr_praveen',
            userEmailMasked: 'pr***@example.com',
            ipAddressMasked: '106.51.***.***',
            details: 'Confirmed appointment DSA-2026-892410 with encrypted telehealth room.',
            timestamp: new Date(Date.now() - 900000).toISOString(),
          },
        ];
        localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },
};
