import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  LogIn,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { validateEmail } from '../../utils/validation';

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithGoogle } = useAuth();
  const { showSuccess, showError } = useNotification();

  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Common state
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const fillDemoEmail = () => {
    setEmail('demo@dermasense.ai');
    setPassword('Demo1234!');
    setErrors({});
  };

  // Google OAuth Login
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrors({});
    try {
      const user = await signInWithGoogle({
        name: 'Dr. Alex Morgan',
        email: 'alex.morgan@gmail.com',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      });
      showSuccess(`Signed in with Google!`, `Welcome, ${user.fullName}.`);
      if (!user.profile?.onboardingCompleted) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      const message = err.message || 'Google sign-in failed.';
      setErrors({ general: message });
      showError('Google Sign-In Error', message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Email & Password Submit
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const user = await signIn({
        email: email.trim(),
        password,
        rememberMe,
      });

      showSuccess(`Welcome back, ${user.fullName}!`, 'You have successfully signed in.');
      if (!user.profile?.onboardingCompleted) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      const message = err.message || 'Authentication failed. Please check your credentials.';
      setErrors({ general: message });
      showError('Sign In Failed', message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Card
      variant="glass"
      className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-2xl animate-scaleUp"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Sign In
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Access your personalized skin-health workspace
        </p>
      </div>

      {/* Google Login Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-darkBg-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-darkBg-800 text-slate-800 dark:text-slate-100 font-semibold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-60"
      >
        {isGoogleLoading ? (
          <RefreshCw className="w-4 h-4 animate-spin text-brand-500" />
        ) : (
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>Continue with Google</span>
      </button>


      {/* Or Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          or sign in with email
        </span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Quick Demo Helper Banner */}
      <div className="mb-5 p-3 rounded-2xl bg-brand-500/10 dark:bg-brand-500/15 border border-brand-500/20 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 text-brand-500 flex-shrink-0" />
          <p className="text-xs text-brand-800 dark:text-brand-300 font-medium truncate">
            Demo: <span className="font-mono text-[11px]">demo@dermasense.ai</span>
          </p>
        </div>
        <button
          type="button"
          onClick={fillDemoEmail}
          className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex-shrink-0 bg-white/80 dark:bg-darkBg-800 px-2.5 py-1 rounded-lg border border-brand-500/20 shadow-xs"
        >
          Fill Demo
        </button>
      </div>

      {errors.general && (
        <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{errors.general}</span>
        </div>
      )}

      {/* EMAIL & PASSWORD TAB CONTENT */}
        <form onSubmit={handleEmailSubmit} className="space-y-4 animate-fadeIn">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            leftIcon={<Mail className="w-4 h-4" />}
            autoComplete="email"
            disabled={isLoading}
          />

          <div>
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              isPassword
              leftIcon={<Lock className="w-4 h-4" />}
              autoComplete="current-password"
              disabled={isLoading}
            />

            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-darkBg-900"
                />
                <span>Remember session</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-full justify-center mt-2"
            isLoading={isLoading}
            leftIcon={<LogIn className="w-4 h-4" />}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

      {/* Footer Link */}
      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-600 dark:text-slate-400">
        Don't have an account?{' '}
        <Link
          to="/signup"
          className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
        >
          Create an Account
        </Link>
      </div>
    </Card>
  );
};
