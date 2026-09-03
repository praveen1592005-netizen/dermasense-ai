import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { PasswordStrengthMeter } from '../../components/auth/PasswordStrengthMeter';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { validateEmail, calculatePasswordStrength } from '../../utils/validation';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setErrors({});
    try {
      const user = await signInWithGoogle({
        name: 'Dr. Alex Morgan',
        email: 'alex.morgan@gmail.com',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      });
      showSuccess(`Account Created with Google!`, `Welcome to DermaSense AI, ${user.fullName}.`);
      navigate('/onboarding', { replace: true });
    } catch (err: any) {
      setErrors({ general: err.message || 'Google registration failed.' });
      showError('Google Registration Failed', err.message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else {
      const strength = calculatePasswordStrength(password);
      if (strength.score < 2) {
        newErrors.password = 'Password is too weak. Please include letters, numbers, and symbols.';
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!acceptTerms) {
      newErrors.acceptTerms = 'You must accept the Terms of Service and Medical Disclaimer to continue.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const user = await signUp({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        acceptTerms,
      });

      showSuccess('Account Created!', `Welcome to DermaSense AI, ${user.fullName}.`);
      navigate('/onboarding', { replace: true });
    } catch (err: any) {
      const message = err.message || 'Registration failed. Please try again.';
      setErrors({ general: message });
      showError('Registration Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      variant="glass"
      className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-2xl animate-scaleUp"
    >
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Create Account
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Join DermaSense AI for personalized skin health assistance
        </p>
      </div>

      {/* Google Sign Up Button */}
      <button
        type="button"
        onClick={handleGoogleSignUp}
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
        <span>Sign Up with Google</span>
      </button>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          or register with email
        </span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
      </div>

      {errors.general && (
        <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{errors.general}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="e.g. Dr. Sarah Jenkins"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
          leftIcon={<User className="w-4 h-4" />}
          autoComplete="name"
          disabled={isLoading}
        />

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
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            isPassword
            leftIcon={<Lock className="w-4 h-4" />}
            autoComplete="new-password"
            disabled={isLoading}
          />
          <PasswordStrengthMeter password={password} />
        </div>

        <Input
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          isPassword
          leftIcon={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
          disabled={isLoading}
        />

        {/* Terms and Medical Disclaimer Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-brand-600 focus:ring-brand-500 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-darkBg-900 flex-shrink-0"
            />
            <span>
              I agree to the{' '}
              <span className="font-semibold text-brand-600 dark:text-brand-400">
                Terms of Service
              </span>{' '}
              and acknowledge that DermaSense AI provides informational guidance and does not replace emergency medical care.
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="text-xs text-rose-500 font-medium mt-1.5">{errors.acceptTerms}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          className="w-full justify-center mt-3"
          isLoading={isLoading}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Create Account
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-600 dark:text-slate-400">
        Already have an account?{' '}
        <Link
          to="/signin"
          className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
        >
          Sign In
        </Link>
      </div>
    </Card>
  );
};
