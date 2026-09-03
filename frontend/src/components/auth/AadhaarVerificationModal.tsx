import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  X,
  Lock,
  Smartphone,
  ChevronLeft,
  Info,
} from 'lucide-react';
import { identityService } from '../../services/identityService';
import { StartAadhaarResponse } from '../../types/identity';
import { Button } from '../common/Button';

export interface AadhaarVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onSkip?: () => void;
  userId: string;
  isMandatoryForAction?: boolean;
  actionName?: string; // e.g. "Doctor Consultation Booking", "Payment", "Medical Report"
}

type ModalStep = 'enter_aadhaar' | 'enter_otp' | 'success';

export const AadhaarVerificationModal: React.FC<AadhaarVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSkip,
  userId,
  isMandatoryForAction = false,
  actionName,
}) => {
  const [step, setStep] = useState<ModalStep>('enter_aadhaar');
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [activeTxn, setActiveTxn] = useState<StartAadhaarResponse | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [maskedPreview, setMaskedPreview] = useState<string>('');

  const aadhaarInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Focus input when step changes
  useEffect(() => {
    if (isOpen) {
      if (step === 'enter_aadhaar') {
        setTimeout(() => aadhaarInputRef.current?.focus(), 150);
      } else if (step === 'enter_otp') {
        setTimeout(() => otpInputRef.current?.focus(), 150);
      }
    }
  }, [isOpen, step]);

  // Resend countdown timer
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
    setAadhaarInput(identityService.formatAadhaarDisplay(raw));
    setErrorMsg(null);
  };

  const handleStartVerification = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const clean = aadhaarInput.replace(/\s+/g, '');
    const validation = identityService.validateAadhaar(clean);
    if (!validation.isValid) {
      setErrorMsg(validation.error || 'Please enter a valid 12-digit Aadhaar number.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await identityService.startVerification(clean, userId);
      if (response.success && response.txn_id) {
        setActiveTxn(response);
        setMaskedPreview(response.masked_aadhaar || identityService.maskAadhaarNumber(clean));
        setCountdown(response.resend_cooldown_seconds || 30);
        setStep('enter_otp');
      } else {
        setErrorMsg(response.message || 'Failed to initiate verification. Please check your Aadhaar number.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification service temporarily unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeTxn?.txn_id) return;
    setErrorMsg(null);

    const cleanOtp = otpInput.trim().replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setErrorMsg('Please enter a 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await identityService.verifyOtp(activeTxn.txn_id, cleanOtp, userId);
      if (response.success && response.is_verified) {
        setStep('success');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1800);
      } else {
        setErrorMsg(response.message || 'Incorrect verification code. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!activeTxn?.txn_id || countdown > 0 || isLoading) return;
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const response = await identityService.resendOtp(activeTxn.txn_id, userId);
      if (response.success) {
        setCountdown(response.resend_cooldown_seconds || 30);
        setOtpInput('');
        if (response.sandbox_hint) {
          setActiveTxn((prev) => (prev ? { ...prev, sandbox_hint: response.sandbox_hint } : prev));
        }
      } else {
        setErrorMsg(response.message || 'Unable to resend code at this time.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    identityService.skipForSession(userId);
    onSkip?.();
    onClose();
  };

  const handleChangeNumber = () => {
    setStep('enter_aadhaar');
    setOtpInput('');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg bg-white dark:bg-darkBg-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-scaleIn transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                {step === 'enter_otp'
                  ? 'Verify Your Identity'
                  : step === 'success'
                  ? 'Verification Complete'
                  : 'Complete Your Identity Verification'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {step === 'enter_otp' ? 'Enter 6-digit OTP code' : 'Aadhaar-Linked Identity Protection'}
              </p>
            </div>
          </div>

          {!isMandatoryForAction && step !== 'success' && (
            <button
              onClick={handleSkip}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-darkBg-800 transition-colors"
              aria-label="Skip"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Action-Specific Notification Banner if triggered by sensitive feature */}
        {isMandatoryForAction && actionName && step !== 'success' && (
          <div className="px-6 py-2.5 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-900/40 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
            <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>
              Identity verification is required before proceeding with <strong>{actionName}</strong>.
            </span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {/* ── STEP 1: Enter Aadhaar ── */}
          {step === 'enter_aadhaar' && (
            <form onSubmit={handleStartVerification} className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                To protect your account and sensitive health information, please verify your Aadhaar-linked identity.
              </p>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Aadhaar Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    ref={aadhaarInputRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={aadhaarInput}
                    onChange={handleAadhaarChange}
                    placeholder="XXXX XXXX XXXX"
                    maxLength={14} // 12 digits + 2 spaces
                    className="w-full text-base sm:text-lg font-mono tracking-wider px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-darkBg-850 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-slate-400">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>{aadhaarInput.replace(/\s/g, '').length}/12</span>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Privacy Notice */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-darkBg-850 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-tealBrand-500 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Privacy First:</strong> Your raw Aadhaar number is verified securely via encrypted OTP and is <strong>never stored</strong> or shared with AI models.
                </span>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-2">
                {!isMandatoryForAction && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    className="flex-1"
                    onClick={handleSkip}
                  >
                    Skip for Now
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="gradient"
                  size="md"
                  className={isMandatoryForAction ? 'w-full' : 'flex-1'}
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Send OTP
                </Button>
              </div>
            </form>
          )}

          {/* ── STEP 2: Enter OTP ── */}
          {step === 'enter_otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-tealBrand-50 dark:bg-tealBrand-950/20 border border-tealBrand-200/60 dark:border-tealBrand-900/40 text-xs text-tealBrand-900 dark:text-tealBrand-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-tealBrand-600 dark:text-tealBrand-400" />
                  <span>
                    Code sent to Aadhaar ({maskedPreview})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleChangeNumber}
                  className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Change
                </button>
              </div>

              {/* Sandbox code hint for smooth local test preview */}
              {activeTxn?.sandbox_hint && (
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300 font-mono">
                  💡 {activeTxn.sandbox_hint}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Enter 6-Digit OTP Code <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otpInput}
                    onChange={(e) => {
                      setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setErrorMsg(null);
                    }}
                    placeholder="• • • • • •"
                    maxLength={6}
                    className="w-full text-center text-2xl font-mono tracking-widest px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-darkBg-850 text-slate-900 dark:text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Resend OTP & Countdown */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <button
                  type="button"
                  onClick={handleChangeNumber}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Change Number
                </button>

                {countdown > 0 ? (
                  <span className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                    <Clock className="w-3 h-3" />
                    Resend code in {countdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Resend OTP
                  </button>
                )}
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-2">
                {!isMandatoryForAction && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    className="flex-1"
                    onClick={handleSkip}
                  >
                    Skip for Now
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="gradient"
                  size="md"
                  className={isMandatoryForAction ? 'w-full' : 'flex-1'}
                  isLoading={isLoading}
                  disabled={otpInput.length !== 6}
                >
                  Verify OTP
                </Button>
              </div>
            </form>
          )}

          {/* ── STEP 3: Success ── */}
          {step === 'success' && (
            <div className="text-center py-6 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-50 dark:ring-emerald-950/20">
                <CheckCircle2 className="w-10 h-10 animate-scaleIn" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Identity Verification Successful ✓
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your identity has been verified ({maskedPreview}). Redirecting to your dashboard...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
