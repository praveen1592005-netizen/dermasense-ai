import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import enTranslations from '../locales/en/common.json';
import taTranslations from '../locales/ta/common.json';
import hiTranslations from '../locales/hi/common.json';

export type SupportedLanguage = 'en' | 'ta' | 'hi' | 'te' | 'ml' | 'kn';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  isReady: boolean;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English (US)', nativeName: 'English', isReady: true },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', isReady: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', isReady: true },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', isReady: false },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', isReady: false },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', isReady: false },
];

const dictionaries: Record<string, any> = {
  en: enTranslations,
  ta: taTranslations,
  hi: hiTranslations,
};

interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, defaultVal?: string) => string;
  languages: LanguageInfo[];
}

const LANGUAGE_KEY = 'dermasense_language';

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_KEY) as SupportedLanguage;
      if (saved && LANGUAGES.some(l => l.code === saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const t = useCallback(
    (key: string, defaultVal?: string): string => {
      const keys = key.split('.');
      
      // Look up in current language dictionary
      let currentObj = dictionaries[language] || dictionaries['en'];
      for (const k of keys) {
        if (currentObj && typeof currentObj === 'object' && k in currentObj) {
          currentObj = currentObj[k];
        } else {
          currentObj = undefined;
          break;
        }
      }

      if (typeof currentObj === 'string') {
        return currentObj;
      }

      // Fallback to English dictionary
      let fallbackObj = dictionaries['en'];
      for (const k of keys) {
        if (fallbackObj && typeof fallbackObj === 'object' && k in fallbackObj) {
          fallbackObj = fallbackObj[k];
        } else {
          fallbackObj = undefined;
          break;
        }
      }

      if (typeof fallbackObj === 'string') {
        return fallbackObj;
      }

      return defaultVal || key;
    },
    [language]
  );

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
