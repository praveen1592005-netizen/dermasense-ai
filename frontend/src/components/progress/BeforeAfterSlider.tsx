import React, { useState } from 'react';
import { Sparkles, Calendar, Split, Columns, ZoomIn } from 'lucide-react';
import { ProgressPhoto } from '../../types/progress';
import { formatDate } from '../../utils/formatters';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface BeforeAfterSliderProps {
  beforePhoto?: ProgressPhoto;
  afterPhoto?: ProgressPhoto;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforePhoto,
  afterPhoto,
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [viewMode, setViewMode] = useState<'slider' | 'sideBySide'>('slider');

  if (!beforePhoto && !afterPhoto) {
    return null;
  }

  const beforeImg = beforePhoto?.imagePreview || afterPhoto?.imagePreview;
  const afterImg = afterPhoto?.imagePreview || beforePhoto?.imagePreview;

  return (
    <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-500" />
            Visual Skin Progress Comparison
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare past facial skin captures to observe hydration and barrier equilibrium over time.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="p-1 rounded-2xl bg-slate-100 dark:bg-darkBg-900 flex items-center gap-1 border border-slate-200/60 dark:border-slate-800 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'slider'
                ? 'bg-white dark:bg-darkBg-800 text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>Interactive Slider</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('sideBySide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'sideBySide'
                ? 'bg-white dark:bg-darkBg-800 text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>
        </div>
      </div>

      {viewMode === 'slider' ? (
        /* Split-Screen Slider View */
        <div className="relative aspect-[16/9] sm:aspect-[21/9] max-h-[420px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 select-none shadow-inner">
          {/* Current / After Image (Full background) */}
          <img
            src={afterImg}
            alt="Current skin check-in"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Previous / Before Image (Clipped) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <img
              src={beforeImg}
              alt="Baseline skin photo"
              className="absolute inset-0 w-full h-full object-cover max-w-none"
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          {/* Slider Divider Line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)] cursor-ew-resize flex items-center justify-center pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="w-8 h-8 rounded-full bg-white text-slate-900 shadow-md flex items-center justify-center font-bold text-xs">
              ↔
            </div>
          </div>

          {/* Invisible Range Input for Dragging */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-10"
          />

          {/* Left / Right Date Badges */}
          <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl text-white text-xs font-bold border border-white/20">
            Baseline: {beforePhoto ? formatDate(beforePhoto.date) : 'Baseline'}
          </div>

          <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl text-white text-xs font-bold border border-white/20">
            Current: {afterPhoto ? formatDate(afterPhoto.date) : 'Current'}
          </div>
        </div>
      ) : (
        /* Side-by-Side View */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 relative">
              <img
                src={beforeImg}
                alt="Baseline Skin"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-xs px-2.5 py-1 rounded-lg text-white text-xs font-bold">
                Baseline ({beforePhoto ? formatDate(beforePhoto.date) : 'Start'})
              </div>
            </div>
            {beforePhoto?.notes && (
              <p className="text-xs text-slate-500 italic px-1">"{beforePhoto.notes}"</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 relative">
              <img
                src={afterImg}
                alt="Current Skin"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-xs px-2.5 py-1 rounded-lg text-white text-xs font-bold">
                Current ({afterPhoto ? formatDate(afterPhoto.date) : 'Latest'})
              </div>
            </div>
            {afterPhoto?.notes && (
              <p className="text-xs text-slate-500 italic px-1">"{afterPhoto.notes}"</p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
