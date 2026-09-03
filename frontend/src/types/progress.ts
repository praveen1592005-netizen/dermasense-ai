export interface ProgressPhoto {
  id: string;
  userId: string;
  imagePreview: string;
  date: string;
  analysisId?: string;
  notes?: string;
  skinType?: string;
  observations?: string[];
}

export interface RoutineChangeLog {
  id: string;
  userId: string;
  date: string;
  action: 'added' | 'removed' | 'frequency_changed' | 'routine_started';
  productName: string;
  category: string;
  reason?: string;
}

export interface ProgressComparison {
  previousPhoto?: ProgressPhoto;
  currentPhoto: ProgressPhoto;
  previousAnalysisDate?: string;
  currentAnalysisDate?: string;
  observedChanges: string[];
  areasToMonitor: string[];
  recommendations: string[];
}
