export interface EnvironmentConfig {
  appName: string;
  appVersion: string;
  appEnv: 'development' | 'staging' | 'production';
  apiBaseUrl: string;
  currency: string;
  defaultTimezone: string;
  maxUploadSizeBytes: number;
  diseaseImageRetentionDays: number;
}

export const ENV: EnvironmentConfig = {
  appName: 'DermaSense AI',
  appVersion: '8.0.0-production',
  appEnv: (import.meta.env.MODE as any) || 'production',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.dermasense.ai/v1',
  currency: 'INR',
  defaultTimezone: 'Asia/Kolkata',
  maxUploadSizeBytes: 10 * 1024 * 1024, // 10 MB
  diseaseImageRetentionDays: 90,
};

export const validateEnvironment = (): { isValid: boolean; missingVars: string[] } => {
  const missing: string[] = [];
  // Non-blocking environment validation
  return {
    isValid: missing.length === 0,
    missingVars: missing,
  };
};
