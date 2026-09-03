import React, { useRef, useState } from 'react';
import { UploadCloud, Camera, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

export interface ImageUploaderProps {
  label?: string;
  helperText?: string;
  onImageSelected: (file: File | null, previewUrl: string | null) => void;
  currentPreview?: string | null;
  className?: string;
  guidelines?: string[];
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label = 'Upload Skin Image',
  helperText = 'Supports PNG, JPG, JPEG up to 10MB',
  onImageSelected,
  currentPreview = null,
  className = '',
  guidelines = [
    'Ensure natural, even lighting without direct glare',
    'Keep camera focused and steady (15–30 cm away)',
    'Ensure skin is clean without heavy filters or makeup',
  ],
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentPreview);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setPreview(null);
      setError(null);
      onImageSelected(null, null);
      return;
    }

    // Validation
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      onImageSelected(file, result);
    };
    reader.readAsDataURL(file);
  };

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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    onImageSelected(null, null);
  };

  return (
    <div className={cn('w-full flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
          {label}
        </label>
        {preview && (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            ✓ Image ready
          </span>
        )}
      </div>

      {preview ? (
        /* Preview State */
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 group aspect-video sm:aspect-[16/9] flex items-center justify-center">
          <img
            src={preview}
            alt="Skin upload preview"
            className="w-full h-full object-contain"
          />

          {/* AI Scan Overlay Grid Effect */}
          <div className="absolute inset-0 scanner-grid opacity-20 pointer-events-none" />

          {/* Action Overlay */}
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              leftIcon={<ImageIcon className="w-4 h-4" />}
            >
              Replace Image
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleRemove}
              leftIcon={<X className="w-4 h-4" />}
            >
              Remove
            </Button>
          </div>

          <button
            onClick={handleRemove}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors shadow-md group-hover:hidden"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Upload Area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative rounded-2xl border-2 border-dashed transition-all duration-200 p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer',
            isDragging
              ? 'border-brand-500 bg-brand-500/10'
              : 'border-slate-300 dark:border-slate-700/80 bg-slate-50/70 dark:bg-darkBg-900/50 hover:border-brand-400 dark:hover:border-brand-500/60 hover:bg-slate-100/50 dark:hover:bg-darkBg-900/80'
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          />

          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3">
            <UploadCloud className="w-7 h-7" />
          </div>

          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
            Drag and drop your image here, or{' '}
            <span className="text-brand-600 dark:text-brand-400 underline underline-offset-2">
              browse files
            </span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{helperText}</p>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              leftIcon={<ImageIcon className="w-3.5 h-3.5" />}
            >
              Choose File
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => cameraInputRef.current?.click()}
              leftIcon={<Camera className="w-3.5 h-3.5" />}
            >
              Camera
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-500 font-medium">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Photography Guidance Tips */}
      {guidelines && guidelines.length > 0 && (
        <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-darkBg-900/60 border border-slate-200/70 dark:border-slate-800/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Photo Guidelines for Accurate Analysis
          </p>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
            {guidelines.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-brand-500 font-bold">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
