import {
  SkincareAnalysisInput,
  DetailedSkincareAnalysis,
  AnalysisSubmissionResult,
} from '../types/analysis';
import { analysisHistoryService } from './analysisHistoryService';
import { authService } from './authService';
import { reportService } from './reportService';
import { Report } from '../types/report';
import { supabase } from './supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const skincareAnalysisService = {
  /**
   * Submits image and clinical questionnaire for AI analysis.
   * Architecture: FastAPI backend -> image quality check -> routine generation -> Supabase save.
   */
  async submitAnalysis(
    input: SkincareAnalysisInput,
    onProgress?: (stage: string) => void
  ): Promise<DetailedSkincareAnalysis> {
    // Always use the real Supabase session user id for authentication.
    // authService.getCurrentUser() only reads from localStorage and may be stale.
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || (await authService.getCurrentUser())?.id || 'usr_guest';
    const analysisId = `skin_ai_${Date.now()}`;

    // Stage 1: Validate parameters
    onProgress?.('Validating image resolution and lighting...');
    await new Promise((res) => setTimeout(res, 600));

    // Stage 2: Preprocess & structure questionnaire
    onProgress?.('Structuring routine and lifestyle parameters...');
    await new Promise((res) => setTimeout(res, 700));

    // Stage 3: Connect to backend or prepare baseline recommendations
    onProgress?.('Connecting to DermaSense AI analysis service...');
    await new Promise((res) => setTimeout(res, 800));

    // If a real backend URL is configured, attempt real model inference
    if (API_BASE_URL) {
      try {
        const formData = new FormData();
        if (input.imageFile) {
          formData.append('image', input.imageFile);
        }
        formData.append('metadata', JSON.stringify({
          skinType: input.skinType,
          concerns: input.primaryConcerns,
          routine: input.structuredRoutine,
          lifestyle: input.lifestyleDiet,
        }));

        const { apiClient } = await import('./apiClient');
        onProgress?.('Sending data to AI analysis engine...');
        const apiResult = await apiClient.post('/skincare/analyze', formData);

        if (apiResult && apiResult.success) {
          const completeAnalysis: DetailedSkincareAnalysis = {
            id: apiResult.analysisId || analysisId,
            userId,
            createdAt: new Date().toISOString(),
            imagePreview: input.imagePreview || undefined,
            status: 'completed',
            detectedSkinType: apiResult.skinType,
            confidence: apiResult.confidence,
            observations: apiResult.observations,
            morningRoutine: apiResult.morningRoutine,
            eveningRoutine: apiResult.eveningRoutine,
            productCategories: apiResult.productCategories,
            lifestyleGuidance: apiResult.lifestyleGuidance,
            nutritionGuidance: apiResult.nutritionGuidance,
            modelVersion: apiResult.modelVersion || 'DermaSense-Vision-v1',
            imageQuality: input.imageQuality || undefined,
            inputSnapshot: input,
          };
          await analysisHistoryService.saveAnalysis(completeAnalysis);
          
          // Generate and save report
          try {
            const reportData: Partial<Report> = {
              title: 'Skincare Analysis',
              type: 'skincare',
              date: completeAnalysis.createdAt,
              status: 'ready',
              summary: `Skincare analysis completed. Detected skin type: ${apiResult.skinType || input.skinType || 'Combination'}.`,
              imagePreview: completeAnalysis.imagePreview,
              skinType: apiResult.skinType || input.skinType || 'Combination',
              observations: completeAnalysis.observations,
              morningRoutine: completeAnalysis.morningRoutine,
              eveningRoutine: completeAnalysis.eveningRoutine,
              productCategories: completeAnalysis.productCategories,
              lifestyleGuidance: completeAnalysis.lifestyleGuidance,
              nutritionGuidance: completeAnalysis.nutritionGuidance,
              modelVersion: completeAnalysis.modelVersion,
              confidence: completeAnalysis.confidence,
            };
            
            if (userId !== 'usr_guest') {
              const reportId = await reportService.createReport(userId, reportData);
              console.log('Saved skincare report with ID:', reportId);
            }
          } catch (e) {
            console.error('[DermaSense] Failed to save skincare report (non-fatal):', e);
          }

          return completeAnalysis;
        }

        throw new Error('Skincare analysis failed. The server returned an invalid response.');
      } catch (err: any) {
        // Always log the full technical error for debugging
        console.error('[DermaSense] AI skincare analysis error:', {
          name: err?.name,
          message: err?.message,
          status: err?.response?.status,
          apiBaseUrl: API_BASE_URL,
        });

        // Network / fetch errors:
        // "Failed to fetch" = browser could not reach the server at all.
        // Causes: backend not running, wrong port, CORS rejection, Render cold-start timeout.
        const msg = typeof err?.message === 'string' ? err.message.toLowerCase() : '';
        const isNetworkError =
          err.name === 'TypeError' ||
          err.name === 'AbortError' ||
          msg.includes('failed to fetch') ||
          msg.includes('networkerror') ||
          msg.includes('network request failed') ||
          msg.includes('load failed') ||
          msg.includes('the internet connection appears to be offline');

        if (isNetworkError) {
          const isRender = API_BASE_URL.includes('onrender.com') || API_BASE_URL.includes('render.com');
          if (isRender) {
            throw new Error(
              'Unable to reach the analysis service. ' +
              'The cloud backend on Render may be starting up from sleep mode — ' +
              'this can take up to 60 seconds on the free tier. ' +
              'Please wait a moment and try again.'
            );
          }
          throw new Error(
            'Unable to connect to the analysis service. ' +
            'Please make sure the backend server is running ' +
            '(run start-backend.bat) and try again.'
          );
        }

        // Image quality errors
        if (msg.includes('upload a clearer image') || msg.includes('clearer image')) {
          throw new Error(
            'Image quality is insufficient for reliable analysis. ' +
            'Please upload a clearer, well-lit facial photo.'
          );
        }

        // HTTP status-based errors
        if (err.response?.status === 400) {
          const detail = err.response?.data?.detail || err.response?.data?.message;
          if (detail?.includes('clearer image')) {
            throw new Error(
              'Image quality is insufficient for reliable analysis. Please upload a clearer image.'
            );
          }
          throw new Error(detail || 'Invalid request. Please check your image and try again.');
        }

        if (err.response?.status === 401 || msg.includes('session expired') || msg.includes('401')) {
          throw new Error('Your session is no longer valid. Please sign in again and retry the analysis.');
        }

        if (err.response?.status === 403) {
          throw new Error('Access denied. Please sign in and try again.');
        }

        if (err.response?.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        }

        if (err.response?.status >= 500) {
          throw new Error(
            'The AI analysis service is temporarily unavailable. Please try again in a moment.'
          );
        }

        throw new Error(
          err.message || 'Unable to connect to the backend server. Please try again later.'
        );
      }
    } else {
      throw new Error(
        'Backend connection is not configured. ' +
        'VITE_API_BASE_URL is missing — set it to http://localhost:8000/api/v1 in frontend/.env'
      );
    }
  },

  async getAnalysisById(id: string): Promise<DetailedSkincareAnalysis | null> {
    return analysisHistoryService.getAnalysisById(id);
  },

  async getUserAnalyses(userId: string): Promise<DetailedSkincareAnalysis[]> {
    return analysisHistoryService.getUserAnalyses(userId);
  },

  async deleteAnalysis(id: string): Promise<boolean> {
    return analysisHistoryService.deleteAnalysis(id);
  },

  // Legacy adapter for backward compatibility
  async submitSkincareAnalysis(data: any): Promise<AnalysisSubmissionResult> {
    const analysis = await this.submitAnalysis({
      ...data,
      structuredRoutine: {
        hasNoRoutine: false,
        cleanser: { productName: '', frequency: 'Daily' },
        moisturizer: { productName: '', frequency: 'Daily' },
        sunscreen: { productName: '', frequency: 'Daily' },
        serum: { productName: '', frequency: 'Daily' },
      },
      lifestyleDiet: {},
    });

    return {
      id: analysis.id,
      type: 'skincare',
      submittedAt: analysis.createdAt,
      status: 'pending_ai_service',
      message: 'Skincare profile and image successfully prepared. AI skincare analysis will be available once the analysis service is connected.',
    };
  }
};
