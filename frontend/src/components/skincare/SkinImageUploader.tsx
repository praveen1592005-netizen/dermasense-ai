import React, { useRef, useState, useCallback } from 'react';
import {
  UploadCloud,
  Camera,
  Trash2,
  RefreshCw,
  Sparkles,
  FileImage,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { CameraCaptureModal } from './CameraCaptureModal';
import { ImageQualityCard } from './ImageQualityCard';
import { ImageGuidanceCard } from './ImageGuidanceCard';
import { imageQualityService } from '../../services/imageQualityService';
import { ImageQualityReport } from '../../types/analysis';
import { useNotification } from '../../context/NotificationContext';

interface SkinImageUploaderProps {
  imageFile: File | null;
  imagePreview: string | null;
  imageQuality: ImageQualityReport | null;
  onImageChange: (file: File | null, previewUrl: string | null, quality: ImageQualityReport | null) => void;
}

export const SkinImageUploader: React.FC<SkinImageUploaderProps> = ({
  imageFile,
  imagePreview,
  imageQuality,
  onImageChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showError } = useNotification();

  const processFile = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      try {
        const qualityReport = await imageQualityService.analyzeImageQuality(file);

        if (qualityReport.status === 'invalid') {
          showError('Invalid Image File', qualityReport.message);
          setIsProcessing(false);
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          const previewUrl = reader.result as string;
          onImageChange(file, previewUrl, qualityReport);
          setIsProcessing(false);
        };
        reader.readAsDataURL(file);
      } catch (err: any) {
        showError('Image Error', 'Unable to process selected image file.');
        setIsProcessing(false);
      }
    },
    [onImageChange, showError]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleCameraCapture = (file: File, dataUrl: string) => {
    processFile(file);
  };

  const handleRemove = () => {
    onImageChange(null, null, null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <ImageGuidanceCard />

      {!imagePreview ? (
        /* Empty Upload / Capture Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all ${
            isDragging
              ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-darkBg-900/40 hover:border-brand-400'
          }`}
        >
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-brand-500/10 text-brand-500 border border-brand-500/20 flex items-center justify-center mx-auto shadow-sm">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Upload or Capture Facial Photo
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Drag and drop your skin image here, or choose an option below
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="gradient"
                size="md"
                onClick={() => setCameraModalOpen(true)}
                leftIcon={<Camera className="w-4 h-4" />}
              >
                Use Live Camera
              </Button>

              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<UploadCloud className="w-4 h-4" />}
              >
                Upload from Device
              </Button>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-2">
              Supported formats: JPG, JPEG, PNG, WebP (Max 5MB)
            </p>
          </div>
        </div>
      ) : (
        /* Image Preview Card with Quality Analysis (Section 8) */
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-darkBg-850/60 shadow-sm flex flex-col md:flex-row items-center gap-6">
            {/* Image Preview Thumbnail */}
            <div className="w-full sm:w-64 h-64 rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 relative flex-shrink-0 shadow-md">
              <img
                src={imagePreview}
                alt="Selected skin capture"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2">
                <Badge variant="brand" size="sm">
                  Ready for AI
                </Badge>
              </div>
            </div>

            {/* Image Metadata & Quality Details */}
            <div className="flex-1 w-full space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Facial Skin Image Captured
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {imageFile ? imageFile.name : 'camera_capture.jpg'}
                </p>
              </div>

              {/* Quality Card */}
              <ImageQualityCard report={imageQuality} />

              {/* Action Controls */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCameraModalOpen(true)}
                  leftIcon={<Camera className="w-3.5 h-3.5" />}
                >
                  Retake Photo
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Choose Another
                </Button>

                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={handleRemove}
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};
