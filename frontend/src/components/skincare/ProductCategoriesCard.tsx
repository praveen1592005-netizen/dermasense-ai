import React from 'react';
import { ShoppingBag, Check, X, Info } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ProductCategoryGuidance } from '../../types/analysis';

interface ProductCategoriesCardProps {
  categories?: ProductCategoryGuidance[];
}

export const ProductCategoriesCard: React.FC<ProductCategoriesCardProps> = ({
  categories = [],
}) => {
  return (
    <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigoBrand-500" />
            Recommended Product Ingredient Profiles
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Key ingredient considerations when selecting commercial formulations.
          </p>
        </div>

        <Badge variant="neutral" size="sm">
          Future Marketplace Integration
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-slate-50/70 dark:bg-darkBg-900/60 border border-slate-200/60 dark:border-slate-800 space-y-3 flex flex-col justify-between"
          >
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {cat.category}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                {cat.purpose}
              </p>
            </div>

            <div className="space-y-2 text-[11px] pt-2 border-t border-slate-200/60 dark:border-slate-800">
              <div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1">
                  <Check className="w-3 h-3" /> Beneficial Actives:
                </span>
                <div className="flex flex-wrap gap-1">
                  {cat.suitableIngredients.map((ing, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 mb-1">
                  <X className="w-3 h-3" /> Use Caution With:
                </span>
                <div className="flex flex-wrap gap-1">
                  {cat.ingredientsToAvoid.map((ing, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3.5 rounded-2xl bg-indigoBrand-50/50 dark:bg-indigoBrand-950/30 border border-indigoBrand-200/60 dark:border-indigoBrand-900/40 text-xs text-indigoBrand-900 dark:text-indigoBrand-200 leading-relaxed flex items-center gap-2">
        <Info className="w-4 h-4 text-indigoBrand-500 flex-shrink-0" />
        <span>
          Personalized product recommendations and direct dermatology brand integration will be available in a future phase.
        </span>
      </div>
    </Card>
  );
};
