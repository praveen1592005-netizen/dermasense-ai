import React from 'react';
import { Sparkles, CheckCircle2, ShieldAlert, ArrowRight, AlertTriangle } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export const ProgressSummaryCard: React.FC = () => {
  return (
    <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-500" />
            Skin Progress Evaluation & Routine Next Steps
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Holistic assessment based on your active routine consistency and progress check-ins.
          </p>
        </div>

        <Badge variant="teal" size="sm">
          Protocol Stable
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Observations */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-darkBg-900/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
          <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Observed Progress Summary
          </h4>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Observations indicate positive skin barrier equilibrium, improved surface hydration, and stable oiliness management over the last 4-week check-in window.
          </p>
        </div>

        {/* Actionable Next Steps */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-darkBg-900/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
          <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-500" />
            Recommended Protocol Adjustment
          </h4>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong>Continue current routine:</strong> Your core cleanser, moisturizer, and daily SPF 50 are functioning effectively. Maintain consistent daily application.
          </p>
        </div>
      </div>

      {/* Mandatory Non-Causal Safety Notice (Section 27) */}
      <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 leading-relaxed space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
          <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>Scientific & Clinical Integrity Notice</span>
        </div>
        <p className="pl-5 text-[11px] text-amber-800/90 dark:text-amber-200/90">
          Changes observed during the tracking period reflect overall skin appearance. Multiple factors (diet, hydration, climate, stress, sleep) influence skin health; observations cannot definitively prove that any single commercial product produced the outcome. If irritation, rash, or suspicious lesions appear, please consult a dermatologist.
        </p>
      </div>
    </Card>
  );
};
