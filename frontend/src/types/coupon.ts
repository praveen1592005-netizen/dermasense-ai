import { MembershipPlanId } from './membership';

export type CouponType = 'percentage' | 'fixed';
export type CouponApplicability = 'all' | 'membership' | 'products';
export type CouponStatus = 'available' | 'used' | 'expired' | 'invalid';

export interface Coupon {
  code: string;
  discountType: CouponType;
  discountValue: number; // e.g. 20 for 20%, or 200 for ₹200
  title: string;
  description: string;
  applicability: CouponApplicability;
  minPurchaseAmount?: number;
  applicablePlanId?: MembershipPlanId;
  expiryDate: string;
  status: CouponStatus;
  usedAt?: string;
  appliedTo?: string;
}

export interface CouponValidationResult {
  isValid: boolean;
  discountAmount: number;
  finalPrice: number;
  message: string;
  coupon?: Coupon;
}
