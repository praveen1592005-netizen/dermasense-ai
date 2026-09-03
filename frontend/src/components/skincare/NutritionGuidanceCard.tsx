import React from 'react';
import { Utensils, Apple, Salad, Fish, Info } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { NutritionGuidanceItem } from '../../types/analysis';

interface NutritionGuidanceCardProps {
  items?: NutritionGuidanceItem[];
}

export const NutritionGuidanceCard: React.FC<NutritionGuidanceCardProps> = ({ items = [] }) => {
  return (
    <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-5">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Utensils className="w-5 h-5 text-amber-500" />
          Skin Nutrition & Dietary Baseline
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Nutrient-dense whole food recommendations that support collagen synthesis and epidermal hydration.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-slate-50/70 dark:bg-darkBg-900/60 border border-slate-200/60 dark:border-slate-800 space-y-2"
          >
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {item.category}
            </h4>

            <div className="flex flex-wrap gap-1.5">
              {item.foods.map((food, i) => (
                <Badge key={i} variant="brand" size="sm">
                  {food}
                </Badge>
              ))}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
              {item.benefit}
            </p>
          </div>
        ))}
      </div>

      {/* Nutrition Disclaimer (Section 28) */}
      <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <span>
          Nutrition guidance is general information and is not a substitute for advice from a qualified healthcare professional or registered dietitian.
        </span>
      </div>
    </Card>
  );
};
