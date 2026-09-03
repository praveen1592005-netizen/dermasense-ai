import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
  badge?: string;
  color?: 'brand' | 'teal' | 'indigo' | 'slate';
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon: Icon,
  to,
  badge,
  color = 'brand',
}) => {
  const iconColors = {
    brand: 'text-brand-500 bg-brand-500/10 group-hover:bg-brand-500/20 group-hover:text-brand-400',
    teal: 'text-tealBrand-500 bg-tealBrand-500/10 group-hover:bg-tealBrand-500/20 group-hover:text-tealBrand-400',
    indigo: 'text-indigoBrand-500 bg-indigoBrand-500/10 group-hover:bg-indigoBrand-500/20 group-hover:text-indigoBrand-400',
    slate: 'text-slate-400 bg-slate-500/10 group-hover:bg-slate-500/20 group-hover:text-slate-300',
  };

  return (
    <Link
      to={to}
      className="group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-darkBg-850 border border-slate-200/80 dark:border-slate-800/90 shadow-sm hover:shadow-md hover:border-brand-500/40 dark:hover:border-brand-500/40 transition-all duration-200"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center transition-colors flex-shrink-0',
            iconColors[color]
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-brand-500 transition-colors">
              {title}
            </h4>
            {badge && (
              <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-slate-100 dark:bg-darkBg-750 text-slate-600 dark:text-slate-300">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {description}
          </p>
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
    </Link>
  );
};
