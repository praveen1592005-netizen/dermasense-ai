import React from 'react';
import { Sparkles, FileText, Camera, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { UserSubscription, MembershipUsageStats, MembershipPlan } from '../../types/membership';
import { formatDate } from '../../utils/formatters';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface MembershipUsageCardProps {
  subscription: UserSubscription;
  plan: MembershipPlan;
  usage: MembershipUsageStats;
  onUpgradeClick: () => void;
  onCancelClick?: () => void;
}

export const MembershipUsageCard: React.FC<MembershipUsageCardProps> = ({
  subscription,
  plan,
  usage,
  onUpgradeClick,
  onCancelClick,
}) => {
  const getPercent = (used: number, limit: number | 'unlimited') => {
    if (limit === 'unlimited') return 0;
    return Math.min(100, Math.round((used / limit) * 100));
  };

  return (
    <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-6">
      {/* Plan Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              {plan.name}
            </h3>
            <Badge variant={subscription.status === 'active' ? 'success' : 'warning'} size="sm">
              {subscription.status === 'active' ? 'Active Subscription' : 'Cancelled'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Billing Cycle: <strong className="capitalize">{subscription.billingCycle}</strong> • Next renewal: {formatDate(subscription.currentPeriodEnd)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {plan.id !== 'professional' && (
            <Button
              variant="gradient"
              size="sm"
              onClick={onUpgradeClick}
              rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
            >
              Upgrade Plan
            </Button>
          )}

          {subscription.planId !== 'free' && onCancelClick && (
            <Button variant="secondary" size="sm" onClick={onCancelClick}>
              Manage Plan
            </Button>
          )}
        </div>
      </div>

      {/* Usage Progress Bars (Section 23) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Analyses */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-darkBg-900/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              Skincare Analyses
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {usage.analysesUsed} / {usage.analysesLimit === 'unlimited' ? '∞' : usage.analysesLimit}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-darkBg-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-tealBrand-500 rounded-full transition-all duration-500"
              style={{ width: `${getPercent(usage.analysesUsed, usage.analysesLimit)}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Smart Reports */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-darkBg-900/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-tealBrand-500" />
              Clinical Reports
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {usage.reportsUsed} / {usage.reportsLimit === 'unlimited' ? '∞' : usage.reportsLimit}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-darkBg-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-tealBrand-500 to-indigoBrand-500 rounded-full transition-all duration-500"
              style={{ width: `${getPercent(usage.reportsUsed, usage.reportsLimit)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Progress Photos */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-darkBg-900/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-indigoBrand-500" />
              Progress Check-Ins
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {usage.progressPhotosCount} / {usage.progressPhotosLimit === 'unlimited' ? '∞' : usage.progressPhotosLimit}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-darkBg-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigoBrand-500 to-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${getPercent(usage.progressPhotosCount, usage.progressPhotosLimit)}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
