import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const AnalysisDisclaimer: React.FC = () => {
  return (
    <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 leading-relaxed space-y-1">
      <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
        <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <span>Medical & AI Safety Disclaimer</span>
      </div>
      <p className="pl-6 text-[11px] text-amber-800/90 dark:text-amber-200/90">
        Important: DermaSense AI provides AI-assisted informational skincare guidance. It is not a medical diagnosis and does not replace evaluation, diagnosis, or treatment by a qualified healthcare professional. If you experience persistent redness, pain, bleeding, or suspicious lesions, please seek in-person medical attention.
      </p>
    </div>
  );
};
