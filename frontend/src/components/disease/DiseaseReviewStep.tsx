import React from 'react';
import { DiseaseImage, SymptomProfile } from '../../types/disease';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Edit3, CheckCircle2, ShieldCheck } from 'lucide-react';

interface DiseaseReviewStepProps {
  images: DiseaseImage[];
  symptoms: SymptomProfile;
  onEditStep: (stepIndex: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const DiseaseReviewStep: React.FC<DiseaseReviewStepProps> = ({
  images,
  symptoms,
  onEditStep,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Step 4: Clinical Review & Verification
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Verify your uploaded photos and symptom profile before starting the AI screening engine.
        </p>
      </div>

      {/* Images Review */}
      <Card variant="glass" className="p-5 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-slate-900 dark:text-white">
            Attached Images ({images.length} photos)
          </span>
          <Button variant="ghost" size="sm" onClick={() => onEditStep(1)} leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
            Edit
          </Button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <div key={img.id} className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0">
              <img src={img.previewUrl} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </Card>

      {/* Symptoms & Locations Review */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="glass" className="p-5 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-900 dark:text-white">
              Primary Symptoms
            </span>
            <Button variant="ghost" size="sm" onClick={() => onEditStep(2)} leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
              Edit
            </Button>
          </div>
          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            <p>• <strong>Itching:</strong> <span className="capitalize">{symptoms.itching}</span></p>
            <p>• <strong>Pain:</strong> <span className="capitalize">{symptoms.pain}</span></p>
            <p>• <strong>Redness:</strong> <span className="capitalize">{symptoms.redness}</span></p>
            <p>• <strong>Duration:</strong> <span className="capitalize">{symptoms.duration.replace('_', ' ')}</span></p>
            <p>• <strong>Discharge:</strong> <span className="capitalize">{symptoms.discharge}</span></p>
          </div>
        </Card>

        <Card variant="glass" className="p-5 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-900 dark:text-white">
              Locations & Progression
            </span>
            <Button variant="ghost" size="sm" onClick={() => onEditStep(3)} leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
              Edit
            </Button>
          </div>
          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            <p>
              • <strong>Locations:</strong>{' '}
              {symptoms.bodyLocations.length > 0
                ? symptoms.bodyLocations.join(', ')
                : 'Not specified'}
            </p>
            <p>• <strong>Timeline:</strong> <span className="capitalize">{symptoms.progression}</span></p>
            {symptoms.exposures.length > 0 && (
              <p>• <strong>Exposures:</strong> {symptoms.exposures.join(', ')}</p>
            )}
          </div>
        </Card>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200/60 dark:border-brand-900/40 text-xs text-brand-900 dark:text-brand-200 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
        <span>
          Information will be processed through client-side data hygiene and the multi-factor category screening pipeline.
        </span>
      </div>
    </div>
  );
};
