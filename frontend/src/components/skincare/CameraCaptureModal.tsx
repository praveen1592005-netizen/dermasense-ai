import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, X, Check, AlertCircle, Sparkles, SwitchCamera } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File, dataUrl: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isInitializing, setIsInitializing] = useState(false);

  // Initialize camera stream when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedDataUrl(null);
      setCameraError(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setIsInitializing(true);
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Camera permission was denied. Please allow camera access in your browser settings or use device upload.'
          : 'Unable to connect to camera device. Please use upload from device.'
      );
    } finally {
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleTakeSnapshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If front camera, flip horizontally for natural mirror look
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedDataUrl(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedDataUrl(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (!capturedDataUrl) return;

    // Convert DataURL to File
    const arr = capturedDataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const file = new File([u8arr], `camera_capture_${Date.now()}.jpg`, { type: mime });

    onCapture(file, capturedDataUrl);
    onClose();
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Live Camera Skin Capture"
      description="Position your face inside the frame with clear, even lighting."
      size="lg"
    >
      <div className="space-y-4">
        {cameraError ? (
          <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300 font-medium">
              {cameraError}
            </p>
            <Button variant="secondary" size="sm" onClick={startCamera}>
              Retry Camera Permission
            </Button>
          </div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] flex items-center justify-center border border-slate-800 shadow-inner">
            {capturedDataUrl ? (
              <img
                src={capturedDataUrl}
                alt="Captured Selfie"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${
                    facingMode === 'user' ? 'scale-x-[-1]' : ''
                  }`}
                />

                {/* Facial alignment guide overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-72 rounded-[50%] border-2 border-dashed border-white/60 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center">
                    <span className="text-[11px] font-semibold text-white/90 bg-slate-950/60 px-3 py-1 rounded-full backdrop-blur-xs">
                      Align Face Here
                    </span>
                  </div>
                </div>

                {/* Switch camera button */}
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-md transition-all border border-white/20"
                  title="Switch camera"
                >
                  <SwitchCamera className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}

        {/* Modal Controls */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          {capturedDataUrl ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleRetake} leftIcon={<RefreshCw className="w-4 h-4" />}>
                Retake
              </Button>
              <Button variant="primary" onClick={handleConfirm} leftIcon={<Check className="w-4 h-4" />}>
                Use Photo
              </Button>
            </div>
          ) : (
            <Button
              variant="gradient"
              onClick={handleTakeSnapshot}
              disabled={Boolean(cameraError) || isInitializing}
              leftIcon={<Camera className="w-4 h-4" />}
            >
              Take Snapshot
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
