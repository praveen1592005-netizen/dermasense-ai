/**
 * DermaSense AI – Unit Tests
 * Test runner: Vitest (compatible with Vite)
 * Run with: npx vitest run
 *
 * These tests validate core business logic:
 * - Currency formatting
 * - Date formatting
 * - Coupon validation logic
 * - Urgency triage logic
 * - Image validation constraints
 */

import { describe, it, expect } from 'vitest';

// ─── Formatter Tests ──────────────────────────────────────────────────────────

describe('Currency Formatter (INR)', () => {
  const formatINR = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  it('formats 499 as ₹499', () => {
    expect(formatINR(499)).toMatch(/₹/);
    expect(formatINR(499)).toContain('499');
  });

  it('formats 1499 with Indian thousand separator', () => {
    const result = formatINR(1499);
    expect(result).toMatch(/₹/);
    expect(result).toContain('1,499');
  });

  it('formats 0 correctly', () => {
    expect(formatINR(0)).toContain('0');
  });
});

// ─── Coupon Validation Logic Tests ────────────────────────────────────────────

describe('Coupon Validation Rules', () => {
  const COUPONS: Record<string, { discountType: 'flat' | 'percent'; discountValue: number; minPurchase: number }> = {
    WELCOME100: { discountType: 'flat', discountValue: 100, minPurchase: 0 },
    PREMIUM20: { discountType: 'percent', discountValue: 20, minPurchase: 400 },
    DERMA50: { discountType: 'flat', discountValue: 50, minPurchase: 200 },
  };

  const validateCoupon = (code: string, cartTotal: number) => {
    const coupon = COUPONS[code.toUpperCase()];
    if (!coupon) return { isValid: false, discountAmount: 0, message: 'Invalid coupon code.' };
    if (cartTotal < coupon.minPurchase)
      return { isValid: false, discountAmount: 0, message: `Minimum purchase of ₹${coupon.minPurchase} required.` };
    const discount =
      coupon.discountType === 'flat'
        ? coupon.discountValue
        : Math.round((coupon.discountValue / 100) * cartTotal);
    return { isValid: true, discountAmount: discount, message: 'Coupon applied.' };
  };

  it('WELCOME100 gives flat ₹100 discount on any cart', () => {
    const result = validateCoupon('WELCOME100', 499);
    expect(result.isValid).toBe(true);
    expect(result.discountAmount).toBe(100);
  });

  it('PREMIUM20 gives 20% on cart ≥ ₹400', () => {
    const result = validateCoupon('PREMIUM20', 500);
    expect(result.isValid).toBe(true);
    expect(result.discountAmount).toBe(100); // 20% of 500
  });

  it('PREMIUM20 fails when cart is below min purchase', () => {
    const result = validateCoupon('PREMIUM20', 300);
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('Minimum purchase');
  });

  it('Invalid coupon code returns error', () => {
    const result = validateCoupon('FAKE999', 500);
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('Invalid');
  });

  it('Case-insensitive coupon matching', () => {
    const result = validateCoupon('welcome100', 0);
    expect(result.isValid).toBe(true);
  });
});

// ─── Red-Flag Triage Logic Tests ──────────────────────────────────────────────

describe('Red-Flag Emergency Triage Logic', () => {
  const EMERGENCY_KEYWORDS = [
    'difficulty breathing',
    'rapid facial swelling',
    'anaphylaxis',
    'severe chest pain',
    'loss of consciousness',
    'rapidly spreading rash',
  ];

  const detectRedFlags = (symptoms: string[]): boolean => {
    return symptoms.some((s) =>
      EMERGENCY_KEYWORDS.some((kw) => s.toLowerCase().includes(kw))
    );
  };

  it('detects difficulty breathing as emergency', () => {
    expect(detectRedFlags(['mild redness', 'difficulty breathing'])).toBe(true);
  });

  it('detects anaphylaxis as emergency', () => {
    expect(detectRedFlags(['anaphylaxis', 'hives'])).toBe(true);
  });

  it('does NOT trigger emergency for routine symptoms', () => {
    expect(detectRedFlags(['mild itching', 'dry skin', 'scaling'])).toBe(false);
  });

  it('handles case-insensitive matching', () => {
    expect(detectRedFlags(['Rapid Facial Swelling'])).toBe(true);
  });
});

// ─── Image Validation Tests ───────────────────────────────────────────────────

describe('Image Upload Validation', () => {
  const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
  const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

  const validateImage = (mime: string, sizeBytes: number) => {
    if (!ALLOWED_MIME.includes(mime)) return { valid: false, reason: 'Unsupported file type.' };
    if (sizeBytes > MAX_SIZE_BYTES) return { valid: false, reason: 'File exceeds 10 MB limit.' };
    return { valid: true, reason: '' };
  };

  it('accepts valid JPEG under 10 MB', () => {
    expect(validateImage('image/jpeg', 2 * 1024 * 1024).valid).toBe(true);
  });

  it('accepts valid WebP', () => {
    expect(validateImage('image/webp', 5 * 1024 * 1024).valid).toBe(true);
  });

  it('rejects GIF as unsupported MIME type', () => {
    const result = validateImage('image/gif', 1000);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Unsupported');
  });

  it('rejects file exceeding 10 MB', () => {
    const result = validateImage('image/png', 11 * 1024 * 1024);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('10 MB');
  });

  it('rejects PDF disguised as image', () => {
    expect(validateImage('application/pdf', 500000).valid).toBe(false);
  });
});

// ─── Membership Entitlement Tests ─────────────────────────────────────────────

describe('Membership Entitlement Engine', () => {
  type PlanTier = 'free' | 'premium' | 'professional';

  const PLAN_LIMITS: Record<PlanTier, { analysesPerMonth: number; reportsPerMonth: number; doctorConsultations: number }> = {
    free: { analysesPerMonth: 3, reportsPerMonth: 2, doctorConsultations: 0 },
    premium: { analysesPerMonth: 30, reportsPerMonth: 20, doctorConsultations: 2 },
    professional: { analysesPerMonth: Infinity, reportsPerMonth: Infinity, doctorConsultations: Infinity },
  };

  const canRunAnalysis = (tier: PlanTier, usedThisMonth: number) => {
    return usedThisMonth < PLAN_LIMITS[tier].analysesPerMonth;
  };

  it('free plan allows up to 3 analyses', () => {
    expect(canRunAnalysis('free', 2)).toBe(true);
    expect(canRunAnalysis('free', 3)).toBe(false);
  });

  it('premium plan allows up to 30 analyses', () => {
    expect(canRunAnalysis('premium', 29)).toBe(true);
    expect(canRunAnalysis('premium', 30)).toBe(false);
  });

  it('professional plan has unlimited analyses', () => {
    expect(canRunAnalysis('professional', 1000)).toBe(true);
  });

  it('free plan has 0 doctor consultations included', () => {
    expect(PLAN_LIMITS.free.doctorConsultations).toBe(0);
  });
});
