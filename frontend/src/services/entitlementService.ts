import { MembershipUsageStats, UserSubscription } from '../types/membership';
import { membershipService } from './membershipService';
import { analysisHistoryService } from './analysisHistoryService';
import { reportService } from './reportService';
import { skinProgressService } from './skinProgressService';

export const entitlementService = {
  /**
   * Computes dynamic feature usage statistics for the user based on active subscription tier.
   */
  async getUsageStats(userId: string = 'usr_guest'): Promise<MembershipUsageStats> {
    const sub = await membershipService.getUserSubscription(userId);
    const plan = await membershipService.getPlanById(sub.planId);

    const [analyses, reports, photos] = await Promise.all([
      analysisHistoryService.getUserAnalyses(userId),
      reportService.getReports(userId),
      skinProgressService.getProgressPhotos(userId),
    ]);
    
    // Default fallback limits if plan is somehow null
    const limits = plan ? plan.limits : { analysesPerMonth: 5, reportsPerMonth: 5, maxProgressPhotos: 5 };

    return {
      analysesUsed: analyses.length,
      analysesLimit: limits?.analysesPerMonth || 5,
      reportsUsed: reports.length,
      reportsLimit: limits.reportsPerMonth,
      progressPhotosCount: photos.length,
      progressPhotosLimit: limits.maxProgressPhotos,
    };
  },

  /**
   * Checks if user has remaining quota for initiating a skincare analysis.
   */
  async checkCanPerformAnalysis(userId: string = 'usr_guest'): Promise<{ canProceed: boolean; message?: string }> {
    const stats = await this.getUsageStats(userId);
    if (stats.analysesLimit === 'unlimited') return { canProceed: true };

    if (stats.analysesUsed >= stats.analysesLimit) {
      return {
        canProceed: false,
        message: `You have reached your free lifetime analysis limit of ${stats.analysesLimit}. Upgrade to Premium for unlimited analyses.`,
      };
    }
    return { canProceed: true };
  },

  /**
   * Checks if user can access detailed clinical reports.
   */
  async checkCanGenerateReport(userId: string = 'usr_guest'): Promise<{ canProceed: boolean; message?: string }> {
    const stats = await this.getUsageStats(userId);
    if (stats.reportsLimit === 'unlimited') return { canProceed: true };

    if (stats.reportsUsed >= stats.reportsLimit) {
      return {
        canProceed: false,
        message: `Monthly report generation limit (${stats.reportsLimit}) reached. Upgrade your plan to unlock more reports.`,
      };
    }
    return { canProceed: true };
  },
};
