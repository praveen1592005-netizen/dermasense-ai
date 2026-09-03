import React, { useState } from 'react';
import { ShieldAlert, Info, X } from 'lucide-react';
import { MEDICAL_DISCLAIMER_TEXT } from '../../utils/constants';

interface MedicalDisclaimerBannerProps {
  dismissible?: boolean;
}

export const MedicalDisclaimerBanner: React.FC<MedicalDisclaimerBannerProps> = ({
  dismissible = false,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="w-full rounded-2xl bg-gradient-to-r from-brand-950/60 via-slate-900/80 to-tealBrand-950/60 border border-brand-500/30 p-3.5 sm:p-4 shadow-sm backdrop-blur-md">
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-brand-500/20 text-brand-400 flex-shrink-0 mt-0.5">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div className="flex-1 text-xs text-slate-300 leading-relaxed">
          <span className="font-semibold text-brand-300 mr-1.5 uppercase tracking-wider text-[11px] inline-flex items-center gap-1">
            <Info className="w-3 h-3" /> Medical Notice:
          </span>
          {MEDICAL_DISCLAIMER_TEXT}
        </div>
        {dismissible && (
          <button
            onClick={() => setIsDismissed(true)}
            className="text-slate-400 hover:text-slate-200 p-1 rounded transition-colors"
            aria-label="Dismiss disclaimer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
