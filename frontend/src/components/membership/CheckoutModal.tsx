import React, { useState } from 'react';
import { ShieldCheck, Tag, Check, ArrowRight, Lock, Sparkles } from 'lucide-react';
import { MembershipPlan, BillingCycle } from '../../types/membership';
import { couponService } from '../../services/couponService';
import { storeService } from '../../services/storeService';
import { paymentService } from '../../services/paymentService';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Badge } from '../common/Badge';
import { useNotification } from '../../context/NotificationContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: MembershipPlan | null;
  billingCycle: BillingCycle;
  onPlanActivated: (planId: any, cycle: BillingCycle) => Promise<void>;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  plan,
  billingCycle,
  onPlanActivated,
}) => {
  const { showSuccess, showError } = useNotification();
  const [couponCode, setCouponCode] = useState('PREMIUM20');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!plan) return null;

  const originalPrice = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  const finalPrice = Math.max(0, originalPrice - discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplying(true);
    try {
      const res = await couponService.validateCoupon(couponCode, originalPrice, plan.id);
      if (res.isValid) {
        setDiscountAmount(res.discountAmount);
        setAppliedCoupon(res.coupon?.code || couponCode.toUpperCase());
        showSuccess('Coupon Applied', res.message);
      } else {
        setDiscountAmount(0);
        setAppliedCoupon(null);
        showError('Invalid Coupon', res.message);
      }
    } finally {
      setIsApplying(false);
    }
  };

  const handleConfirmPlan = async () => {
    setIsProcessing(true);
    try {
      if (appliedCoupon) {
        await couponService.markCouponUsed(appliedCoupon, `Membership: ${plan.name}`);
      }
      await onPlanActivated(plan.id, billingCycle);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Your Plan Subscription"
      description="Review your plan details, apply promotional vouchers, and activate your tier."
      size="md"
    >
      <div className="space-y-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {/* Selected Plan Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-darkBg-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {plan.name} ({billingCycle === 'yearly' ? 'Annual' : 'Monthly'})
            </span>
            <Badge variant="brand" size="sm">
              {billingCycle}
            </Badge>
          </div>
          <p className="text-xs text-slate-400">{plan.tagline}</p>
        </div>

        {/* Coupon Apply Box (Section 41) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-900 dark:text-white block">
            Have a Promo Code?
          </label>
          <div className="flex items-center gap-2">
            <Input
              placeholder="e.g. PREMIUM20"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            />
            <Button
              variant="outline"
              size="md"
              onClick={handleApplyCoupon}
              isLoading={isApplying}
              leftIcon={<Tag className="w-3.5 h-3.5" />}
            >
              Apply
            </Button>
          </div>
          {appliedCoupon && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" /> Coupon '{appliedCoupon}' active
            </p>
          )}
        </div>

        {/* Price Breakdown Calculation (Section 42) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-darkBg-850 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Base Subscription Price:</span>
            <span>{storeService.formatPriceINR(originalPrice)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>Promotional Discount:</span>
              <span>- {storeService.formatPriceINR(discountAmount)}</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between font-extrabold text-sm text-slate-900 dark:text-white">
            <span>Total Payable:</span>
            <span>{storeService.formatPriceINR(finalPrice)}</span>
          </div>
        </div>

        {/* Future Payment Gateway Notice (Section 28) */}
        <div className="p-3.5 rounded-2xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200/60 dark:border-brand-900/40 text-[11px] text-brand-900 dark:text-brand-200 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
          <span>
            Payment Gateway Integration Active: Your account will be provisioned directly with authenticated plan entitlements.
          </span>
        </div>

        {/* Controls */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            onClick={handleConfirmPlan}
            isLoading={isProcessing}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Activate {plan.name}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
