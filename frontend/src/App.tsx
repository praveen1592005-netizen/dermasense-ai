import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { I18nProvider } from './context/I18nContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { AppRouter } from './routes/AppRouter';
import { OfflineNotice } from './components/common/OfflineNotice';
import { MaintenancePage } from './pages/public/MaintenancePage';
import { featureFlagsService } from './config/featureFlags';
import { isSupabaseConfigured } from './services/supabaseClient';

// Check maintenance mode flag on startup
const flags = featureFlagsService.getFlags();

export function App() {
  if (!isSupabaseConfigured) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: '#dc2626' }}>Configuration Error</h1>
        <p>The application failed to start because the Supabase environment variables are missing.</p>
        <p>Please ensure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> are set in your environment (e.g., Vercel Dashboard).</p>
      </div>
    );
  }

  // Show maintenance page if admin has enabled it via feature flag
  if (flags.ENABLE_MAINTENANCE_MODE) {
    return <MaintenancePage />;
  }

  return (
    <BrowserRouter>
      <ThemeProvider>
        <I18nProvider>
          <NotificationProvider>
            <AuthProvider>
              <AppRouter />
              {/* Global offline detection banner */}
              <OfflineNotice />
            </AuthProvider>
          </NotificationProvider>
        </I18nProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
