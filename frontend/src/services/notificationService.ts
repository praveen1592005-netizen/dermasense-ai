import { CategorizedNotifications } from '../types/settings';

const NOTIFICATIONS_KEY = 'dermasense_notification_prefs';

const DEFAULT_NOTIFICATIONS: CategorizedNotifications = {
  account: {
    securityAlerts: true,
    loginAlerts: true,
  },
  skinHealth: {
    analysisCompletion: true,
    skincareReminders: true,
    progressReminders: false,
  },
  membership: {
    membershipUpdates: true,
    renewalReminders: true,
  },
  offers: {
    coupons: false,
    promotions: false,
  },
};

export const notificationService = {
  async getPreferences(): Promise<CategorizedNotifications> {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return DEFAULT_NOTIFICATIONS;
  },

  async updatePreferences(prefs: CategorizedNotifications): Promise<CategorizedNotifications> {
    await new Promise((res) => setTimeout(res, 250));
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
    return prefs;
  },
};
