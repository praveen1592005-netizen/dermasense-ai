import React from 'react';
import { Sparkles, HeartPulse, Activity, Calendar, ArrowRight } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface ProfileHealthSnapshotProps {
  user: any;
  onStartAnalysis: (type: 'skincare' | 'disease') => void;
}

export const ProfileHealthSnapshot: React.FC<ProfileHealthSnapshotProps> = ({
  user,
  onStartAnalysis,
}) => {
  const profile = user?.profile || {};
  const skin = profile.skinProfile || {};

  const skinType = skin.skinType || profile.skinType || 'Not provided';
  const primaryConcern = (skin.primaryConcerns && skin.primaryConcerns[0]) || (profile.skinConcerns && profile.skinConcerns[0]) || 'Not provided';

  return (
    <Card variant="glass" className="p-6 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-rose-500" />
          Skin Health Snapshot
        </h3>
        <Badge variant="brand" size="sm">
          Overview
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-2xl bg-slate-50/60 dark:bg-darkBg-900/50 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
            Skin Type
          </span>
          <span className="text-xs font-bold text-slate-900 dark:text-white capitalize truncate block">
            {skinType}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50/60 dark:bg-darkBg-900/50 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
            Top Concern
          </span>
          <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
            {primaryConcern}
          </span>
        </div>
      </div>

      {/* Latest Analysis Status (Section 21/23) */}
      <div className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-darkBg-900/50 border border-slate-200/60 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Latest Skincare Analysis:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">No analysis available yet</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Latest Disease Intake:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">No analysis available yet</span>
        </div>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={() => onStartAnalysis('skincare')}
          className="flex-1 py-2 px-3 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Skincare Analysis</span>
        </button>

        <button
          type="button"
          onClick={() => onStartAnalysis('disease')}
          className="flex-1 py-2 px-3 rounded-xl bg-tealBrand-500/10 hover:bg-tealBrand-500/20 text-tealBrand-600 dark:text-tealBrand-400 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Disease Intake</span>
        </button>
      </div>
    </Card>
  );
};
