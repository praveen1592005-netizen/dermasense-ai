import React, { useState } from 'react';
import { Sun, Moon, Sparkles, CheckCircle2, ChevronRight, Droplets } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { RoutineStep } from '../../types/analysis';

interface RoutineScheduleCardProps {
  morningRoutine?: RoutineStep[];
  eveningRoutine?: RoutineStep[];
}

export const RoutineScheduleCard: React.FC<RoutineScheduleCardProps> = ({
  morningRoutine = [],
  eveningRoutine = [],
}) => {
  const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning');

  const steps = activeTab === 'morning' ? morningRoutine : eveningRoutine;

  return (
    <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-500" />
            Structured Skincare Routine Protocol
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Step-by-step product layering tailored to protect and nourish your skin barrier.
          </p>
        </div>

        {/* Morning vs Evening Tab Switcher */}
        <div className="p-1 rounded-2xl bg-slate-100 dark:bg-darkBg-900 flex items-center gap-1 self-start sm:self-center border border-slate-200/60 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('morning')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'morning'
                ? 'bg-white dark:bg-darkBg-800 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Morning (AM)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('evening')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'evening'
                ? 'bg-white dark:bg-darkBg-800 text-indigoBrand-600 dark:text-indigoBrand-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Evening (PM)</span>
          </button>
        </div>
      </div>

      {/* Routine Steps List */}
      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.stepNumber}
            className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-darkBg-900/60 border border-slate-200/60 dark:border-slate-800 space-y-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-brand-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {step.stepNumber}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {step.stepName}
                </h4>
                <Badge variant="brand" size="sm">
                  {step.category}
                </Badge>
              </div>

              <span className="text-[11px] text-slate-400 font-medium">
                {step.recommendedFrequency}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-8">
              {step.description}
            </p>

            {step.keyIngredients && step.keyIngredients.length > 0 && (
              <div className="pl-8 pt-1 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">
                  Key Actives:
                </span>
                {step.keyIngredients.map((ing, i) => (
                  <Badge key={i} variant="neutral" size="sm">
                    {ing}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
