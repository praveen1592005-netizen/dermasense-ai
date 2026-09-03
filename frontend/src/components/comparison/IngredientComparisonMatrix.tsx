import React from 'react';
import { Sparkles, CheckCircle2, Shield, Info } from 'lucide-react';
import { Product } from '../../types/product';
import { productComparisonService } from '../../services/productComparisonService';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface IngredientComparisonMatrixProps {
  products: Product[];
}

export const IngredientComparisonMatrix: React.FC<IngredientComparisonMatrixProps> = ({
  products,
}) => {
  if (products.length < 2) return null;

  const comparison = productComparisonService.compareProducts(products);
  const { sharedIngredients, uniqueIngredients } = comparison.ingredientComparison;

  return (
    <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-tealBrand-500" />
          Active Ingredient Overlap & Formulation Analysis
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Evaluating shared cosmetic actives and unique functional ingredients between the selected products.
        </p>
      </div>

      {/* Shared Actives Section */}
      <div className="p-4 sm:p-5 rounded-2xl bg-tealBrand-50/60 dark:bg-tealBrand-950/30 border border-tealBrand-200/60 dark:border-tealBrand-900/40 space-y-3">
        <h4 className="text-xs sm:text-sm font-bold text-tealBrand-900 dark:text-tealBrand-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-tealBrand-500" />
          Shared Active & Base Ingredients ({sharedIngredients.length})
        </h4>

        {sharedIngredients.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {sharedIngredients.map((ing, i) => (
              <Badge key={i} variant="teal" size="sm">
                {ing}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-tealBrand-800 dark:text-tealBrand-300 italic">
            These products use distinct formulation bases with minimal exact ingredient overlap.
          </p>
        )}
      </div>

      {/* Unique Ingredients per Product */}
      <div className="space-y-4">
        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
          Unique Ingredients by Formulation
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((p) => {
            const uniqueList = uniqueIngredients[p.id] || [];

            return (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-slate-50/70 dark:bg-darkBg-900/60 border border-slate-200/60 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {p.name}
                  </h5>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {uniqueList.length} unique
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {uniqueList.slice(0, 6).map((ing, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-darkBg-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px]"
                    >
                      {ing}
                    </span>
                  ))}
                  {uniqueList.length > 6 && (
                    <span className="text-[10px] text-slate-400 self-center">
                      +{uniqueList.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Neutral Scientific Note (Section 15) */}
      <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-darkBg-900 text-xs text-slate-600 dark:text-slate-400 leading-relaxed flex items-start gap-2">
        <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <span>
          Ingredient information is based on manufacturer labeling. Ingredient efficacy varies with concentration, formulation pH, and individual skin barrier sensitivity.
        </span>
      </div>
    </Card>
  );
};
