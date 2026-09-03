import React, { useRef, useState } from 'react';
import { Camera, Upload, Trash2, User as UserIcon, Loader2, Check } from 'lucide-react';
import { profileService } from '../../services/profileService';
import { useNotification } from '../../context/NotificationContext';
import { cn } from '../../utils/cn';

interface ProfileAvatarProps {
  avatarUrl?: string;
  userName?: string;
  onAvatarChange: (newUrl: string | null) => Promise<void>;
  editable?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  avatarUrl,
  userName = 'User',
  onAvatarChange,
  editable = true,
  size = 'lg',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { showSuccess, showError } = useNotification();

  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-20 h-20 text-xl',
    lg: 'w-28 h-28 text-3xl',
    xl: 'w-36 h-36 text-4xl',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'DS';
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;

    const validation = profileService.validatePhotoFile(file);
    if (!validation.isValid) {
      showError('Invalid Image', validation.error || 'Please select a valid image file.');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        await onAvatarChange(dataUrl);
        showSuccess('Photo Updated', 'Your profile picture has been updated.');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      showError('Upload Failed', 'Unable to process profile picture.');
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    setIsUploading(true);
    try {
      await onAvatarChange(null);
      showSuccess('Photo Removed', 'Profile picture reset to default avatar.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center sm:items-start gap-3">
      <div className="relative group">
        {/* Avatar Image or Initials Box */}
        <div
          className={cn(
            'rounded-3xl overflow-hidden border-2 border-brand-500/40 shadow-lg relative flex items-center justify-center font-extrabold bg-gradient-to-br from-brand-600 via-tealBrand-600 to-indigoBrand-600 text-white select-none',
            sizeClasses[size]
          )}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={userName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{getInitials(userName)}</span>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center text-white">
              <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
            </div>
          )}
        </div>

        {/* Floating Upload Controls (When editable) */}
        {editable && (
          <div className="flex items-center gap-1.5 mt-2.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-darkBg-800 text-slate-700 dark:text-slate-200 hover:bg-brand-500 hover:text-white dark:hover:bg-brand-500 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200/80 dark:border-slate-700"
              title="Upload photo from device"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload</span>
            </button>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-darkBg-800 text-slate-700 dark:text-slate-200 hover:bg-tealBrand-500 hover:text-white text-xs transition-colors border border-slate-200/80 dark:border-slate-700"
              title="Take photo using camera"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>

            {avatarUrl && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white text-xs transition-colors border border-rose-200 dark:border-rose-900/50"
                title="Remove photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] || null)}
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] || null)}
      />
    </div>
  );
};
