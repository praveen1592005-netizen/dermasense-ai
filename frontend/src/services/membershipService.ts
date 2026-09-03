import { MembershipPlan, UserSubscription, MembershipPlanId } from '../types/membership';
import { apiClient } from './apiClient';

export const membershipService = {
  async getPlans(): Promise<MembershipPlan[]> {
    try {
      const response = await apiClient.get('/memberships');
      if (response.success && response.plans && response.plans.length > 0) {
        return response.plans;
      }
      return [];
    } catch (e) {
      console.error('Failed to fetch membership plans', e);
      return [];
    }
  },

  async getPlanById(id: MembershipPlanId): Promise<MembershipPlan | null> {
    const plans = await this.getPlans();
    return plans.find((p) => p.id === id) || null;
  },

  async getUserSubscription(userId: string = 'usr_guest'): Promise<UserSubscription> {
    try {
      const response = await apiClient.get(`/memberships/subscription/${userId}`);
      if (response.success && response.subscription) {
        return response.subscription as UserSubscription;
      }
    } catch (e) {
      console.error("Failed to fetch subscription, falling back", e);
    }
    // Return a default free tier if not found/implemented to prevent UI crash
    return {
      userId,
      planId: 'free',
      billingCycle: 'monthly',
      status: 'active',
      startDate: new Date().toISOString(),
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      cancelAtPeriodEnd: false,
      autoRenew: true
    } as UserSubscription;
  },

  async updateSubscription(
    userId: string,
    planId: MembershipPlanId,
    billingCycle: 'monthly' | 'yearly' = 'monthly'
  ): Promise<UserSubscription> {
    try {
      const response = await apiClient.post(`/memberships/subscription/${userId}`, { planId, billingCycle });
      if (response.success && response.subscription) {
        return response.subscription as UserSubscription;
      }
      throw new Error(response.message || 'Failed to update subscription on backend');
    } catch (e: any) {
      throw new Error(e.message || 'Error communicating with backend');
    }
  },

  async cancelSubscription(userId: string): Promise<UserSubscription> {
    try {
      const response = await apiClient.delete(`/memberships/subscription/${userId}`);
      if (response.success && response.subscription) {
        return response.subscription as UserSubscription;
      }
      throw new Error(response.message || 'Failed to cancel subscription on backend');
    } catch (e: any) {
      throw new Error(e.message || 'Error communicating with backend');
    }
  },
};
