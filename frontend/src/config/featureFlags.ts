export interface FeatureFlags {
  ENABLE_SKINCARE_AI: boolean;
  ENABLE_DISEASE_AI: boolean;
  ENABLE_TELEHEALTH_VIDEO: boolean;
  ENABLE_MULTI_STORE: boolean;
  ENABLE_PROMO_COUPONS: boolean;
  ENABLE_MAINTENANCE_MODE: boolean;
  ENABLE_ADMIN_DASHBOARD: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  ENABLE_SKINCARE_AI: true,
  ENABLE_DISEASE_AI: true,
  ENABLE_TELEHEALTH_VIDEO: true,
  ENABLE_MULTI_STORE: true,
  ENABLE_PROMO_COUPONS: true,
  ENABLE_MAINTENANCE_MODE: false,
  ENABLE_ADMIN_DASHBOARD: true,
};

const FLAGS_STORAGE_KEY = 'dermasense_feature_flags_v8';

export const featureFlagsService = {
  getFlags(): FeatureFlags {
    try {
      const raw = localStorage.getItem(FLAGS_STORAGE_KEY);
      if (!raw) return DEFAULT_FLAGS;
      return { ...DEFAULT_FLAGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_FLAGS;
    }
  },

  setFlag(key: keyof FeatureFlags, value: boolean): void {
    const current = this.getFlags();
    const updated = { ...current, [key]: value };
    localStorage.setItem(FLAGS_STORAGE_KEY, JSON.stringify(updated));
  },

  resetDefaults(): void {
    localStorage.setItem(FLAGS_STORAGE_KEY, JSON.stringify(DEFAULT_FLAGS));
  },
};
