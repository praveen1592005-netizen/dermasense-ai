import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, AlertCircle, LucideIcon } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export interface PrimaryServiceCardProps {
  id: 'skincare' | 'disease';
  title: string;
  description: string;
  icon: LucideIcon;
  badgeText?: string;
  badgeVariant?: 'brand' | 'warning' | 'teal' | 'indigo';
  capabilities: string[];
  to: string;
  buttonText: string;
  gradientTheme?: 'brand' | 'teal' | 'indigo';
}

export const PrimaryServiceCard: React.FC<PrimaryServiceCardProps> = ({
  title,
  description,
  icon: Icon,
  badgeText,
  badgeVariant = 'brand',
  capabilities,
  to,
  buttonText,
  gradientTheme = 'brand',
}) => {
  const navigate = useNavigate();

  const themeGradients = {
    brand: 'from-brand-500/10 via-brand-500/5 to-transparent border-brand-500/30 hover:border-brand-500/60 shadow-brand-500/5',
    teal: 'from-tealBrand-500/10 via-tealBrand-500/5 to-transparent border-tealBrand-500/30 hover:border-tealBrand-500/60 shadow-tealBrand-500/5',
    indigo: 'from-indigoBrand-500/10 via-indigoBrand-500/5 to-transparent border-indigoBrand-500/30 hover:border-indigoBrand-500/60 shadow-indigoBrand-500/5',
  };

  const iconBg = {
    brand: 'bg-brand-500/15 text-brand-500 dark:text-brand-400 border-brand-500/30',
    teal: 'bg-tealBrand-500/15 text-tealBrand-500 dark:text-tealBrand-400 border-tealBrand-500/30',
    indigo: 'bg-indigoBrand-500/15 text-indigoBrand-500 dark:text-indigoBrand-400 border-indigoBrand-500/30',
  };

  return (
    <div
      className={`relative flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-gradient-to-br bg-white dark:bg-darkBg-850 border backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${themeGradients[gradientTheme]}`}
    >
      <div>
        {/* Header with Icon and Badges */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className={`p-3.5 rounded-2xl border ${iconBg[gradientTheme]} shadow-sm`}>
            <Icon className="w-7 h-7" />
          </div>
          {badgeText && (
            <Badge variant={badgeVariant} size="md" dot>
              {badgeText}
            </Badge>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2.5">
          {title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          {description}
        </p>

        {/* Capabilities Pills */}
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
            Key Capabilities
          </p>
          <div className="flex flex-wrap gap-1.5">
            {capabilities.map((item, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-darkBg-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <Button
          variant={gradientTheme === 'teal' ? 'teal' : 'primary'}
          size="lg"
          className="w-full justify-between group"
          onClick={() => navigate(to)}
          rightIcon={<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};
