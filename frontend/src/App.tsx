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

// Check maintenance mode flag on startup
const flags = featureFlagsService.getFlags();

export function App() {
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
