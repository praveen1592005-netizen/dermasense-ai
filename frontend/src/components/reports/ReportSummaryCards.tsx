import React from 'react';
import { FileText, Sparkles, Activity, TrendingUp } from 'lucide-react';
import { ReportSummaryStats } from '../../types/report';
import { Card } from '../common/Card';

interface ReportSummaryCardsProps {
  stats: ReportSummaryStats;
}

export const ReportSummaryCards: React.FC<ReportSummaryCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Reports',
      count: stats.totalReports,
      icon: FileText,
      color: 'text-brand-500 bg-brand-500/10 border-brand-500/20',
    },
    {
      title: 'Skincare Protocols',
      count: stats.skincareReports,
      icon: Sparkles,
      color: 'text-tealBrand-500 bg-tealBrand-500/10 border-tealBrand-500/20',
    },
    {
      title: 'Disease Intakes',
      count: stats.diseaseReports,
      icon: Activity,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Progress Reviews',
      count: stats.progressReports,
      icon: TrendingUp,
      color: 'text-indigoBrand-500 bg-indigoBrand-500/10 border-indigoBrand-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <Card
            key={i}
            variant="glass"
            className="p-4 rounded-2xl border-slate-200/80 dark:border-slate-800 flex items-center gap-3 shadow-xs"
          >
            <div className={`p-2.5 rounded-xl border flex-shrink-0 ${c.color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-slate-400 font-medium block truncate">
                {c.title}
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {c.count}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
