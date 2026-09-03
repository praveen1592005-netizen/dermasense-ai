export type SymptomSeverity = 'none' | 'mild' | 'moderate' | 'severe';

export type ConfidenceLevel = 'HIGH' | 'MODERATE' | 'LOW';
export type RiskLevel = 'HIGH' | 'MODERATE' | 'LOW' | 'UNCERTAIN';
export type ModelStatus =
  | 'prediction_available'
  | 'low_confidence'
  | 'image_quality_insufficient'
  | 'model_not_configured'
  | 'invalid_image'
  | 'poor_quality'
  | 'inference_error'
  | 'class_mapping_error'
  | 'backend_unavailable';

export interface TopKPrediction {
  condition: string;
  confidence: number;
  confidence_percentage: number;
}

export interface ModelPrediction {
  status: ModelStatus;
  condition: string | null;
  /** Human-readable display name, e.g. "Melanocytic Nevi" */
  display_name?: string | null;
  confidence: number | null;
  confidence_percentage: number | null;
  confidence_level: ConfidenceLevel | null;
  risk_level: RiskLevel;
  hospital_recommended: boolean;
  top_k: TopKPrediction[];
  model: string;
  class_count: number;
  message: string;
  /** From backend recommendation field */
  recommendation?: string;
  /** Full medical disclaimer text */
  medical_disclaimer?: string;
  /** Per-class calibrated probabilities, e.g. {MEL: 0.03, NV: 0.82, ...} */
  class_probabilities?: Record<string, number> | null;
  /** Model identifier, e.g. "DermaSense_EfficientNetV2B2" */
  model_name?: string;
  /** Model version string, e.g. "1.0" */
  model_version?: string;
}
export type DurationCategory =
  | 'under_24h'
  | 'several_days'
  | '1_2_weeks'
  | 'several_weeks'
  | 'over_a_month'
  | 'unsure';

export type BodyLocation =
  | 'face'
  | 'scalp'
  | 'neck'
  | 'chest'
  | 'back'
  | 'arms'
  | 'hands'
  | 'legs'
  | 'feet'
  | 'other';

export type ProgressionTimeline = 'improving' | 'stable' | 'worsening' | 'unsure';

export type PossibleExposure =
  | 'new_skincare'
  | 'cosmetic'
  | 'detergent'
  | 'soap'
  | 'sun'
  | 'plant'
  | 'chemical'
  | 'animal'
  | 'unknown';

export interface DiseaseImage {
  id: string;
  previewUrl: string;
  label: string;
  qualityStatus: 'passed' | 'warning' | 'rejected';
  qualityNote?: string;
  timestamp: string;
}

export interface SymptomProfile {
  itching: SymptomSeverity;
  pain: SymptomSeverity;
  redness: SymptomSeverity;
  swelling: boolean;
  discharge: 'no' | 'yes' | 'unsure';
  duration: DurationCategory;
  isAreaIncreasing: boolean;
  hasRecurred: boolean;
  multipleAreas: boolean;
  additionalSymptoms: string[];
  bodyLocations: BodyLocation[];
  description: string;
  progression: ProgressionTimeline;
  exposures: PossibleExposure[];
  hasRedFlags: boolean;
  redFlagDetails?: string[];
}

export type UrgencyLevel =
  | 'general_info'
  | 'evaluation_recommended'
  | 'prompt_evaluation'
  | 'emergency';

export interface PossibleCategory {
  categoryName: string;
  confidencePct: number;
  description: string;
  keyIndicators: string[];
}

export interface DiseaseAnalysis {
  id: string;
  userId: string;
  createdAt: string;
  images: DiseaseImage[];
  symptomProfile: SymptomProfile;
  urgencyLevel: UrgencyLevel;
  urgencyMessage: string;
  possibleCategories: PossibleCategory[];
  observations: string[];
  precautions: string[];
  lifestyleGuidance: string[];
  nutritionGuidance: string[];
  disclaimer: string;
  modelVersion: string;
  isEmergencyRedFlag: boolean;
  // Real AI model fields (populated when backend is connected)
  modelPrediction?: ModelPrediction | null;
  aiExplanation?: string | null;
  aiLifestyleGuidance?: string | null;
  aiAvailable?: boolean;
  backendConnected?: boolean;
}

export interface HospitalResult {
  id: string;
  name: string;
  address: string;
  distance_km: number | null;
  phone?: string | null;
  latitude: number;
  longitude: number;
  /** Human-readable opening hours, e.g. "Monday: 9:00 AM – 6:00 PM" */
  opening_hours?: string | null;
  /** Google Maps deep link for directions */
  maps_url?: string | null;
}
