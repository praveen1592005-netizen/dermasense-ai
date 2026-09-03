import React from 'react';
import { Globe, Check, Sparkles } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { useTranslation, SupportedLanguage } from '../../context/I18nContext';
import { useNotification } from '../../context/NotificationContext';

export const LanguageSettings: React.FC = () => {
  const { language, setLanguage, languages, t } = useTranslation();
  const { showSuccess } = useNotification();

  const handleSelectLanguage = (langCode: SupportedLanguage, isReady: boolean) => {
    if (!isReady) return;
    setLanguage(langCode);
    showSuccess('Language Updated', `Display language set to ${languages.find(l => l.code === langCode)?.name}.`);
  };

  return (
    <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-tealBrand-500" />
          {t('settings.language', 'Language & Regional Localization')}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Select your preferred interface language. Missing translations automatically fallback to English.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {languages.map((lang) => {
          const isSelected = language === lang.code;
          const isAvailable = lang.isReady;

          return (
            <div
              key={lang.code}
              onClick={() => handleSelectLanguage(lang.code, isAvailable)}
              className={`p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between ${
                !isAvailable
                  ? 'opacity-60 bg-slate-50/50 dark:bg-darkBg-900/30 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                  : isSelected
                  ? 'bg-tealBrand-50/60 dark:bg-tealBrand-950/40 border-tealBrand-500 ring-2 ring-tealBrand-500/20 cursor-pointer shadow-xs'
                  : 'bg-white dark:bg-darkBg-850 border-slate-200/80 dark:border-slate-800 hover:border-tealBrand-400 cursor-pointer'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {lang.name}
                  </h4>
                  {!isAvailable && (
                    <Badge variant="neutral" size="sm">
                      Coming Soon
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                  {lang.nativeName}
                </span>
              </div>

              {isSelected && (
                <span className="w-5 h-5 rounded-full bg-tealBrand-500 text-white flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
