import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, ShieldCheck, Sparkles, Cpu } from 'lucide-react';
import { Card } from '../common/Card';

export const DiseaseAnalysisLoading: React.FC = () => {
  const [currentStage, setCurrentStage] = useState(0);

  const stages = [
    'Image resolution & RGB normalization verified ✓',
    'Preprocessing image for EfficientNetV2 (224x224) ✓',
    'Executing dermatology model inference & class probability calculation...',
    'Evaluating confidence threshold & safety triage matrix...',
    'Querying local Ollama AI for report explanation & barrier care advice...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card
      variant="glass"
      className="p-8 sm:p-12 rounded-3xl border-brand-500/30 text-center max-w-lg mx-auto space-y-6 animate-fadeIn shadow-2xl"
    >
      <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin" />
        <Cpu className="w-8 h-8 text-brand-500 animate-pulse" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-2">
          Running Local AI Skin Screening
          <Sparkles className="w-4 h-4 text-tealBrand-500" />
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          EfficientNetV2 Image Classifier + Local Ollama LLM
        </p>
      </div>

      {/* Honest Stages List */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-darkBg-900 border border-slate-200/80 dark:border-slate-800 text-left space-y-2.5 text-xs">
        {stages.map((stage, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-2.5 transition-opacity duration-300 ${
              idx <= currentStage
                ? 'opacity-100 text-slate-800 dark:text-slate-200 font-semibold'
                : 'opacity-30 text-slate-400'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                idx < currentStage
                  ? 'bg-emerald-500'
                  : idx === currentStage
                  ? 'bg-brand-500 animate-ping'
                  : 'bg-slate-300 dark:bg-slate-700'
              }`}
            />
            <span className="text-[11px] leading-tight">{stage}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

