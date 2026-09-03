import React from 'react';
import { Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { MembershipPlan, MembershipPlanId, BillingCycle } from '../../types/membership';
import { storeService } from '../../services/storeService';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface MembershipPlanCardsProps {
  plans: MembershipPlan[];
  currentPlanId: MembershipPlanId;
  billingCycle: BillingCycle;
  onBillingCycleChange: (cycle: BillingCycle) => void;
  onSelectPlan: (plan: MembershipPlan) => void;
}

export const MembershipPlanCards: React.FC<MembershipPlanCardsProps> = ({
  plans,
  currentPlanId,
  billingCycle,
  onBillingCycleChange,
  onSelectPlan,
}) => {
  return (
    <div className="space-y-6">
      {/* Billing Cycle Switcher */}
      <div className="flex items-center justify-center">
        <div className="p-1.5 rounded-2xl bg-white dark:bg-darkBg-850 border border-slate-200/80 dark:border-slate-800 flex items-center gap-1 shadow-xs">
          <button
            type="button"
            onClick={() => onBillingCycleChange('monthly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Monthly Billing
          </button>

          <button
            type="button"
            onClick={() => onBillingCycleChange('yearly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              billingCycle === 'yearly'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white animate-pulse">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
          const isPopular = plan.id === 'premium';

          return (
            <Card
              key={plan.id}
              variant={isPopular ? 'glass' : 'default'}
              className={`p-6 sm:p-8 rounded-3xl flex flex-col justify-between relative transition-all duration-200 ${
                isPopular
                  ? 'border-brand-500/60 dark:border-brand-500/40 ring-2 ring-brand-500/20 shadow-xl'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3.5 py-1 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-brand-500 to-tealBrand-500 text-white shadow-md uppercase tracking-wider">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {plan.name}
                    </h3>
                    {isCurrent && (
                      <Badge variant="success" size="sm">
                        Current Plan
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[32px]">
                    {plan.tagline}
                  </p>
                </div>

                {/* Price Display */}
                <div className="pt-2 pb-4 border-y border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                      {price === 0 ? '₹0' : storeService.formatPriceINR(price)}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {price === 0 ? '/ Forever' : billingCycle === 'yearly' ? '/ year' : '/ month'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && price > 0 && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                      Equivalent to ~{storeService.formatPriceINR(Math.round(price / 12))}/mo
                    </p>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-2.5 pt-2 text-xs">
                  <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">
                    What's Included:
                  </span>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="leading-relaxed">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                {isCurrent ? (
                  <Button variant="secondary" size="md" className="w-full" disabled>
                    Active Plan
                  </Button>
                ) : (
                  <Button
                    variant={isPopular ? 'gradient' : 'primary'}
                    size="md"
                    className="w-full"
                    onClick={() => onSelectPlan(plan)}
                  >
                    {price === 0 ? 'Downgrade to Free' : `Upgrade to ${plan.name}`}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
