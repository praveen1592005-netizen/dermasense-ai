import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LucideIcon, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';
import { cn } from '../../utils/cn';

export interface StatusCardProps {
  title: string;
  value: string;
  statusType?: 'success' | 'warning' | 'info' | 'neutral';
  icon: LucideIcon;
  actionText: string;
  actionTo: string;
  description?: string;
  className?: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  statusType = 'neutral',
  icon: Icon,
  actionText,
  actionTo,
  description,
  className = '',
}) => {
  const navigate = useNavigate();

  const statusColors = {
    success: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    warning: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    info: 'text-brand-600 dark:text-brand-400 bg-brand-500/10 border-brand-500/20',
    neutral: 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-darkBg-800 border-slate-200 dark:border-slate-700/60',
  };

  return (
    <div
      className={cn(
        'flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-darkBg-850 border border-slate-200/80 dark:border-slate-800/90 shadow-sm transition-all duration-200 hover:shadow-md',
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </span>
          <div className={cn('p-2 rounded-xl border', statusColors[statusType])}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="mb-2">
          <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {value}
          </span>
        </div>

        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
            {description}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 mt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(actionTo)}
          className="w-full justify-between text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 p-0 hover:bg-transparent font-semibold"
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          {actionText}
        </Button>
      </div>
    </div>
  );
};
