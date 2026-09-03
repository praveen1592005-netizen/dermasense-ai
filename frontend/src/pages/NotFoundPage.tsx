import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Logo } from '../components/common/Logo';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-darkBg-950 text-slate-900 dark:text-slate-100 text-center mesh-gradient-light dark:mesh-gradient-dark">
      <Logo size="lg" showTagline clickable={false} className="mb-8" />

      <div className="max-w-md space-y-4">
        <span className="text-6xl sm:text-7xl font-extrabold text-brand-500 font-mono">
          404
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          The requested clinical or workspace URL does not exist or has been moved.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/">
            <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
              Back to Home
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
