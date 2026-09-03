export type UserRole = 'USER' | 'DOCTOR' | 'ADMIN';

export interface SecurityPolicy {
  rateLimits: {
    loginAttemptsPerMin: number;
    analysisUploadsPerHour: number;
    doctorSearchPerMin: number;
    couponChecksPerMin: number;
  };
  allowedImageMimeTypes: string[];
  maxImageDimensionPx: number;
}

export const SECURITY_POLICY: SecurityPolicy = {
  rateLimits: {
    loginAttemptsPerMin: 5,
    analysisUploadsPerHour: 20,
    doctorSearchPerMin: 30,
    couponChecksPerMin: 15,
  },
  allowedImageMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxImageDimensionPx: 4096,
};

/**
 * Basic string sanitizer preventing XSS injection in user notes or reviews.
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
};
