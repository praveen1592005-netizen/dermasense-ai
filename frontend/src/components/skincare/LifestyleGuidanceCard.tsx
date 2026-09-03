import React from 'react';
import { Droplets, Moon, Heart, Sparkles, Activity } from 'lucide-react';
import { Card } from '../common/Card';
import { LifestyleGuidanceItem } from '../../types/analysis';

interface LifestyleGuidanceCardProps {
  items?: LifestyleGuidanceItem[];
}

export const LifestyleGuidanceCard: React.FC<LifestyleGuidanceCardProps> = ({ items = [] }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Droplets':
        return <Droplets className="w-4 h-4 text-tealBrand-500" />;
      case 'Moon':
        return <Moon className="w-4 h-4 text-indigoBrand-500" />;
      case 'Heart':
        return <Heart className="w-4 h-4 text-rose-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-5">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-tealBrand-500" />
          Lifestyle & Wellness Optimization
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Holistic lifestyle adjustments to enhance cellular recovery and skin barrier resilience.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-slate-50/70 dark:bg-darkBg-900/60 border border-slate-200/60 dark:border-slate-800 space-y-1.5"
          >
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-white dark:bg-darkBg-800 border border-slate-200/60 dark:border-slate-700 shadow-xs">
                {getIcon(item.icon)}
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {item.title}
              </h4>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-1">
              {item.recommendation}
            </p>

            <p className="text-[11px] text-tealBrand-600 dark:text-tealBrand-400 font-semibold pl-1">
              Impact: {item.impact}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};
