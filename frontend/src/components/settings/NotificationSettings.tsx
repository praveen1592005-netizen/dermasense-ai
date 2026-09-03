import React, { useState, useEffect } from 'react';
import {
  Bell,
  ShieldAlert,
  HeartPulse,
  CreditCard,
  Gift,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { notificationService } from '../../services/notificationService';
import { useNotification } from '../../context/NotificationContext';
import { CategorizedNotifications } from '../../types/settings';

export const NotificationSettings: React.FC = () => {
  const { showSuccess } = useNotification();
  const [notifications, setNotifications] = useState<CategorizedNotifications | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPrefs = async () => {
      const prefs = await notificationService.getPreferences();
      setNotifications(prefs);
    };
    fetchPrefs();
  }, []);

  const toggle = (category: keyof CategorizedNotifications, key: string) => {
    if (!notifications) return;
    setNotifications({
      ...notifications,
      [category]: {
        ...notifications[category],
        [key]: !(notifications[category] as any)[key],
      },
    });
  };

  const handleSave = async () => {
    if (!notifications) return;
    setIsSaving(true);
    try {
      await notificationService.updatePreferences(notifications);
      showSuccess('Notification Preferences Saved', 'Your communication settings have been updated.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!notifications) return null;

  const sections = [
    {
      category: 'account' as const,
      title: 'Account & Security Alerts',
      icon: ShieldAlert,
      color: 'text-brand-500',
      items: [
        { key: 'securityAlerts', title: 'Security Alerts', desc: 'Critical password, session, and recovery notices' },
        { key: 'loginAlerts', title: 'New Login Notifications', desc: 'Alerts when a new device accesses your account' },
      ],
    },
    {
      category: 'skinHealth' as const,
      title: 'Skin Health & AI Analysis',
      icon: HeartPulse,
      color: 'text-rose-500',
      items: [
        { key: 'analysisCompletion', title: 'Analysis Completion', desc: 'Notifications when new AI routine reports are ready' },
        { key: 'skincareReminders', title: 'Daily Skincare Reminders', desc: 'Gentle AM/PM routine and sunscreen alerts' },
        { key: 'progressReminders', title: 'Progress Photo Check-ins', desc: 'Bi-weekly reminders to capture skin tracking photos' },
      ],
    },
    {
      category: 'membership' as const,
      title: 'Membership & Subscription',
      icon: CreditCard,
      color: 'text-indigoBrand-500',
      items: [
        { key: 'membershipUpdates', title: 'Tier Benefits & Feature Drops', desc: 'Updates on new premium AI features' },
        { key: 'renewalReminders', title: 'Renewal & Billing Notices', desc: 'Invoices and upcoming renewal reminders' },
      ],
    },
    {
      category: 'offers' as const,
      title: 'Perks & Wellness Offers',
      icon: Gift,
      color: 'text-amber-500',
      items: [
        { key: 'coupons', title: 'Skincare Product Coupons', desc: 'Personalized ingredient and product discount codes' },
        { key: 'promotions', title: 'Partner Promotions', desc: 'Special offers from certified dermatology brands' },
      ],
    },
  ];

  return (
    <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigoBrand-500" />
            Notification Preferences
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Choose which alerts, health reminders, and communication channels you receive.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          isLoading={isSaving}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save Preferences
        </Button>
      </div>

      <div className="space-y-6">
        {sections.map((sec) => {
          const Icon = sec.icon;
          return (
            <div key={sec.category} className="space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Icon className={`w-4 h-4 ${sec.color}`} />
                <span>{sec.title}</span>
              </h4>

              <div className="space-y-2">
                {sec.items.map((item) => {
                  const isChecked = (notifications[sec.category] as any)[item.key];
                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 dark:bg-darkBg-900/60 border border-slate-200/60 dark:border-slate-800"
                    >
                      <div className="min-w-0 pr-4">
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </h5>
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.desc}
                        </p>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggle(sec.category, item.key)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500" />
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
