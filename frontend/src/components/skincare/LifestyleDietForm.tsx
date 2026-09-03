import React from 'react';
import { Droplets, Moon, Activity, Sun, Heart, Utensils } from 'lucide-react';
import { Select } from '../common/Select';
import { LifestyleDietData } from '../../types/analysis';

interface LifestyleDietFormProps {
  data: LifestyleDietData;
  onChange: (updated: LifestyleDietData) => void;
}

export const LifestyleDietForm: React.FC<LifestyleDietFormProps> = ({
  data,
  onChange,
}) => {
  const update = (field: keyof LifestyleDietData, value: any) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
          Lifestyle & Dietary Habits
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Lifestyle factors significantly influence hydration, sebum production, and recovery rates.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Select
          label="Daily Water Intake"
          value={data.waterIntakeLiters || '2.0'}
          onChange={(e) => update('waterIntakeLiters', e.target.value)}
          options={[
            { value: '1.0', label: '💧 Less than 1.5 L / day' },
            { value: '2.0', label: '💧 1.5 – 2.5 L / day' },
            { value: '3.0', label: '💧 More than 2.5 L / day' },
          ]}
        />

        <Select
          label="Average Sleep"
          value={data.sleepHours || '7-8'}
          onChange={(e) => update('sleepHours', e.target.value)}
          options={[
            { value: '<6', label: '🌙 Less than 6 hours' },
            { value: '7-8', label: '🌙 7 to 8 hours' },
            { value: '9+', label: '🌙 9+ hours' },
          ]}
        />

        <Select
          label="Physical Exercise"
          value={data.exerciseFrequency || '3-5 days/week'}
          onChange={(e) => update('exerciseFrequency', e.target.value)}
          options={[
            { value: 'None', label: '🏃 Rarely / None' },
            { value: '1-2 days/week', label: '🏃 1-2 days a week' },
            { value: '3-5 days/week', label: '🏃 3-5 days a week' },
            { value: 'Daily', label: '🏃 Daily' },
          ]}
        />

        <Select
          label="Sun Exposure Level"
          value={data.sunExposure || 'Moderate'}
          onChange={(e) => update('sunExposure', e.target.value)}
          options={[
            { value: 'Low', label: '☀️ Low (Mostly indoors)' },
            { value: 'Moderate', label: '☀️ Moderate (Commute / outdoors)' },
            { value: 'High', label: '☀️ High (Frequent outdoor work)' },
          ]}
        />

        <Select
          label="Perceived Stress"
          value={data.stressLevel || 'Moderate'}
          onChange={(e) => update('stressLevel', e.target.value)}
          options={[
            { value: 'Low', label: '🧘 Low / Relaxed' },
            { value: 'Moderate', label: '⚡ Moderate' },
            { value: 'High', label: '🔥 High / Demanding' },
          ]}
        />

        <Select
          label="Dietary Pattern"
          value={data.dietType || 'Mixed'}
          onChange={(e) => update('dietType', e.target.value)}
          options={[
            { value: 'Vegetarian', label: '🥗 Vegetarian' },
            { value: 'Non-vegetarian', label: '🍗 Non-vegetarian' },
            { value: 'Vegan', label: '🌱 Vegan' },
            { value: 'Mixed', label: '🍽️ Mixed / Flexitarian' },
            { value: 'Other', label: '✨ Other' },
          ]}
        />
      </div>
    </div>
  );
};
