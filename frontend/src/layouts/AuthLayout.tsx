import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { MEDICAL_DISCLAIMER_TEXT } from '../utils/constants';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-darkBg-950 text-slate-900 dark:text-slate-100 mesh-gradient-light dark:mesh-gradient-dark transition-colors">
      {/* Top Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Logo size="md" showTagline />
        <div className="flex items-center gap-3">
          <ThemeToggle size="md" />
          <Link
            to="/"
            className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Center Auth Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Footer Info */}
      <footer className="p-4 sm:p-6 text-center text-xs text-slate-500 dark:text-slate-400 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-center gap-1.5 mb-2 font-medium">
          <ShieldCheck className="w-4 h-4 text-tealBrand-500" />
          <span>Protected by DermaSense AI Secure Session Architecture</span>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
          {MEDICAL_DISCLAIMER_TEXT}
        </p>
      </footer>
    </div>
  );
};
