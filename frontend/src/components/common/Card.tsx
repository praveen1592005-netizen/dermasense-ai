import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'bordered' | 'elevated' | 'interactive' | 'gradientBorder';
  hoverEffect?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className,
      variant = 'default',
      hoverEffect = false,
      padding = 'md',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'rounded-2xl transition-all duration-200';

    const variants = {
      default:
        'bg-white dark:bg-darkBg-850 border border-slate-200/80 dark:border-slate-800 shadow-sm',
      glass:
        'glass-panel shadow-glass-card dark:shadow-glass-card-dark',
      bordered:
        'bg-transparent border border-slate-200 dark:border-slate-800',
      elevated:
        'bg-white dark:bg-darkBg-850 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/40',
      interactive:
        'bg-white dark:bg-darkBg-850 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-500/5 cursor-pointer',
      gradientBorder:
        'relative bg-white dark:bg-darkBg-850 p-[1px] rounded-2xl bg-gradient-to-br from-brand-500/30 via-tealBrand-500/20 to-indigoBrand-500/30 shadow-md',
    };

    const paddings = {
      none: 'p-0',
      sm: 'p-3 sm:p-4',
      md: 'p-5 sm:p-6',
      lg: 'p-6 sm:p-8',
      xl: 'p-8 sm:p-10',
    };

    const hoverStyles = hoverEffect ? 'hover:-translate-y-1 hover:shadow-md' : '';

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], paddings[padding], hoverStyles, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
