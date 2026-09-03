import React from 'react';
import { LucideIcon, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  badgeText?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Sparkles,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  secondaryActionLabel,
  onSecondaryAction,
  badgeText,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-darkBg-900/40',
        className
      )}
    >
      <div className="relative mb-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-brand-500/10 dark:bg-brand-500/15 border border-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 shadow-sm">
          <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-tealBrand-500 animate-ping opacity-75" />
      </div>

      {badgeText && (
        <span className="mb-2 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {badgeText}
        </span>
      )}

      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1.5 max-w-md">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-6">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actionLabel && onAction && (
            <Button
              variant="primary"
              size="sm"
              onClick={onAction}
              leftIcon={actionIcon}
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
