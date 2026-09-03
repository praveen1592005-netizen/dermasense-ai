import React from 'react';
import { Activity, CheckCircle2, TrendingUp, ShieldCheck, Info } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export const SkinObservationTrendCard: React.FC = () => {
  const indicators = [
    {
      parameter: 'Moisture Barrier Index',
      baseline: 'Surface Dehydration',
      current: 'Enhanced Hydration',
      status: 'improved',
      notes: 'Preserved by daily ceramide & gentle wash application.',
    },
    {
      parameter: 'T-Zone Sebum Balance',
      baseline: 'Excess Afternoon Shine',
      current: 'Balanced Sebum',
      status: 'improved',
      notes: 'Supported by lightweight gel moisturizer & niacinamide.',
    },
    {
      parameter: 'Cheek Sensitivity & Redness',
      baseline: 'Prone to Reactivity',
      current: 'Calmer Appearance',
      status: 'improved',
      notes: 'Benefiting from fragrance-free barrier protocol.',
    },
    {
      parameter: 'Photoprotection Defense',
      baseline: 'Intermittent SPF',
      current: 'Daily SPF 50 Applied',
      status: 'optimal',
      notes: 'Consistent broad-spectrum defense maintained.',
    },
  ];

  return (
    <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-5">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-brand-500" />
          Skin Parameter Observation Trends
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Qualitative comparative assessment between baseline intake and current routine check-in.
        </p>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-darkBg-850/60 overflow-hidden">
        {indicators.map((ind, idx) => (
          <div
            key={idx}
            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">
                {ind.parameter}
              </span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">{ind.notes}</p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 line-through block">
                  {ind.baseline}
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                  {ind.current}
                </span>
              </div>
              <Badge variant="success" size="sm">
                Observed
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-darkBg-900 text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex items-start gap-2">
        <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <span>
          Observation trends reflect reported cosmetic indicators. They do not constitute numerical medical measurements.
        </span>
      </div>
    </Card>
  );
};
