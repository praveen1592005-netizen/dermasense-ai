import { Coupon, CouponValidationResult } from '../types/coupon';
import { MembershipPlanId } from '../types/membership';
import { apiClient } from './apiClient';

export const couponService = {
  async getCoupons(userId: string = 'usr_guest'): Promise<Coupon[]> {
    // Usually you'd fetch user's available coupons
    try {
      const response = await apiClient.get('/memberships/coupons'); // Requires backend endpoint
      if (response.success && response.coupons) return response.coupons;
      return [];
    } catch {
      return [];
    }
  },

  async validateCoupon(
    code: string,
    amount: number,
    planId?: MembershipPlanId
  ): Promise<CouponValidationResult> {
    try {
      const response = await apiClient.post('/memberships/coupons/validate', { code, amount, planId });
      if (response.success && response.coupon) {
        const coupon = response.coupon as Coupon;
        
        return {
          isValid: true,
          discountAmount: response.discount_amount || 0,
          finalPrice: amount - (response.discount_amount || 0),
          message: `Coupon applied! Saved ₹${response.discount_amount || 0}.`,
          coupon
        };
      }
      return { isValid: false, discountAmount: 0, finalPrice: amount, message: response.message || 'Invalid coupon code.' };
    } catch (e: any) {
      return { isValid: false, discountAmount: 0, finalPrice: amount, message: e.message || 'Error validating coupon.' };
    }
  },

  async markCouponUsed(code: string, appliedTo: string): Promise<void> {
    try {
      await apiClient.post('/memberships/coupons/use', { code, applied_to: appliedTo });
    } catch (e) {
      console.error("Failed to mark coupon as used", e);
    }
  },
};
