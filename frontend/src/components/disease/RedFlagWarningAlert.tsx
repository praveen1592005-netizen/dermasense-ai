import React from 'react';
import { AlertOctagon, PhoneCall, ShieldAlert } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

interface RedFlagWarningAlertProps {
  hasRedFlags: boolean;
  onToggleRedFlag: (flagId: string) => void;
  selectedRedFlags: string[];
}

export const RedFlagWarningAlert: React.FC<RedFlagWarningAlertProps> = ({
  hasRedFlags,
  onToggleRedFlag,
  selectedRedFlags,
}) => {
  const redFlagOptions = [
    { id: 'breathing', label: 'Difficulty breathing / throat tightness' },
    { id: 'facial_swelling', label: 'Rapid swelling of lips, tongue, or eyes' },
    { id: 'severe_pain', label: 'Sudden, severe, or unrelenting pain' },
    { id: 'heavy_bleeding', label: 'Active heavy bleeding or pus discharge' },
    { id: 'rapid_spread', label: 'Rapidly spreading dark purple/black discoloration' },
  ];

  return (
    <div className="space-y-4">
      {/* Red-Flag Check Questions */}
      <Card variant="glass" className="p-5 rounded-3xl border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 space-y-3">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <h4 className="text-xs sm:text-sm font-bold text-rose-950 dark:text-rose-200">
            Emergency Safety Screening (Red-Flag Symptoms)
          </h4>
        </div>
        <p className="text-[11px] text-rose-900/80 dark:text-rose-300/80 leading-relaxed">
          Please indicate if you are experiencing any of the following acute symptoms right now:
        </p>

        <div className="space-y-2 pt-1">
          {redFlagOptions.map((flag) => {
            const isChecked = selectedRedFlags.includes(flag.id);
            return (
              <label
                key={flag.id}
                className={`flex items-start gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-rose-500 text-white border-rose-500 font-bold shadow-2xs'
                    : 'bg-white dark:bg-darkBg-900 border-rose-200/80 dark:border-rose-900/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleRedFlag(flag.id)}
                  className="w-4 h-4 mt-0.5 rounded text-rose-600 focus:ring-rose-500 border-rose-300"
                />
                <span>{flag.label}</span>
              </label>
            );
          })}
        </div>
      </Card>

      {/* Prominent Emergency Warning Banner if any Red-Flag is selected */}
      {hasRedFlags && (
        <Card variant="default" className="p-5 rounded-3xl bg-gradient-to-br from-rose-600 to-rose-700 text-white shadow-xl space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2 font-extrabold text-sm sm:text-base">
            <ShieldAlert className="w-6 h-6 animate-bounce" />
            <span>URGENT MEDICAL ATTENTION REQUIRED</span>
          </div>

          <p className="text-xs sm:text-sm text-rose-100 leading-relaxed">
            Your reported symptoms indicate a potential acute allergic reaction or critical condition. Please seek immediate emergency medical care or visit the nearest hospital emergency department rather than relying on this AI screening.
          </p>
        </Card>
      )}
    </div>
  );
};
