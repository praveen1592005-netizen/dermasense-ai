import { UserSettings, UserProfile } from '../types/user';
import { authService } from './authService';

const SETTINGS_KEY = 'dermasense_user_settings';

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  language: 'en',
  notifications: {
    email: true,
    analysis: true,
    appointments: true,
    offers: false,
  },
  privacy: {
    shareAnonymousMetrics: false,
    storeAnalysisHistory: true,
  },
};

export const userService = {
  async getSettings(): Promise<UserSettings> {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to load settings', e);
    }
    return DEFAULT_SETTINGS;
  },

  async updateSettings(newSettings: Partial<UserSettings>): Promise<UserSettings> {
    const current = await this.getSettings();
    const merged: UserSettings = {
      ...current,
      ...newSettings,
      notifications: {
        ...current.notifications,
        ...(newSettings.notifications || {}),
      },
      privacy: {
        ...current.privacy,
        ...(newSettings.privacy || {}),
      }
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    return merged;
  },

  async updateProfile(userId: string, profile: Partial<UserProfile>) {
    return authService.updateUserProfile(userId, profile);
  }
};
