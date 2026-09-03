import { DetailedSkincareAnalysis } from '../types/analysis';
import { apiClient } from './apiClient';

export const analysisHistoryService = {
  async getUserAnalyses(userId: string): Promise<DetailedSkincareAnalysis[]> {
    try {
      const response = await apiClient.get(`/reports/history/${userId}`);
      if (response.success && response.history) {
        return response.history;
      }
      return [];
    } catch (e) {
      console.error('Failed to fetch analysis history', e);
      return [];
    }
  },

  async getAnalysisById(id: string): Promise<DetailedSkincareAnalysis | null> {
    // Backend endpoint needed for fetching a single analysis by id, fallback to mock behavior for now
    throw new Error("Fetching a single analysis by ID is not yet implemented on the backend.");
  },

  async saveAnalysis(analysis: DetailedSkincareAnalysis): Promise<void> {
    // This is typically handled directly by the disease analysis endpoint on the backend now.
    // The frontend doesn't need to manually save the analysis to the history DB.
    console.warn('saveAnalysis called on frontend, but it is now handled by the backend during analysis');
  },

  async deleteAnalysis(id: string): Promise<boolean> {
    throw new Error('Deleting analysis is not implemented on backend yet');
  },
};
