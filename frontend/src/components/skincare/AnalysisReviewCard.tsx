import React from 'react';
import {
  Camera,
  ListFilter,
  Sparkles,
  Edit2,
  CheckCircle2,
  Droplets,
  Sun,
  Utensils,
  Moon,
  ArrowRight,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { SkincareAnalysisInput } from '../../types/analysis';

interface AnalysisReviewCardProps {
  formData: SkincareAnalysisInput;
  onEditStep: (step: number) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export const AnalysisReviewCard: React.FC<AnalysisReviewCardProps> = ({
  formData,
  onEditStep,
  onSubmit,
  isLoading,
}) => {
  const { imagePreview, skinType, primaryConcerns, structuredRoutine, lifestyleDiet } = formData;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Review Your Skincare Intake
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Please verify your facial photo and parameters before initiating AI processing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Image Snapshot (4 cols) */}
        <div className="md:col-span-4 space-y-3">
          <div className="p-4 rounded-3xl bg-white dark:bg-darkBg-850 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-brand-500" />
                Facial Photo
              </span>
              <button
                type="button"
                onClick={() => onEditStep(1)}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>Change</span>
              </button>
            </div>

            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 relative">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Captured Skin"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-slate-500">
                  No Image Selected
                </div>
              )}
            </div>

            {formData.imageQuality && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Quality Status:</span>
                <Badge variant="success" size="sm">
                  Suitable
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Skin, Routine, Lifestyle Summaries (8 cols) */}
        <div className="md:col-span-8 space-y-4">
          {/* Skin Type & Concerns */}
          <div className="p-5 rounded-3xl bg-white dark:bg-darkBg-850 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                Skin Type & Primary Focus
              </span>
              <button
                type="button"
                onClick={() => onEditStep(2)}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Stated Skin Type:</span>
              <span className="font-bold text-slate-900 dark:text-white capitalize">
                {skinType || 'Combination'}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block mb-1.5">Primary Concerns:</span>
              <div className="flex flex-wrap gap-1.5">
                {primaryConcerns.map((c) => (
                  <Badge key={c} variant="brand" size="sm">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Current Routine */}
          <div className="p-5 rounded-3xl bg-white dark:bg-darkBg-850 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-tealBrand-500" />
                Current Regimen
              </span>
              <button
                type="button"
                onClick={() => onEditStep(2)}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            {structuredRoutine.hasNoRoutine ? (
              <p className="text-slate-500 italic">No existing skincare routine reported.</p>
            ) : (
              <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                <p>
                  <strong>Cleanser:</strong> {structuredRoutine.cleanser.productName || 'None'} ({structuredRoutine.cleanser.frequency})
                </p>
                <p>
                  <strong>Moisturizer:</strong> {structuredRoutine.moisturizer.productName || 'None'} ({structuredRoutine.moisturizer.frequency})
                </p>
                <p>
                  <strong>Sunscreen:</strong> {structuredRoutine.sunscreen.productName || 'None'} ({structuredRoutine.sunscreen.frequency})
                </p>
              </div>
            )}
          </div>

          {/* Lifestyle & Diet */}
          <div className="p-5 rounded-3xl bg-white dark:bg-darkBg-850 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-amber-500" />
                Lifestyle & Diet
              </span>
              <button
                type="button"
                onClick={() => onEditStep(2)}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-600 dark:text-slate-300">
              <span>💧 Water: {lifestyleDiet.waterIntakeLiters || '2.0'} L</span>
              <span>🌙 Sleep: {lifestyleDiet.sleepHours || '7-8'} hrs</span>
              <span>☀️ Sun: {lifestyleDiet.sunExposure || 'Moderate'}</span>
              <span>🧘 Stress: {lifestyleDiet.stressLevel || 'Moderate'}</span>
              <span>🥗 Diet: {lifestyleDiet.dietType || 'Mixed'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Start AI Analysis Button */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        <Button
          type="button"
          variant="gradient"
          size="lg"
          onClick={onSubmit}
          isLoading={isLoading}
          rightIcon={<Sparkles className="w-4 h-4" />}
        >
          Start AI Skincare Analysis
        </Button>
      </div>
    </div>
  );
};
