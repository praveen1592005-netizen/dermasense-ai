import React from 'react';
import { Camera, ListFilter, Eye, Sparkles, CheckCircle2 } from 'lucide-react';

interface AnalysisStepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  maxStepAllowed?: number;
}

export const AnalysisStepper: React.FC<AnalysisStepperProps> = ({
  currentStep,
  onStepClick,
  maxStepAllowed = 5,
}) => {
  const steps = [
    { step: 1, label: 'Skin Image', icon: Camera },
    { step: 2, label: 'Skin Habits', icon: ListFilter },
    { step: 3, label: 'Review', icon: Eye },
    { step: 4, label: 'AI Analysis', icon: Sparkles },
    { step: 5, label: 'Results', icon: CheckCircle2 },
  ];

  return (
    <div className="grid grid-cols-5 gap-1.5 sm:gap-3 mb-6">
      {steps.map((s) => {
        const Icon = s.icon;
        const isActive = currentStep === s.step;
        const isPassed = currentStep > s.step;
        const canClick = onStepClick && s.step <= maxStepAllowed;

        return (
          <button
            key={s.step}
            type="button"
            disabled={!canClick}
            onClick={() => canClick && onStepClick(s.step)}
            className={`p-2.5 sm:p-3.5 rounded-2xl border text-center transition-all ${
              isActive
                ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/20 font-bold'
                : isPassed
                ? 'bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'bg-white dark:bg-darkBg-850 border-slate-200/80 dark:border-slate-800 text-slate-400 font-medium'
            } ${canClick ? 'cursor-pointer hover:border-brand-400' : 'cursor-default'}`}
          >
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Icon className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-wider hidden sm:inline">
                0{s.step}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs truncate font-medium">{s.label}</p>
          </button>
        );
      })}
    </div>
  );
};
