import React from 'react';
import { BodyLocation } from '../../types/disease';
import { Card } from '../common/Card';

interface AffectedAreaSelectorProps {
  selectedLocations: BodyLocation[];
  onChange: (locations: BodyLocation[]) => void;
}

export const AffectedAreaSelector: React.FC<AffectedAreaSelectorProps> = ({
  selectedLocations,
  onChange,
}) => {
  const bodyParts: { id: BodyLocation; label: string }[] = [
    { id: 'face', label: 'Face / Cheeks' },
    { id: 'scalp', label: 'Scalp / Hairline' },
    { id: 'neck', label: 'Neck' },
    { id: 'chest', label: 'Chest' },
    { id: 'back', label: 'Upper / Lower Back' },
    { id: 'arms', label: 'Arms / Elbows' },
    { id: 'hands', label: 'Hands / Fingers' },
    { id: 'legs', label: 'Legs / Knees' },
    { id: 'feet', label: 'Feet / Toes' },
    { id: 'other', label: 'Other Body Site' },
  ];

  const toggleLocation = (id: BodyLocation) => {
    const list = selectedLocations.includes(id)
      ? selectedLocations.filter((item) => item !== id)
      : [...selectedLocations, id];
    onChange(list);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-slate-900 dark:text-white block">
          Affected Anatomical Location(s) (Select all that apply)
        </label>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Specifying exact bodily distribution helps the AI screening engine provide appropriate context.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {bodyParts.map((part) => {
          const isSelected = selectedLocations.includes(part.id);
          return (
            <button
              key={part.id}
              type="button"
              onClick={() => toggleLocation(part.id)}
              className={`p-3 rounded-2xl text-xs font-bold text-center border transition-all ${
                isSelected
                  ? 'bg-brand-500 text-white border-brand-500 shadow-xs scale-[1.02]'
                  : 'bg-white dark:bg-darkBg-850 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              {part.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
