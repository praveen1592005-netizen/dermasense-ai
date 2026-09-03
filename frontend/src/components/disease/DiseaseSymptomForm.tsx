import React from 'react';
import { SymptomProfile, SymptomSeverity, DurationCategory } from '../../types/disease';
import { Card } from '../common/Card';

interface DiseaseSymptomFormProps {
  symptoms: SymptomProfile;
  onChange: (updated: Partial<SymptomProfile>) => void;
}

export const DiseaseSymptomForm: React.FC<DiseaseSymptomFormProps> = ({
  symptoms,
  onChange,
}) => {
  const severityOptions: { value: SymptomSeverity; label: string }[] = [
    { value: 'none', label: 'None' },
    { value: 'mild', label: 'Mild' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'severe', label: 'Severe' },
  ];

  const durationOptions: { value: DurationCategory; label: string }[] = [
    { value: 'under_24h', label: '< 24 Hours' },
    { value: 'several_days', label: 'Several Days' },
    { value: '1_2_weeks', label: '1–2 Weeks' },
    { value: 'several_weeks', label: 'Several Weeks' },
    { value: 'over_a_month', label: '> 1 Month' },
    { value: 'unsure', label: 'Unsure' },
  ];

  const additionalTags = [
    { id: 'scaling', label: 'Scaling / Flaking' },
    { id: 'dryness', label: 'Extreme Dryness' },
    { id: 'crusting', label: 'Crusting / Scabbing' },
    { id: 'blister', label: 'Blister-like Bumps' },
    { id: 'bleeding', label: 'Bleeding on Contact' },
    { id: 'warmth', label: 'Localized Warmth' },
    { id: 'tenderness', label: 'Tenderness to Touch' },
    { id: 'numbness', label: 'Numbness / Tingling' },
    { id: 'color_change', label: 'Noticeable Color Change' },
    { id: 'lesion_growth', label: 'Lesion / Mole Growth' },
  ];

  const toggleAdditionalTag = (tagId: string) => {
    const list = symptoms.additionalSymptoms.includes(tagId)
      ? symptoms.additionalSymptoms.filter((t) => t !== tagId)
      : [...symptoms.additionalSymptoms, tagId];
    onChange({ additionalSymptoms: list });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Step 2: Structured Symptom Questionnaire
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Provide accurate details about physical sensations and symptom duration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Itching Severity */}
        <Card variant="glass" className="p-4 rounded-2xl border-slate-200/80 dark:border-slate-800 space-y-2">
          <label className="text-xs font-bold text-slate-900 dark:text-white block">
            Itching (Pruritus)
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {severityOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ itching: opt.value })}
                className={`py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  symptoms.itching === opt.value
                    ? 'bg-brand-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-darkBg-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Pain / Discomfort Severity */}
        <Card variant="glass" className="p-4 rounded-2xl border-slate-200/80 dark:border-slate-800 space-y-2">
          <label className="text-xs font-bold text-slate-900 dark:text-white block">
            Pain or Discomfort
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {severityOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ pain: opt.value })}
                className={`py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  symptoms.pain === opt.value
                    ? 'bg-brand-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-darkBg-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Redness / Erythema */}
        <Card variant="glass" className="p-4 rounded-2xl border-slate-200/80 dark:border-slate-800 space-y-2">
          <label className="text-xs font-bold text-slate-900 dark:text-white block">
            Redness (Erythema)
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {severityOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ redness: opt.value })}
                className={`py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  symptoms.redness === opt.value
                    ? 'bg-brand-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-darkBg-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Duration */}
        <Card variant="glass" className="p-4 rounded-2xl border-slate-200/80 dark:border-slate-800 space-y-2">
          <label className="text-xs font-bold text-slate-900 dark:text-white block">
            How long has this been present?
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {durationOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ duration: opt.value })}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold text-center transition-all ${
                  symptoms.duration === opt.value
                    ? 'bg-brand-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-darkBg-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Binary Questions Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Swelling */}
        <Card variant="default" className="p-4 rounded-2xl border-slate-200/80 dark:border-slate-800 space-y-2">
          <label className="text-xs font-bold text-slate-900 dark:text-white block">
            Visible Swelling?
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onChange({ swelling: true })}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold ${
                symptoms.swelling
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-100 dark:bg-darkBg-900 text-slate-600 dark:text-slate-300'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => onChange({ swelling: false })}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold ${
                !symptoms.swelling
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-100 dark:bg-darkBg-900 text-slate-600 dark:text-slate-300'
              }`}
            >
              No
            </button>
          </div>
        </Card>

        {/* Discharge */}
        <Card variant="default" className="p-4 rounded-2xl border-slate-200/80 dark:border-slate-800 space-y-2">
          <label className="text-xs font-bold text-slate-900 dark:text-white block">
            Fluid or Discharge?
          </label>
          <div className="flex gap-1.5">
            {['no', 'yes', 'unsure'].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onChange({ discharge: val as any })}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold capitalize ${
                  symptoms.discharge === val
                    ? 'bg-brand-500 text-white'
                    : 'bg-slate-100 dark:bg-darkBg-900 text-slate-600 dark:text-slate-300'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </Card>

        {/* Area Expanding */}
        <Card variant="default" className="p-4 rounded-2xl border-slate-200/80 dark:border-slate-800 space-y-2">
          <label className="text-xs font-bold text-slate-900 dark:text-white block">
            Is the area spreading?
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onChange({ isAreaIncreasing: true })}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold ${
                symptoms.isAreaIncreasing
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-100 dark:bg-darkBg-900 text-slate-600 dark:text-slate-300'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => onChange({ isAreaIncreasing: false })}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold ${
                !symptoms.isAreaIncreasing
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-100 dark:bg-darkBg-900 text-slate-600 dark:text-slate-300'
              }`}
            >
              No
            </button>
          </div>
        </Card>
      </div>

      {/* Additional Visual Symptom Tags */}
      <div className="space-y-3 pt-2">
        <label className="text-xs font-bold text-slate-900 dark:text-white block">
          Additional Observed Characteristics (Optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {additionalTags.map((tag) => {
            const isSelected = symptoms.additionalSymptoms.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleAdditionalTag(tag.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-tealBrand-500/15 border-tealBrand-500 text-tealBrand-700 dark:text-tealBrand-300 font-bold shadow-2xs'
                    : 'bg-slate-50 dark:bg-darkBg-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
