import React from 'react';
import {
  Sun,
  Globe,
  Bell,
  Shield,
  KeyRound,
  User,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export type SettingsTab =
  | 'appearance'
  | 'language'
  | 'notifications'
  | 'privacy'
  | 'security'
  | 'account';

interface SettingsSidebarNavProps {
  activeTab: SettingsTab;
  onSelectTab: (tab: SettingsTab) => void;
}

export const SettingsSidebarNav: React.FC<SettingsSidebarNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'appearance', label: 'Appearance & Theme', icon: Sun },
    { id: 'language', label: 'Language & Region', icon: Globe },
    { id: 'notifications', label: 'Notification Preferences', icon: Bell },
    { id: 'privacy', label: 'Privacy & Data Controls', icon: Shield },
    { id: 'security', label: 'Security & Sessions', icon: KeyRound },
    { id: 'account', label: 'Account & Credentials', icon: User },
  ];

  return (
    <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap text-left',
              isActive
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                : 'bg-white dark:bg-darkBg-850 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-darkBg-800 border border-slate-200/80 dark:border-slate-800'
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
