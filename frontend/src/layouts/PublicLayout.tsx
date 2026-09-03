import React from 'react';
import { Outlet } from 'react-router-dom';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { LandingFooter } from '../components/landing/LandingFooter';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-darkBg-950 text-slate-900 dark:text-slate-100 transition-colors">
      <LandingNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <LandingFooter />
    </div>
  );
};
