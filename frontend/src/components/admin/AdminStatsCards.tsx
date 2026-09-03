import React from 'react';
import { Users, Activity, FileText, CreditCard, AlertCircle } from 'lucide-react';
import { AdminStats } from '../../services/adminAnalyticsService';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface AdminStatsCardsProps {
  stats: AdminStats | null;
  isLoading?: boolean;
}

const StatCard: React.FC<{ title: string; value: string | number; subtitle: string; icon: React.ElementType; color: string }> = ({
  title, value, subtitle, icon: Icon, color,
}) => (
  <Card variant="default" className="p-5 rounded-3xl border-slate-200/80 dark:border-slate-800 flex items-start gap-4">
    <div className={`p-3 rounded-2xl ${color} flex-shrink-0`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">{title}</p>
      <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{value}</p>
      <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
    </div>
  </Card>
);

export const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({ stats, isLoading }) => {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-3xl bg-slate-100 dark:bg-darkBg-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard
        title="Total Users"
        value={stats.users.total.toLocaleString()}
        subtitle={`${stats.users.newThisMonth} new this month`}
        icon={Users}
        color="bg-brand-500/10 text-brand-500"
      />
      <StatCard
        title="AI Analyses"
        value={(stats.analyses.skincare + stats.analyses.disease).toLocaleString()}
        subtitle={`${stats.analyses.skincare} skincare • ${stats.analyses.disease} disease`}
        icon={Activity}
        color="bg-tealBrand-500/10 text-tealBrand-500"
      />
      <StatCard
        title="Reports Generated"
        value={stats.reports.generated.toLocaleString()}
        subtitle={`${stats.reports.shared} shared with consent`}
        icon={FileText}
        color="bg-indigoBrand-500/10 text-indigoBrand-500"
      />
      <StatCard
        title="Premium Members"
        value={stats.membership.premium + stats.membership.professional}
        subtitle={`${stats.membership.free} free plan users`}
        icon={CreditCard}
        color="bg-amber-500/10 text-amber-500"
      />
      <StatCard
        title="Failed Analyses"
        value={stats.analyses.failed}
        subtitle="Requires AI provider review"
        icon={AlertCircle}
        color="bg-rose-500/10 text-rose-500"
      />
    </div>
  );
};
