import React from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { Card } from '../common/Card';
import { useTheme } from '../../context/ThemeContext';

export const AppearanceSettings: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const modes = [
    {
      id: 'light' as const,
      label: 'Light Mode',
      desc: 'Clean medical aesthetic with high daylight visibility',
      icon: Sun,
    },
    {
      id: 'dark' as const,
      label: 'Dark Mode',
      desc: 'Sleek contrast optimized for photographic skin evaluation',
      icon: Moon,
    },
    {
      id: 'system' as const,
      label: 'System Default',
      desc: 'Automatically synchronizes with your device preferences',
      icon: Laptop,
    },
  ];

  return (
    <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sun className="w-5 h-5 text-brand-500" />
          Appearance & Display Theme
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Personalize the visual styling of DermaSense AI across all pages and modules.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {modes.map((m) => {
          const Icon = m.icon;
          const isSelected = theme === m.id;
          return (
            <div
              key={m.id}
              onClick={() => setTheme(m.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-brand-50/60 dark:bg-brand-950/40 border-brand-500 ring-2 ring-brand-500/20 shadow-md'
                  : 'bg-white dark:bg-darkBg-850 border-slate-200/80 dark:border-slate-800 hover:border-brand-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`p-2.5 rounded-xl border ${
                      isSelected
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'bg-slate-100 dark:bg-darkBg-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {m.label}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {m.desc}
                </p>
              </div>

              <span className="text-[10px] font-bold uppercase text-slate-400 mt-4 block">
                {isSelected ? 'Active Selection' : 'Click to Apply'}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
