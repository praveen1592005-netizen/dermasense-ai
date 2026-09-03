import React, { useState, useRef } from 'react';
import { Camera, UploadCloud, Plus, Calendar, Image as ImageIcon } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { CameraCaptureModal } from '../skincare/CameraCaptureModal';

interface ProgressPhotoUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (imagePreview: string, notes: string) => Promise<void>;
}

export const ProgressPhotoUploader: React.FC<ProgressPhotoUploaderProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (file: File, dataUrl: string) => {
    setImagePreview(dataUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) return;

    setIsSubmitting(true);
    try {
      await onUpload(imagePreview, notes);
      setImagePreview(null);
      setNotes('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Add Skin Progress Photo"
        description="Record a visual check-in to track your skin barrier resilience over time."
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!imagePreview ? (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-6 text-center space-y-3 bg-slate-50/50 dark:bg-darkBg-900/50">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto">
                <ImageIcon className="w-6 h-6" />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Select or Capture Facial Check-In Photo
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Ensure even, natural lighting for consistent comparison
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="gradient"
                  size="sm"
                  onClick={() => setCameraModalOpen(true)}
                  leftIcon={<Camera className="w-3.5 h-3.5" />}
                >
                  Live Camera
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  leftIcon={<UploadCloud className="w-3.5 h-3.5" />}
                >
                  Upload File
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 relative">
                <img
                  src={imagePreview}
                  alt="Progress preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Change Photo
                </button>
              </div>
            </div>
          )}

          <Input
            label="Notes / Progress Observations"
            placeholder="e.g. Week 4 check-in. Skin feels less dry after ceramide lotion."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!imagePreview}
              isLoading={isSubmitting}
            >
              Save Progress Photo
            </Button>
          </div>
        </form>
      </Modal>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onCapture={handleCameraCapture}
      />
    </>
  );
};
