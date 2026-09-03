import { ImageQualityReport } from '../types/analysis';

export const imageQualityService = {
  /**
   * Analyzes an image file using an off-screen HTML5 Canvas.
   * Checks for:
   * - Resolution (minimum 300x300 recommended)
   * - Luminance / Brightness (detects excessive darkness < 40 or overexposure > 220)
   * - File size (< 5MB)
   */
  async analyzeImageQuality(file: File): Promise<ImageQualityReport> {
    return new Promise((resolve) => {
      const fileSizeBytes = file.size;

      // Validate file size
      if (fileSizeBytes > 5 * 1024 * 1024) {
        resolve({
          status: 'invalid',
          brightnessScore: 0,
          resolution: { width: 0, height: 0 },
          fileSizeBytes,
          message: 'Please select a valid skin image.',
          isUsable: false,
        });
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        URL.revokeObjectURL(objectUrl);

        // Check resolution
        if (width < 300 || height < 300) {
          resolve({
            status: 'low_resolution',
            brightnessScore: 128,
            resolution: { width, height },
            fileSizeBytes,
            message: 'Image quality is insufficient for reliable analysis. Please upload a clearer image.',
            isUsable: false,
          });
          return;
        }

        // Perform canvas sample to measure average brightness
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Downsample for fast evaluation
          const sampleWidth = 100;
          const sampleHeight = Math.round((height / width) * 100);
          canvas.width = sampleWidth;
          canvas.height = sampleHeight;

          if (!ctx) {
            resolve({
              status: 'acceptable',
              brightnessScore: 128,
              resolution: { width, height },
              fileSizeBytes,
              message: 'Image dimensions verified and ready for AI processing.',
              isUsable: true,
            });
            return;
          }

          ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
          const imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
          const data = imageData.data;

          let totalBrightness = 0;
          let count = 0;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // Standard relative luminance formula
            const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
            totalBrightness += brightness;
            count++;
          }

          const avgBrightness = Math.round(totalBrightness / count);

          if (avgBrightness < 40) {
            resolve({
              status: 'too_dark',
              brightnessScore: avgBrightness,
              resolution: { width, height },
              fileSizeBytes,
              message: 'Image quality is insufficient for reliable analysis. Please upload a clearer image.',
              isUsable: false,
            });
          } else if (avgBrightness > 220) {
            resolve({
              status: 'too_bright',
              brightnessScore: avgBrightness,
              resolution: { width, height },
              fileSizeBytes,
              message: 'Image quality is insufficient for reliable analysis. Please upload a clearer image.',
              isUsable: false,
            });
          } else {
            resolve({
              status: 'optimal',
              brightnessScore: avgBrightness,
              resolution: { width, height },
              fileSizeBytes,
              message: 'Image quality and lighting look suitable for facial skin analysis.',
              isUsable: true,
            });
          }
        } catch {
          // Fallback if canvas read fails
          resolve({
            status: 'acceptable',
            brightnessScore: 128,
            resolution: { width, height },
            fileSizeBytes,
            message: 'Image format verified and ready for analysis.',
            isUsable: true,
          });
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({
          status: 'invalid',
          brightnessScore: 0,
          resolution: { width: 0, height: 0 },
          fileSizeBytes,
          message: 'Please select a valid skin image.',
          isUsable: false,
        });
      };

      img.src = objectUrl;
    });
  },
};
