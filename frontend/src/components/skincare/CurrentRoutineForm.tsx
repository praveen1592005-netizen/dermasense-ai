import React from 'react';
import { Sparkles, Sun, Droplets, Shield, Plus, Check } from 'lucide-react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { CurrentRoutineData, StructuredRoutineProduct } from '../../types/analysis';

interface CurrentRoutineFormProps {
  routine: CurrentRoutineData;
  onChange: (updated: CurrentRoutineData) => void;
}

export const CurrentRoutineForm: React.FC<CurrentRoutineFormProps> = ({
  routine,
  onChange,
}) => {
  const handleToggleNoRoutine = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hasNoRoutine = e.target.checked;
    onChange({
      ...routine,
      hasNoRoutine,
    });
  };

  const updateProduct = (
    field: 'cleanser' | 'moisturizer' | 'sunscreen' | 'serum',
    updates: Partial<StructuredRoutineProduct>
  ) => {
    onChange({
      ...routine,
      [field]: {
        ...routine[field],
        ...updates,
      },
    });
  };

  const frequencyOptions = [
    { value: 'Daily', label: 'Daily (Every morning or evening)' },
    { value: 'Twice Daily', label: 'Twice Daily (AM & PM)' },
    { value: 'Few times a week', label: '2–3 times a week' },
    { value: 'Rarely', label: 'Occasionally / Rarely' },
    { value: 'Not used', label: 'Do not use this product' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Current Skincare Routine Products
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tell us which products you currently apply so we can optimize your regimen.
          </p>
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 cursor-pointer select-none bg-brand-500/10 px-3 py-1.5 rounded-xl border border-brand-500/20">
          <input
            type="checkbox"
            checked={routine.hasNoRoutine}
            onChange={handleToggleNoRoutine}
            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
          />
          <span>I don't currently use a skincare routine</span>
        </label>
      </div>

      {!routine.hasNoRoutine && (
        <div className="space-y-4 animate-fadeIn">
          {/* Cleanser */}
          <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-darkBg-900/50 border border-slate-200/60 dark:border-slate-800 space-y-3">
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-tealBrand-500" />
              1. Cleanser
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                placeholder="Product name (e.g. CeraVe Hydrating Cleanser)"
                value={routine.cleanser.productName}
                onChange={(e) => updateProduct('cleanser', { productName: e.target.value })}
              />
              <Select
                value={routine.cleanser.frequency}
                onChange={(e) => updateProduct('cleanser', { frequency: e.target.value as any })}
                options={frequencyOptions}
              />
            </div>
          </div>

          {/* Moisturizer */}
          <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-darkBg-900/50 border border-slate-200/60 dark:border-slate-800 space-y-3">
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              2. Moisturizer
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                placeholder="Product name (e.g. Cetaphil Moisturizing Cream)"
                value={routine.moisturizer.productName}
                onChange={(e) => updateProduct('moisturizer', { productName: e.target.value })}
              />
              <Select
                value={routine.moisturizer.frequency}
                onChange={(e) => updateProduct('moisturizer', { frequency: e.target.value as any })}
                options={frequencyOptions}
              />
            </div>
          </div>

          {/* Sunscreen */}
          <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-darkBg-900/50 border border-slate-200/60 dark:border-slate-800 space-y-3">
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              3. Sunscreen
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Input
                  placeholder="Product name (e.g. La Roche-Posay Anthelios SPF 50)"
                  value={routine.sunscreen.productName}
                  onChange={(e) => updateProduct('sunscreen', { productName: e.target.value })}
                />
              </div>
              <Select
                value={routine.sunscreen.frequency}
                onChange={(e) => updateProduct('sunscreen', { frequency: e.target.value as any })}
                options={frequencyOptions}
              />
            </div>
          </div>

          {/* Serum / Treatment */}
          <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-darkBg-900/50 border border-slate-200/60 dark:border-slate-800 space-y-3">
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigoBrand-500" />
              4. Active Serum / Treatment (Optional)
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                placeholder="Product name (e.g. Niacinamide 10% or Vitamin C)"
                value={routine.serum.productName}
                onChange={(e) => updateProduct('serum', { productName: e.target.value })}
              />
              <Select
                value={routine.serum.frequency}
                onChange={(e) => updateProduct('serum', { frequency: e.target.value as any })}
                options={frequencyOptions}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
