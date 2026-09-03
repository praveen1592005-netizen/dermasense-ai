import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'teal' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/20 hover:shadow-lg hover:shadow-brand-500/30 focus-visible:ring-brand-500',
      secondary:
        'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/60 focus-visible:ring-slate-400',
      outline:
        'bg-transparent hover:bg-brand-50 dark:hover:bg-brand-950/30 text-brand-600 dark:text-brand-400 border border-brand-300 dark:border-brand-500/40 focus-visible:ring-brand-500',
      ghost:
        'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus-visible:ring-slate-400',
      danger:
        'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 focus-visible:ring-rose-500',
      teal:
        'bg-tealBrand-600 hover:bg-tealBrand-500 text-white shadow-md shadow-tealBrand-600/20 focus-visible:ring-tealBrand-500',
      gradient:
        'bg-gradient-to-r from-brand-600 via-tealBrand-600 to-indigoBrand-600 hover:from-brand-500 hover:via-tealBrand-500 hover:to-indigoBrand-500 text-white shadow-md shadow-brand-500/25 hover:shadow-lg hover:shadow-brand-500/40 focus-visible:ring-brand-500 border border-white/10',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-6 py-3.5 gap-2.5 rounded-2xl font-semibold',
      icon: 'p-2.5 rounded-xl',
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
