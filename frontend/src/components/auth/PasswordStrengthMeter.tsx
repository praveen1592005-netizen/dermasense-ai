import React from 'react';
import { Check, X } from 'lucide-react';
import { calculatePasswordStrength } from '../../utils/validation';

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  if (!password) return null;

  const strength = calculatePasswordStrength(password);

  const criteria = [
    { label: 'At least 8 characters', met: strength.hasLength },
    { label: 'Uppercase letter (A-Z)', met: strength.hasUppercase },
    { label: 'Lowercase letter (a-z)', met: strength.hasLowercase },
    { label: 'Number (0-9)', met: strength.hasNumber },
    { label: 'Special character (!@#$...)', met: strength.hasSpecial },
  ];

  return (
    <div className="w-full space-y-2 mt-1 p-3 rounded-xl bg-slate-100/60 dark:bg-darkBg-900/60 border border-slate-200/80 dark:border-slate-800/80 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-600 dark:text-slate-400">Password Strength:</span>
        <span className="font-bold text-slate-800 dark:text-slate-200">{strength.label}</span>
      </div>

      {/* Strength Bar */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-full rounded-full transition-all duration-300 ${
              strength.score >= step
                ? strength.color
                : 'bg-slate-200 dark:bg-slate-800'
            }`}
          />
        ))}
      </div>

      {/* Criteria Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
        {criteria.map((c, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[11px]">
            {c.met ? (
              <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
            ) : (
              <X className="w-3 h-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
            )}
            <span
              className={
                c.met
                  ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                  : 'text-slate-500 dark:text-slate-400'
              }
            >
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
