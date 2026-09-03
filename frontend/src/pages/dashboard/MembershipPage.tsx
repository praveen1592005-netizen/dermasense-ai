import React, { useState, useEffect } from 'react';
import { CreditCard, Sparkles, Receipt, Layers, Tag, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { membershipService } from '../../services/membershipService';
import { entitlementService } from '../../services/entitlementService';
import { subscriptionService } from '../../services/subscriptionService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  MembershipPlan,
  UserSubscription,
  MembershipUsageStats,
  BillingRecord,
  BillingCycle,
} from '../../types/membership';

// Reusable Components
import { MembershipPlanCards } from '../../components/membership/MembershipPlanCards';
import { MembershipComparisonTable } from '../../components/membership/MembershipComparisonTable';
import { MembershipUsageCard } from '../../components/membership/MembershipUsageCard';
import { CheckoutModal } from '../../components/membership/CheckoutModal';
import { BillingHistoryTable } from '../../components/membership/BillingHistoryTable';
import { CancelMembershipModal } from '../../components/membership/CancelMembershipModal';

export const MembershipPage: React.FC = () => {
  const { user, isAadhaarVerified, triggerAadhaarVerification } = useAuth();
  const { showSuccess, showInfo } = useNotification();

  const userId = user?.id || 'usr_guest';
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [activePlan, setActivePlan] = useState<MembershipPlan | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchPlans = async () => {
      const p = await membershipService.getPlans();
      if (isMounted) setPlans(p);
    };
    fetchPlans();
    return () => { isMounted = false; };
  }, []);

  const [subscription, setSubscription] = useState<UserSubscription>({
    userId,
    planId: 'free',
    billingCycle: 'monthly',
    status: 'active',
    startDate: new Date().toISOString(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancelAtPeriodEnd: false,
    autoRenew: true,
  });

  const [usage, setUsage] = useState<MembershipUsageStats>({
    analysesUsed: 0,
    analysesLimit: 5,
    reportsUsed: 0,
    reportsLimit: 5,
    progressPhotosCount: 0,
    progressPhotosLimit: 5,
  });

  const [billingHistory, setBillingHistory] = useState<BillingRecord[]>([]);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<MembershipPlan | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadMembershipData = async () => {
      setIsLoading(true);
      try {
        const [sub, usageStats, history] = await Promise.all([
          membershipService.getUserSubscription(userId),
          entitlementService.getUsageStats(userId),
          subscriptionService.getBillingHistory(userId),
        ]);
        if (isMounted) {
          setSubscription(sub);
          setUsage(usageStats);
          setBillingHistory(history);
          const currentPlan = await membershipService.getPlanById(sub.planId);
          setActivePlan(currentPlan);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadMembershipData();
    return () => { isMounted = false; };
  }, [userId]);

  const handleSelectPlan = (plan: MembershipPlan) => {
    if (!isAadhaarVerified && plan.id !== 'free') {
      triggerAadhaarVerification('Membership Payment & Upgrade');
      return;
    }
    setSelectedPlanForCheckout(plan);
  };

  const handlePlanActivated = async (planId: any, cycle: BillingCycle) => {
    const updated = await membershipService.updateSubscription(userId, planId, cycle);
    const chosenPlan = await membershipService.getPlanById(planId);
    const price = chosenPlan ? (cycle === 'yearly' ? chosenPlan.yearlyPrice : chosenPlan.monthlyPrice) : 0;
    const name = chosenPlan ? chosenPlan.name : 'Unknown Plan';

    await subscriptionService.recordTransaction({
      userId,
      date: new Date().toISOString(),
      planName: `${name} (${cycle})`,
      amount: price,
      currency: 'INR',
      status: 'paid',
      invoiceId: `INV-${Date.now().toString().slice(-6)}`,
      paymentMethod: 'Verified Payment Gateway',
    });

    const [newUsage, newHistory] = await Promise.all([
      entitlementService.getUsageStats(userId),
      subscriptionService.getBillingHistory(userId),
    ]);

    setSubscription(updated);
    setUsage(newUsage);
    setBillingHistory(newHistory);
    setSelectedPlanForCheckout(null);
    showSuccess('Plan Activated', `Successfully upgraded to ${name}!`);
  };

  const handleConfirmCancel = async () => {
    const updated = await membershipService.cancelSubscription(userId);
    setSubscription(updated);
    showInfo('Subscription Cancelled', 'Auto-renewal disabled. Benefits remain active until period end.');
  };

  // Safely fallback data to prevent React crashes during initial render or API failures
  const fallbackSub = subscription || { userId: user?.id || '', planId: 'free', status: 'active', billingCycle: 'monthly', currentPeriodEnd: new Date().toISOString() } as any;
  const fallbackPlan = activePlan || plans.find(p => p.id === fallbackSub.planId) || { id: 'free', name: 'Free Tier', monthlyPrice: 0, yearlyPrice: 0, features: [], description: '' } as any;
  const fallbackUsage = usage || { analysesUsed: 0, analysesLimit: 5, reportsUsed: 0, reportsLimit: 5, progressPhotosCount: 0, progressPhotosLimit: 5 };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn pb-12">
      <PageHeader
        title="Membership & Subscription Management"
        subtitle="Manage your active entitlements, explore feature upgrades, and review verified billing invoices."
      />

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Active Subscription & Usage Tracking Dashboard */}
          <MembershipUsageCard
            subscription={fallbackSub}
            plan={fallbackPlan}
            usage={fallbackUsage}
            onUpgradeClick={() => {
              const nextPlan = plans.find((p) => p.id === 'premium') || plans[1];
              setSelectedPlanForCheckout(nextPlan);
            }}
            onCancelClick={() => setCancelModalOpen(true)}
          />

          {/* Pricing Plans Section */}
          <div className="space-y-4">
            <div className="text-center max-w-xl mx-auto space-y-1">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Available Membership Tiers
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Select the optimal plan to support your clinical skincare and progress tracking journey.
              </p>
            </div>

            <MembershipPlanCards
              plans={plans}
              currentPlanId={fallbackSub.planId}
              billingCycle={billingCycle}
              onBillingCycleChange={setBillingCycle}
              onSelectPlan={handleSelectPlan}
            />
          </div>

          {/* Detailed Feature Comparison Table */}
          <MembershipComparisonTable />

          {/* Billing History */}
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Billing & Invoices
            </h3>
            <BillingHistoryTable records={billingHistory} />
          </div>
        </>
      )}

      {/* Checkout Modal */}
      {selectedPlanForCheckout && (
        <CheckoutModal
          isOpen={Boolean(selectedPlanForCheckout)}
          onClose={() => setSelectedPlanForCheckout(null)}
          plan={selectedPlanForCheckout}
          billingCycle={billingCycle}
          onPlanActivated={handlePlanActivated}
        />
      )}

      {/* Cancel Membership Modal */}
      <CancelMembershipModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        plan={fallbackPlan}
        subscription={fallbackSub}
        onConfirmCancel={handleConfirmCancel}
      />
    </div>
  );
};
