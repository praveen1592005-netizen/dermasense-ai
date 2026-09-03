import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  LogIn,
  Phone,
  KeyRound,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Smartphone,
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
  const { signIn, signInWithGoogle, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();

  // Auth Mode: 'email' | 'phone'
  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');

  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Phone & OTP state
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [activeOtpCode, setActiveOtpCode] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Common state
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string; phone?: string; otp?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Timer countdown for resend OTP
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const fillDemoEmail = () => {
    setAuthMode('email');
    setEmail('demo@dermasense.ai');
    setPassword('Demo1234!');
    setErrors({});
  };

  const fillDemoPhone = () => {
    setAuthMode('phone');
    setCountryCode('+1');
    setPhoneNumber('5552345678');
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

  // Phone: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = phoneNumber.trim();
    if (!cleanNum || cleanNum.length < 7) {
      setErrors({ phone: 'Please enter a valid mobile number (at least 7 digits).' });
      return;
    }

    const fullPhone = `${countryCode} ${cleanNum}`;
    setErrors({});
    setIsLoading(true);

    try {
      const res = await sendPhoneOtp(fullPhone);
      setOtpSent(true);
      setActiveOtpCode(res.otp);
      setCountdown(30);
      showInfo(`OTP Sent!`, `Your DermaSense verification code is: ${res.otp}`);
    } catch (err: any) {
      setErrors({ phone: err.message || 'Failed to send OTP.' });
      showError('OTP Error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Phone: Verify OTP & Enter
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length < 4) {
      setErrors({ otp: 'Please enter the verification code received.' });
      return;
    }

    const fullPhone = `${countryCode} ${phoneNumber.trim()}`;
    setErrors({});
    setIsLoading(true);

    try {
      const user = await verifyPhoneOtp(fullPhone, otp.trim(), rememberMe);
      showSuccess(`Phone Verified!`, `Welcome to DermaSense AI.`);
      if (!user.profile?.onboardingCompleted) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setErrors({ otp: err.message || 'Invalid or expired OTP code.' });
      showError('Verification Failed', err.message);
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
          or sign in with
        </span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Auth Mode Tabs (Email vs Mobile Phone) */}
      <div className="p-1 rounded-2xl bg-slate-100 dark:bg-darkBg-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-1 mb-6">
        <button
          type="button"
          onClick={() => {
            setAuthMode('email');
            setErrors({});
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
            authMode === 'email'
              ? 'bg-white dark:bg-darkBg-800 text-brand-600 dark:text-brand-400 shadow-xs border border-slate-200/60 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Email & Password</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAuthMode('phone');
            setErrors({});
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
            authMode === 'phone'
              ? 'bg-white dark:bg-darkBg-800 text-brand-600 dark:text-brand-400 shadow-xs border border-slate-200/60 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile Number (OTP)</span>
        </button>
      </div>

      {/* Quick Demo Helper Banner */}
      <div className="mb-5 p-3 rounded-2xl bg-brand-500/10 dark:bg-brand-500/15 border border-brand-500/20 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 text-brand-500 flex-shrink-0" />
          <p className="text-xs text-brand-800 dark:text-brand-300 font-medium truncate">
            {authMode === 'email' ? (
              <>Demo: <span className="font-mono text-[11px]">demo@dermasense.ai</span></>
            ) : (
              <>Demo Mobile: <span className="font-mono text-[11px]">+1 555-234-5678</span></>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={authMode === 'email' ? fillDemoEmail : fillDemoPhone}
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
      {authMode === 'email' && (
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
            Sign In with Email
          </Button>
        </form>
      )}

      {/* MOBILE NUMBER & OTP TAB CONTENT */}
      {authMode === 'phone' && (
        <div className="space-y-4 animate-fadeIn">
          {!otpSent ? (
            /* STEP 1: Enter Phone Number */
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide">
                  Mobile Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="w-28 flex-shrink-0">
                    <Select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      options={[
                        { value: '+1', label: '🇺🇸 +1 (US/CA)' },
                        { value: '+91', label: '🇮🇳 +91 (IN)' },
                        { value: '+44', label: '🇬🇧 +44 (UK)' },
                        { value: '+61', label: '🇦🇺 +61 (AU)' },
                        { value: '+49', label: '🇩🇪 +49 (DE)' },
                        { value: '+33', label: '🇫🇷 +33 (FR)' },
                        { value: '+81', label: '🇯🇵 +81 (JP)' },
                      ]}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="tel"
                      placeholder="e.g. 555-019-2834"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      error={errors.phone}
                      leftIcon={<Phone className="w-4 h-4" />}
                      autoComplete="tel-national"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-darkBg-900"
                  />
                  <span>Remember session</span>
                </label>
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full justify-center mt-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Send Verification OTP
              </Button>
            </form>
          ) : (
            /* STEP 2: Enter & Verify OTP */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-darkBg-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-400">Code sent to:</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {countryCode} {phoneNumber}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp('');
                  }}
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Change
                </button>
              </div>

              {activeOtpCode && (
                <div className="p-3 rounded-xl bg-tealBrand-500/10 border border-tealBrand-500/30 text-xs text-tealBrand-700 dark:text-tealBrand-300 flex items-center justify-between">
                  <span>Simulated SMS Code:</span>
                  <span className="font-mono font-bold text-sm bg-white dark:bg-darkBg-800 px-2 py-0.5 rounded border border-tealBrand-500/30">
                    {activeOtpCode}
                  </span>
                </div>
              )}

              <Input
                label="Enter 6-Digit OTP Code"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                error={errors.otp}
                leftIcon={<KeyRound className="w-4 h-4" />}
                className="text-center font-mono text-base tracking-widest"
                disabled={isLoading}
                autoFocus
              />

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Didn't receive code?</span>
                {countdown > 0 ? (
                  <span className="text-slate-400 font-medium">Resend in {countdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isLoading}
                    className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full justify-center mt-2"
                isLoading={isLoading}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Verify & Enter Workspace
              </Button>
            </form>
          )}
        </div>
      )}

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
