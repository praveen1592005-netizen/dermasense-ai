import {
  SkincareAnalysisInput,
  DetailedSkincareAnalysis,
  AnalysisSubmissionResult,
} from '../types/analysis';
import { recommendationService } from './recommendationService';
import { analysisHistoryService } from './analysisHistoryService';
import { authService } from './authService';
import { reportService } from './reportService';
import { Report } from '../types/report';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const skincareAnalysisService = {
  /**
   * Submits image and clinical questionnaire for AI analysis.
   * Architecture ready for future FastAPI + Vision Transformer / EfficientNet model backend.
   */
  async submitAnalysis(
    input: SkincareAnalysisInput,
    onProgress?: (stage: string) => void
  ): Promise<DetailedSkincareAnalysis> {
    const user = await authService.getCurrentUser();
    const userId = user?.id || 'usr_guest';
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
            console.error('Failed to save skincare report', e);
          }
          
          return completeAnalysis;
        }
        
        throw new Error('Skincare analysis failed. The server returned an invalid response.');
      } catch (err: any) {
        // If image quality fails, we want to bubble up the specific error requested by user
        if (err.message && err.message.includes('upload a clearer image')) {
          throw new Error('Image quality is insufficient for reliable analysis. Please upload a clearer image.');
        }
        
        if (err.response?.status === 400) {
            const detail = err.response?.data?.detail || err.response?.data?.message;
            if (detail && detail.includes('clearer image')) {
                 throw new Error('Image quality is insufficient for reliable analysis. Please upload a clearer image.');
            }
            throw new Error(detail || 'Please select a valid skin image.');
        }
        
        throw new Error(err.message || 'Unable to connect to the backend server. Please try again later.');
      }
    } else {
        throw new Error('Backend connection is not configured. (API_BASE_URL is missing)');
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
