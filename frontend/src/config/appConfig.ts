export const appConfig = {
  appName: 'DermaSense AI',
  tagline: 'AI-Powered Skin Health & Personalized Care',
  version: '1.0.0-phase1',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.dermasense.ai/v1',
  enableFirebase: import.meta.env.VITE_ENABLE_FIREBASE === 'true',
  supportEmail: 'support@dermasense.ai',
};
