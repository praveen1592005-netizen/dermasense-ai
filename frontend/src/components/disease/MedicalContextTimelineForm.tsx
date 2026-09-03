import React from 'react';
import {
  SymptomProfile,
  ProgressionTimeline,
  PossibleExposure,
} from '../../types/disease';
import { Card } from '../common/Card';

interface MedicalContextTimelineFormProps {
  symptoms: SymptomProfile;
  onChange: (updated: Partial<SymptomProfile>) => void;
}

export const MedicalContextTimelineForm: React.FC<MedicalContextTimelineFormProps> = ({
  symptoms,
  onChange,
}) => {
  const progressionOptions: { value: ProgressionTimeline; label: string }[] = [
    { value: 'improving', label: 'Improving / Calming' },
    { value: 'stable', label: 'Stable / Unchanged' },
    { value: 'worsening', label: 'Getting Worse / Spreading' },
    { value: 'unsure', label: 'Unsure' },
  ];

  const exposureOptions: { id: PossibleExposure; label: string }[] = [
    { id: 'new_skincare', label: 'New Skincare Product' },
    { id: 'cosmetic', label: 'Makeup / Cosmetic Item' },
    { id: 'detergent', label: 'Laundry Detergent' },
    { id: 'soap', label: 'New Soap / Fragrance' },
    { id: 'sun', label: 'Intense Sun Exposure' },
    { id: 'plant', label: 'Outdoor Plants / Poison Ivy' },
    { id: 'chemical', label: 'Cleaning Chemical / Solvent' },
    { id: 'animal', label: 'Pet / Animal Contact' },
    { id: 'unknown', label: 'None / Unknown' },
  ];

  const toggleExposure = (id: PossibleExposure) => {
    if (id === 'unknown') {
      onChange({ exposures: ['unknown'] });
      return;
    }
    const filtered = symptoms.exposures.filter((e) => e !== 'unknown');
    const list = filtered.includes(id)
      ? filtered.filter((e) => e !== id)
      : [...filtered, id];
    onChange({ exposures: list });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Step 3: Timeline, Triggers & Personal Notes
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Recent product changes, environmental triggers, and progression details.
        </p>
      </div>

      {/* Progression Timeline */}
      <Card variant="glass" className="p-5 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-3">
        <label className="text-xs font-bold text-slate-900 dark:text-white block">
          How has this evolved since you first noticed it?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {progressionOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ progression: opt.value })}
              className={`p-2.5 rounded-xl text-xs font-bold text-center transition-all ${
                symptoms.progression === opt.value
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-darkBg-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Possible Triggers / Exposures (Section 16) */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-900 dark:text-white block">
          Recent Known Exposures or Triggers (Optional)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {exposureOptions.map((exp) => {
            const isSelected = symptoms.exposures.includes(exp.id);
            return (
              <button
                key={exp.id}
                type="button"
                onClick={() => toggleExposure(exp.id)}
                className={`p-3 rounded-2xl text-xs font-medium border text-left transition-all ${
                  isSelected
                    ? 'bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-400 font-bold shadow-2xs'
                    : 'bg-white dark:bg-darkBg-850 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                {exp.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Symptom Description Textarea (Section 13) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-slate-900 dark:text-white">
            Describe what you are experiencing in your own words (Optional)
          </label>
          <span className="text-[11px] text-slate-400">
            {symptoms.description.length} / 500 characters
          </span>
        </div>
        <textarea
          rows={3}
          maxLength={500}
          value={symptoms.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="e.g. Started 3 days ago after applying a new facial sunscreen. Feels hot to the touch and stings when washing..."
          className="w-full p-3.5 rounded-2xl bg-white dark:bg-darkBg-850 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none shadow-xs"
        />
      </div>
    </div>
  );
};
