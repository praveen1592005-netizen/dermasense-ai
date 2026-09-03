import React from 'react';
import { Sparkles, Shield, HeartPulse, Edit2, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface SkinProfileCardProps {
  user: any;
  onEditClick: () => void;
}

export const SkinProfileCard: React.FC<SkinProfileCardProps> = ({ user, onEditClick }) => {
  const profile = user?.profile || {};
  const skin = profile.skinProfile || {};

  const skinType = skin.skinType || profile.skinType || 'Not provided';
  const primaryConcerns = skin.primaryConcerns || profile.skinConcerns || [];
  const secondaryConcerns = skin.secondaryConcerns || [];
  const sensitivity = skin.sensitivity || 'Not provided';
  const routine = skin.currentRoutine || 'Not provided';

  return (
    <Card variant="glass" className="p-6 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-500" />
          Skin Profile & Clinical Baseline
        </h3>
        <button
          type="button"
          onClick={onEditClick}
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
        >
          <Edit2 className="w-3 h-3" />
          <span>Edit</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Skin Type */}
        <div className="p-3 rounded-2xl bg-slate-50/60 dark:bg-darkBg-900/50 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
            Skin Type
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white capitalize">
            {skinType}
          </span>
        </div>

        {/* Skin Sensitivity */}
        <div className="p-3 rounded-2xl bg-slate-50/60 dark:bg-darkBg-900/50 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
            Skin Sensitivity
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white capitalize">
            {sensitivity}
          </span>
        </div>
      </div>

      {/* Primary Skin Concerns */}
      <div className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-darkBg-900/50 border border-slate-200/60 dark:border-slate-800">
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
          Primary Skin Concerns
        </span>
        {primaryConcerns.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {primaryConcerns.map((c: string, idx: number) => (
              <Badge key={idx} variant="brand" size="sm">
                {c}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">Not provided</p>
        )}
      </div>

      {/* Secondary Skin Concerns */}
      <div className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-darkBg-900/50 border border-slate-200/60 dark:border-slate-800">
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
          Secondary Skin Concerns
        </span>
        {secondaryConcerns.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {secondaryConcerns.map((c: string, idx: number) => (
              <Badge key={idx} variant="teal" size="sm">
                {c}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">Not provided</p>
        )}
      </div>

      {/* Current Routine */}
      <div className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-darkBg-900/50 border border-slate-200/60 dark:border-slate-800">
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
          Current Skincare Routine
        </span>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {routine}
        </p>
      </div>
    </Card>
  );
};
