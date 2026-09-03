export type MembershipPlanId = 'free' | 'premium' | 'professional';
export type BillingCycle = 'monthly' | 'yearly';

export interface MembershipPlanLimits {
  analysesPerMonth: number | 'unlimited';
  reportsPerMonth: number | 'unlimited';
  maxProgressPhotos: number | 'unlimited';
}

export interface MembershipPlan {
  id: MembershipPlanId;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  badge?: string;
  features: string[];
  limits: MembershipPlanLimits;
}

export interface UserSubscription {
  userId: string;
  planId: MembershipPlanId;
  billingCycle: BillingCycle;
  status: 'active' | 'cancelled' | 'past_due';
  startDate: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  autoRenew: boolean;
}

export interface BillingRecord {
  id: string;
  userId: string;
  date: string;
  planName: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'refunded';
  invoiceId: string;
  paymentMethod: string;
}

export interface MembershipUsageStats {
  analysesUsed: number;
  analysesLimit: number | 'unlimited';
  reportsUsed: number;
  reportsLimit: number | 'unlimited';
  progressPhotosCount: number;
  progressPhotosLimit: number | 'unlimited';
}
