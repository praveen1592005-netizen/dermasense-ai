export type ReportType = 'skincare' | 'disease' | 'progress';
export type ReportStatus = 'ready' | 'processing' | 'archived';
export type ReportFilter = 'all' | 'skincare' | 'disease' | 'progress';
export type ReportDateFilter = 'all' | 'today' | 'last_7_days' | 'last_30_days' | 'last_6_months';

export interface Report {
  id: string;
  userId?: string;
  title: string;
  type: ReportType;
  date: string;
  status: ReportStatus;
  summary: string;
  analysisId?: string;
  imagePreview?: string;
  skinType?: string;
  observations?: string[];
  morningRoutine?: any[];
  eveningRoutine?: any[];
  productCategories?: any[];
  lifestyleGuidance?: any[];
  nutritionGuidance?: any[];
  symptoms?: string[];
  recommendations?: string[];
  prediction?: string;
  confidence?: number;
  riskLevel?: string;
  hospitalRecommendation?: boolean;
  modelName?: string;
  modelVersion?: string;
  isShared?: boolean;
  shareToken?: string;
  lastUpdated?: string;
}

export interface ReportSummaryStats {
  totalReports: number;
  skincareReports: number;
  diseaseReports: number;
  progressReports: number;
}
