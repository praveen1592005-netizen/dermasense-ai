import React from 'react';
import { Sun, Sparkles, Eye, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Card } from '../common/Card';

export const ImageGuidanceCard: React.FC = () => {
  const guidelines = [
    { text: 'Use natural or bright, even lighting (avoid harsh backlighting or heavy shadows).', icon: Sun },
    { text: 'Keep camera steady at eye level, roughly 20–30 cm from your face.', icon: Sparkles },
    { text: 'Avoid beauty filters, sunglasses, hats, or heavy makeup covering your skin.', icon: Eye },
    { text: 'Ensure forehead, cheeks, nose, and chin are in clear, focused view.', icon: CheckCircle2 },
  ];

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200/60 dark:border-brand-900/40 space-y-3">
      <h4 className="text-xs sm:text-sm font-bold text-brand-900 dark:text-brand-200 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-brand-500" />
        Guidelines for Accurate Facial Skin Capture
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {guidelines.map((g, i) => {
          const Icon = g.icon;
          return (
            <div key={i} className="flex items-start gap-2 text-xs text-brand-800 dark:text-brand-300">
              <Icon className="w-3.5 h-3.5 text-brand-500 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{g.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
