import React from 'react';
import { Sparkles, Check, Info } from 'lucide-react';
import { SkinConcern } from '../../types/analysis';

interface SkinConcernSelectorProps {
  selectedConcerns: string[];
  onChange: (concerns: string[]) => void;
}

export const ALL_SKINCARE_CONCERNS: SkinConcern[] = [
  'Acne & Breakouts',
  'Dryness & Flaking',
  'Oiliness & Shine',
  'Redness & Irritation',
  'Hyperpigmentation & Dark Spots',
  'Uneven Texture',
  'Large-looking Pores',
  'Dullness',
  'Skin Sensitivity',
  'Fine Lines & Wrinkles',
  'Dark Circles',
  'Other',
];

export const SkinConcernSelector: React.FC<SkinConcernSelectorProps> = ({
  selectedConcerns,
  onChange,
}) => {
  const toggleConcern = (concern: string) => {
    if (selectedConcerns.includes(concern)) {
      onChange(selectedConcerns.filter((c) => c !== concern));
    } else {
      onChange([...selectedConcerns, concern]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
          Select Your Primary Skin Concerns
        </label>
        <span className="text-[11px] text-slate-400">Select all that apply</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
        {ALL_SKINCARE_CONCERNS.map((c) => {
          const isSelected = selectedConcerns.includes(c);
          return (
            <button
              key={c}
              type="button"
              onClick={() => toggleConcern(c)}
              className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all flex items-center justify-between gap-2 ${
                isSelected
                  ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                  : 'bg-white dark:bg-darkBg-850 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:border-brand-400'
              }`}
            >
              <span className="truncate">{c}</span>
              {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-400 dark:text-slate-500 italic pt-1">
        Note: Selected concerns represent cosmetic wellness goals and do not constitute confirmed medical diagnoses.
      </p>
    </div>
  );
};
