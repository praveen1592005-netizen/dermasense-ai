import React from 'react';
import { Info, ArrowLeft, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';

interface AnalysisUnavailableCardProps {
  onBack: () => void;
  onRetry: () => void;
}

export const AnalysisUnavailableCard: React.FC<AnalysisUnavailableCardProps> = ({
  onBack,
  onRetry,
}) => {
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-brand-50/70 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-900/50 space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-500 border border-brand-500/20 flex-shrink-0">
          <Info className="w-5 h-5" />
        </div>

        <div className="space-y-2 text-xs sm:text-sm">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
            AI Model Integration Notice
          </h4>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Your image and skin profile parameters have been prepared and validated successfully. Deep-learning computer vision inference will automatically activate when the dedicated DermaSense FastAPI model backend is linked.
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Below, we have compiled an evidence-based cosmetic routine and lifestyle guidance baseline tailored to your stated skin characteristics and concerns.
          </p>
        </div>
      </div>
    </div>
  );
};
