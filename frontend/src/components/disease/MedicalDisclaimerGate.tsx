import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

interface MedicalDisclaimerGateProps {
  onAccept: () => void;
}

export const MedicalDisclaimerGate: React.FC<MedicalDisclaimerGateProps> = ({ onAccept }) => {
  const navigate = useNavigate();
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <Card variant="glass" className="p-6 sm:p-10 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-6">
        {/* Header Emblem */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-500 to-rose-500 text-white flex items-center justify-center mx-auto shadow-lg">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Skin Disease Analysis & Screening
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            AI-assisted skin condition screening based on an image and your reported symptoms.
          </p>
        </div>

        {/* Informational Guidance Points */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-darkBg-900 border border-slate-200/80 dark:border-slate-800 space-y-3 text-xs text-slate-700 dark:text-slate-300">
          <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] block">
            How this screening works:
          </span>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>Upload clear, well-lit photos of the affected skin area (up to 3 images).</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>Complete the structured symptom and timeline questionnaire.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>AI screening will identify potential condition categories and safety urgency levels.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>Discover verified local dermatologists for in-person medical diagnosis.</span>
            </div>
          </div>
        </div>

        {/* Mandatory Medical Disclaimer (Section 3) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-3 text-amber-900 dark:text-amber-200 text-xs">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>Important Medical Disclaimer</span>
          </div>
          <p className="leading-relaxed text-[11px] text-amber-800/90 dark:text-amber-300/90">
            DermaSense AI provides AI-assisted informational screening and does <strong>not</strong> provide a definitive medical diagnosis. Results may be inaccurate or incomplete. A qualified healthcare professional must evaluate your skin condition before starting any treatment.
          </p>

          <label className="flex items-start gap-2.5 pt-2 border-t border-amber-200/60 dark:border-amber-900/40 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-brand-600 focus:ring-brand-500 border-amber-300 dark:border-amber-800"
            />
            <span className="font-semibold text-xs text-amber-950 dark:text-amber-100">
              I understand that this screening is informational and not a medical diagnosis.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Button
            variant="secondary"
            size="md"
            className="w-full sm:w-auto"
            onClick={() => navigate('/dashboard')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Dashboard
          </Button>

          <Button
            variant="gradient"
            size="md"
            className="w-full sm:w-auto"
            disabled={!acknowledged}
            onClick={onAccept}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Start Disease Screening
          </Button>
        </div>
      </Card>
    </div>
  );
};
