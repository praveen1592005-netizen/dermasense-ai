import React from 'react';
import { CheckCircle2, Circle, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { ProfileCompletionReport } from '../../services/profileService';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

interface ProfileCompletionProps {
  report: ProfileCompletionReport;
  onEditClick?: () => void;
}

export const ProfileCompletion: React.FC<ProfileCompletionProps> = ({
  report,
  onEditClick,
}) => {
  const { percentage, completedFieldsCount, totalFieldsCount, missingFields } = report;

  const getBarColor = (pct: number) => {
    if (pct < 40) return 'bg-rose-500';
    if (pct < 75) return 'bg-amber-500';
    return 'bg-gradient-to-r from-tealBrand-500 to-emerald-500';
  };

  return (
    <Card
      variant="glass"
      className="p-5 sm:p-6 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Profile Strength
          </span>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Profile Completion – {percentage}%</span>
            {percentage === 100 && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Complete
              </span>
            )}
          </h3>
        </div>

        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {completedFieldsCount} of {totalFieldsCount} steps
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-darkBg-900 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBarColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Missing Fields Checklist */}
      {missingFields.length > 0 ? (
        <div className="pt-2">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Recommended to unlock full personalized recommendations:
          </p>
          <div className="space-y-1.5">
            {missingFields.map((field) => (
              <div
                key={field.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-darkBg-900/60 border border-slate-200/60 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Circle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span>{field.action}</span>
                </div>
                {onEditClick && (
                  <button
                    type="button"
                    onClick={onEditClick}
                    className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>Add</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>Your baseline profile is complete! Future AI recommendations will be tailored to these preferences.</span>
        </div>
      )}
    </Card>
  );
};
