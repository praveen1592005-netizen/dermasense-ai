import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar';
import { DashboardNavbar } from '../components/dashboard/DashboardNavbar';
import { MedicalDisclaimerBanner } from '../components/dashboard/MedicalDisclaimerBanner';
import { GlobalChatWidget } from '../components/common/GlobalChatWidget';
import { useAuth } from '../context/AuthContext';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const userId = user?.id || 'usr_guest';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkBg-950 text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Sidebar */}
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <DashboardNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Medical Notice Banner */}
          <MedicalDisclaimerBanner dismissible />

          {/* Nested Page Routes */}
          <Outlet />
        </main>
      </div>

      {/* Global AI Chat Assistant Widget */}
      <GlobalChatWidget />
    </div>
  );
};


