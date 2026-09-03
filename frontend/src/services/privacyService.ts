import { PrivacyPreferences } from '../types/settings';

const PRIVACY_KEY = 'dermasense_privacy_prefs';

const DEFAULT_PRIVACY: PrivacyPreferences = {
  personalizedExperience: true,
  usageAnalytics: false,
  recommendationPersonalization: true,
  storeAnalysisHistory: true,
};

export const privacyService = {
  async getPreferences(): Promise<PrivacyPreferences> {
    try {
      const stored = localStorage.getItem(PRIVACY_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return DEFAULT_PRIVACY;
  },

  async updatePreferences(prefs: PrivacyPreferences): Promise<PrivacyPreferences> {
    await new Promise((res) => setTimeout(res, 250));
    try {
      localStorage.setItem(PRIVACY_KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
    return prefs;
  },

  exportUserData(): void {
    const payload = {
      app: 'DermaSense AI',
      exportVersion: '2.0.0',
      exportedAt: new Date().toISOString(),
      user: localStorage.getItem('dermasense_auth_user'),
      settings: localStorage.getItem('dermasense_user_settings'),
      notifications: localStorage.getItem('dermasense_notification_prefs'),
      privacy: localStorage.getItem(PRIVACY_KEY),
      skincareDrafts: localStorage.getItem('dermasense_skincare_submissions'),
      diseaseDrafts: localStorage.getItem('dermasense_disease_submissions'),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dermasense_user_archive_${Date.now()}.json`;
    a.click();
  },

  clearLocalPreferences(): void {
    localStorage.removeItem(PRIVACY_KEY);
    localStorage.removeItem('dermasense_notification_prefs');
    localStorage.removeItem('dermasense_theme');
    localStorage.removeItem('dermasense_language');
  },
};
