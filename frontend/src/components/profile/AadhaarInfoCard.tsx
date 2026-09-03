import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface AadhaarInfoCardProps {
  aadhaar?: {
    isProvided: boolean;
    maskedNumber?: string;
    lastFourDigits?: string;
    verificationStatus?: string;
  };
  onEditClick: () => void;
}

export const AadhaarInfoCard: React.FC<AadhaarInfoCardProps> = ({ aadhaar, onEditClick }) => {
  const isProvided = Boolean(aadhaar?.isProvided && aadhaar.maskedNumber);

  return (
    <Card variant="glass" className="p-6 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigoBrand-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Identity & Government ID (Aadhaar)
          </h3>
        </div>
        {isProvided ? (
          <Badge variant="indigo" size="sm">
            Vault Linked
          </Badge>
        ) : (
          <Badge variant="neutral" size="sm">
            Optional
          </Badge>
        )}
      </div>

      <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-darkBg-900/50 border border-slate-200/60 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
              National ID (India)
            </span>
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-indigoBrand-500 flex-shrink-0" />
              <span className="font-mono text-sm font-bold tracking-widest text-slate-900 dark:text-white">
                {isProvided ? aadhaar?.maskedNumber : '•••• •••• •••• (Not provided)'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onEditClick}
            className="text-xs font-bold text-indigoBrand-600 dark:text-indigoBrand-400 hover:underline self-start sm:self-center"
          >
            {isProvided ? 'Update ID' : 'Link Aadhaar'}
          </button>
        </div>
      </div>

      {/* Security Explanation & Backend Status Notice (Section 3) */}
      <div className="p-3.5 rounded-2xl bg-indigoBrand-50/50 dark:bg-indigoBrand-950/30 border border-indigoBrand-200/60 dark:border-indigoBrand-900/40 text-xs text-indigoBrand-900 dark:text-indigoBrand-200 leading-relaxed space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-indigoBrand-800 dark:text-indigoBrand-300">
          <Info className="w-3.5 h-3.5" />
          <span>Sensitive Identity Protection Policy</span>
        </div>
        <p className="text-[11px] text-indigoBrand-800/90 dark:text-indigoBrand-300/90">
          Sensitive identity information is protected and displayed only when necessary. Full 12-digit Aadhaar numbers are never stored in localStorage, never logged, and masked for privacy.
        </p>
      </div>
    </Card>
  );
};
