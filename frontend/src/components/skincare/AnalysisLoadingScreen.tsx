import React from 'react';
import { Loader2, CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { Card } from '../common/Card';

interface AnalysisLoadingScreenProps {
  currentStage: string;
}

export const AnalysisLoadingScreen: React.FC<AnalysisLoadingScreenProps> = ({ currentStage }) => {
  const stages = [
    'Validating image resolution and lighting...',
    'Structuring routine and lifestyle parameters...',
    'Connecting to DermaSense AI analysis service...',
    'Compiling personalized guidance and routine baseline...',
  ];

  const currentIdx = stages.findIndex((s) => s === currentStage);
  const activeIdx = currentIdx >= 0 ? currentIdx : 2;

  return (
    <Card
      variant="glass"
      className="p-8 sm:p-12 rounded-3xl border-slate-200/80 dark:border-slate-800 text-center max-w-2xl mx-auto space-y-6"
    >
      <div className="w-16 h-16 rounded-3xl bg-brand-500/10 text-brand-500 border border-brand-500/20 flex items-center justify-center mx-auto shadow-lg relative">
        <Sparkles className="w-8 h-8 animate-pulse text-brand-500" />
        <div className="absolute -top-1 -right-1">
          <Loader2 className="w-5 h-5 animate-spin text-tealBrand-500" />
        </div>
      </div>

      <div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          AI Skincare Analysis in Progress
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
          Evaluating facial skin texture, moisture barrier balance, and lifestyle factors.
        </p>
      </div>

      {/* Progress Stages */}
      <div className="max-w-md mx-auto space-y-2.5 text-left pt-2">
        {stages.map((stage, idx) => {
          const isPassed = idx < activeIdx;
          const isCurrent = idx === activeIdx;

          return (
            <div
              key={idx}
              className={`p-3 rounded-2xl border transition-all flex items-center gap-3 text-xs ${
                isCurrent
                  ? 'bg-brand-50/80 dark:bg-brand-950/40 border-brand-500 text-brand-900 dark:text-brand-200 font-bold shadow-xs'
                  : isPassed
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-medium'
                  : 'bg-slate-50/40 dark:bg-darkBg-900/40 border-slate-200/60 dark:border-slate-800 text-slate-400'
              }`}
            >
              {isPassed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-brand-500 animate-spin flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />
              )}
              <span className="truncate">{stage}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
