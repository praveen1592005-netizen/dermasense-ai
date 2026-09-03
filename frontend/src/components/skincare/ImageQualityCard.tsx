import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, Sun, Sparkles } from 'lucide-react';
import { ImageQualityReport } from '../../types/analysis';
import { Badge } from '../common/Badge';

interface ImageQualityCardProps {
  report: ImageQualityReport | null;
}

export const ImageQualityCard: React.FC<ImageQualityCardProps> = ({ report }) => {
  if (!report) return null;

  const isSuccess = report.status === 'optimal' || report.status === 'acceptable';
  const isWarning = report.status === 'low_resolution';
  const isError = report.status === 'too_dark' || report.status === 'too_bright' || report.status === 'invalid';

  return (
    <div
      className={`p-4 rounded-2xl border transition-all text-xs ${
        isSuccess
          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
          : isWarning
          ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
          : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
      }`}
    >
      <div className="flex items-start gap-3">
        {isSuccess ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
        ) : isWarning ? (
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        ) : (
          <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
        )}

        <div className="flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-bold text-xs sm:text-sm">
              Image Quality Check: {isSuccess ? 'Verified Suitable' : isWarning ? 'Notice' : 'Action Required'}
            </h4>
            <div className="flex items-center gap-1.5">
              <Badge
                variant={isSuccess ? 'success' : isWarning ? 'warning' : 'danger'}
                size="sm"
              >
                {report.resolution.width > 0 ? `${report.resolution.width}x${report.resolution.height} px` : 'Resolution'}
              </Badge>
              <Badge variant="neutral" size="sm">
                Brightness: {report.brightnessScore}/255
              </Badge>
            </div>
          </div>

          <p className="leading-relaxed text-xs opacity-90">
            {report.message}
          </p>

          <p className="text-[10px] opacity-75 italic pt-1 border-t border-current/10">
            Note: This image-quality check evaluates basic resolution and illumination; it does not substitute for clinical medical evaluation.
          </p>
        </div>
      </div>
    </div>
  );
};
