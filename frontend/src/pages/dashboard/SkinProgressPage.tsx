import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Camera,
  Plus,
  Calendar,
  History,
  TrendingUp,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { skinProgressService } from '../../services/skinProgressService';
import { ProgressPhoto, RoutineChangeLog } from '../../types/progress';
import { formatDate } from '../../utils/formatters';

// Reusable Progress Components
import { BeforeAfterSlider } from '../../components/progress/BeforeAfterSlider';
import { ProgressPhotoUploader } from '../../components/progress/ProgressPhotoUploader';
import { SkinObservationTrendCard } from '../../components/progress/SkinObservationTrendCard';
import { RoutineChangeTimeline } from '../../components/progress/RoutineChangeTimeline';
import { ProgressSummaryCard } from '../../components/progress/ProgressSummaryCard';

export const SkinProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showInfo } = useNotification();

  const userId = user?.id || 'usr_guest';
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [logs, setLogs] = useState<RoutineChangeLog[]>([]);
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadProgress = async () => {
      setIsLoading(true);
      try {
        const [photoList, logList] = await Promise.all([
          skinProgressService.getProgressPhotos(userId),
          skinProgressService.getRoutineChangeLogs(userId),
        ]);
        setPhotos(photoList);
        setLogs(logList);
      } finally {
        setIsLoading(false);
      }
    };
    loadProgress();
  }, [userId]);

  const handleUploadPhoto = async (imagePreview: string, notes: string) => {
    const newPhoto = await skinProgressService.addProgressPhoto({
      userId,
      imagePreview,
      date: new Date().toISOString(),
      notes,
      skinType: user?.profile?.skinProfile?.skinType || 'Combination',
      observations: ['Week check-in recorded'],
    });

    const updated = await skinProgressService.getProgressPhotos(userId);
    setPhotos(updated);
    showSuccess('Progress Photo Saved', 'New check-in recorded in your progress gallery.');
  };

  const handleDeletePhoto = async (id: string) => {
    await skinProgressService.deleteProgressPhoto(id);
    const updated = await skinProgressService.getProgressPhotos(userId);
    setPhotos(updated);
    showInfo('Photo Deleted', 'Check-in removed from gallery.');
  };

  const handleAddRoutineLog = async (log: Omit<RoutineChangeLog, 'id'>) => {
    await skinProgressService.addRoutineChangeLog({ ...log, userId });
    const updated = await skinProgressService.getRoutineChangeLogs(userId);
    setLogs(updated);
    showSuccess('Timeline Updated', 'Routine adjustment logged successfully.');
  };

  const sortedPhotos = [...photos].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const beforePhoto = sortedPhotos[0];
  const afterPhoto = sortedPhotos[sortedPhotos.length - 1];

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fadeIn pb-16">
      <PageHeader
        title="Skin Progress & Routine Tracking"
        subtitle="Monitor skin barrier recovery over time with comparative before/after visual check-ins and routine logs."
        actions={
          <Button
            variant="gradient"
            size="sm"
            onClick={() => setUploaderOpen(true)}
            leftIcon={<Camera className="w-4 h-4" />}
          >
            Add Progress Check-In
          </Button>
        }
      />

      {/* Interactive Before / After Comparison Slider */}
      {photos.length >= 2 ? (
        <BeforeAfterSlider beforePhoto={beforePhoto} afterPhoto={afterPhoto} />
      ) : photos.length === 1 ? (
        <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-500" />
              Baseline Progress Photo Recorded
            </h3>
            <span className="text-xs text-slate-400">1 of 2 check-ins</span>
          </div>

          <div className="aspect-[16/9] sm:aspect-[21/9] max-h-[360px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 relative">
            <img
              src={photos[0].imagePreview}
              alt="Baseline skin capture"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl text-white text-xs font-bold">
              Baseline: {formatDate(photos[0].date)}
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Capture another check-in photo in 2–4 weeks to enable the split-screen Before/After interactive slider.
          </p>
        </Card>
      ) : (
        <Card variant="glass" className="p-12 text-center rounded-3xl border-slate-200/80 dark:border-slate-800 max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto shadow-sm">
            <Camera className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Start Your Skin Progress Gallery
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Capture your baseline facial photo to track your skin barrier equilibrium as you apply your routine.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setUploaderOpen(true)}>
            Record First Check-In
          </Button>
        </Card>
      )}

      {/* Progress Photo Gallery */}
      {photos.length > 0 && (
        <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-tealBrand-500" />
                Check-In Gallery ({photos.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Timestamped facial captures stored securely in your private account.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setUploaderOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Photo
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((p) => (
              <div
                key={p.id}
                className="group relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 aspect-[4/3]"
              >
                <img
                  src={p.imagePreview}
                  alt="Progress entry"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-between p-2.5">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(p.id)}
                      className="p-1 rounded-md bg-slate-950/60 text-white/80 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="text-[10px] font-bold text-white/90">
                    {formatDate(p.date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Qualitative Skin Parameter Trends */}
      <SkinObservationTrendCard />

      {/* Routine Modification Diary Timeline */}
      <RoutineChangeTimeline logs={logs} onAddLog={handleAddRoutineLog} />

      {/* Holistic Progress Evaluation & Clinical Safety Notice */}
      <ProgressSummaryCard />

      {/* Upload Check-in Modal */}
      <ProgressPhotoUploader
        isOpen={uploaderOpen}
        onClose={() => setUploaderOpen(false)}
        onUpload={handleUploadPhoto}
      />
    </div>
  );
};
