export interface CategorizedNotifications {
  account: {
    securityAlerts: boolean;
    loginAlerts: boolean;
  };
  skinHealth: {
    analysisCompletion: boolean;
    skincareReminders: boolean;
    progressReminders: boolean;
  };
  membership: {
    membershipUpdates: boolean;
    renewalReminders: boolean;
  };
  offers: {
    coupons: boolean;
    promotions: boolean;
  };
}

export interface PrivacyPreferences {
  personalizedExperience: boolean;
  usageAnalytics: boolean;
  recommendationPersonalization: boolean;
  storeAnalysisHistory: boolean;
}

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface LoginActivityRecord {
  id: string;
  date: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  status: 'Successful' | 'Failed' | 'Suspicious';
}

export interface ComprehensiveSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: CategorizedNotifications;
  privacy: PrivacyPreferences;
  twoFactorEnabled: boolean;
}
