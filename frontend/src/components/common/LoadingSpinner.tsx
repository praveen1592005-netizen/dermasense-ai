import React from 'react';
import { cn } from '../../utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 p-4', className)}>
      <div className="relative flex items-center justify-center">
        {/* Animated Scanner Ring */}
        <div
          className={cn(
            'rounded-full border-slate-200 dark:border-slate-800 border-t-brand-500 border-r-tealBrand-500 animate-spin',
            sizeMap[size]
          )}
        />
        {/* Glowing Center Pulse */}
        <div className="absolute w-2 h-2 rounded-full bg-brand-500 animate-ping" />
      </div>
      {text && (
        <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};
