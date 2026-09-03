import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Cpu,
  ArrowRight,
} from 'lucide-react';

interface AIServiceNoticeProps {
  service: 'skincare' | 'disease';
  onContinue?: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const DISEASE_API_URL = import.meta.env.VITE_DISEASE_API_URL || API_BASE_URL;

/**
 * Honest banner shown when AI model API is not configured.
 * Replaces fake AI "predictions" with transparent integration state.
 */
export const AIServiceNotice: React.FC<AIServiceNoticeProps> = ({ service, onContinue }) => {
  const isConnected = service === 'disease'
    ? Boolean(DISEASE_API_URL)
    : Boolean(API_BASE_URL);

  if (isConnected) return null;

  return (
    <div className="p-5 rounded-3xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex-shrink-0">
          <Cpu className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-1">
            AI Model Not Connected
          </h3>
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            {service === 'disease'
              ? 'The skin disease AI model is not yet connected. When you submit an image, DermaSense AI will collect your symptom profile and image for future AI inference, but cannot generate a real disease prediction until the AI API is configured.'
              : 'The skincare AI model is not yet connected. Analysis will produce personalized guidance based on your self-reported skin type and concerns, but will not include actual image-based AI inference until the AI API is configured.'}
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-darkBg-900 border border-amber-100 dark:border-amber-900/30 space-y-2.5">
        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          To enable real AI analysis, configure:
        </p>
        {service === 'disease' ? (
          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-start gap-2">
              <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono flex-shrink-0">VITE_DISEASE_API_URL</code>
              <span>Disease classification model endpoint (e.g. FastAPI + EfficientNet/ResNet)</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono flex-shrink-0">POST /predict</code>
              <span>Should accept multipart/form-data with <code>image</code> field. Returns JSON with <code>class_index</code>, <code>class_name</code>, <code>confidence</code></span>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-start gap-2">
              <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono flex-shrink-0">VITE_API_BASE_URL</code>
              <span>Skincare AI backend endpoint</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono flex-shrink-0">POST /api/v1/skincare/analyze</code>
              <span>Accepts image + metadata. Returns skin_type, confidence, observations, routines</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-darkBg-900 border border-slate-200 dark:border-slate-800">
        <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          You can still proceed. Your image and symptom data will be captured and saved. Results will clearly
          indicate whether they are from the AI model or from self-reported data.
        </p>
      </div>

      {onContinue && (
        <button
          type="button"
          onClick={onContinue}
          className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
        >
          Continue with self-reported analysis
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
