export type AnalysisType = 'skincare' | 'disease';

export type SkinConcern =
  | 'Acne & Breakouts'
  | 'Dryness & Flaking'
  | 'Oiliness & Shine'
  | 'Redness & Irritation'
  | 'Hyperpigmentation & Dark Spots'
  | 'Uneven Texture'
  | 'Large-looking Pores'
  | 'Dullness'
  | 'Skin Sensitivity'
  | 'Fine Lines & Wrinkles'
  | 'Dark Circles'
  | 'Other';

export interface StructuredRoutineProduct {
  productName: string;
  frequency: 'Daily' | 'Twice Daily' | 'Few times a week' | 'Rarely' | 'Not used';
  spf?: string;
  notes?: string;
}

export interface CurrentRoutineData {
  hasNoRoutine: boolean;
  cleanser: StructuredRoutineProduct;
  moisturizer: StructuredRoutineProduct;
  sunscreen: StructuredRoutineProduct;
  serum: StructuredRoutineProduct;
  additionalProducts?: string;
}

export interface LifestyleDietData {
  waterIntakeLiters?: string;
  sleepHours?: string;
  exerciseFrequency?: 'None' | '1-2 days/week' | '3-5 days/week' | 'Daily';
  sunExposure?: 'Low' | 'Moderate' | 'High';
  stressLevel?: 'Low' | 'Moderate' | 'High';
  dietType?: 'Vegetarian' | 'Non-vegetarian' | 'Vegan' | 'Mixed' | 'Other';
  dietaryGoals?: string[];
}

export interface ImageQualityReport {
  status: 'optimal' | 'acceptable' | 'too_dark' | 'too_bright' | 'low_resolution' | 'invalid';
  brightnessScore: number; // 0 - 255
  resolution: { width: number; height: number };
  fileSizeBytes: number;
  message: string;
  isUsable: boolean;
}

export interface SkincareAnalysisInput {
  imageFile?: File | null;
  imagePreview?: string | null;
  imageQuality?: ImageQualityReport | null;
  skinType?: string;
  primaryConcerns: string[];
  currentRoutine?: string; // legacy fallback
  productsUsed?: string; // legacy fallback
  structuredRoutine: CurrentRoutineData;
  lifestyleDiet: LifestyleDietData;
  waterIntakeLiters?: string;
  sunscreenFrequency?: string;
  sleepHours?: string;
  stressLevel?: string;
}

export interface RoutineStep {
  stepNumber: number;
  stepName: string;
  category: string;
  description: string;
  recommendedFrequency: string;
  keyIngredients: string[];
}

export interface ProductCategoryGuidance {
  category: string;
  purpose: string;
  suitableIngredients: string[];
  ingredientsToAvoid: string[];
}

export interface LifestyleGuidanceItem {
  title: string;
  recommendation: string;
  impact: string;
  icon: string;
}

export interface NutritionGuidanceItem {
  category: string;
  foods: string[];
  benefit: string;
}

export interface DetailedSkincareAnalysis {
  id: string;
  userId: string;
  createdAt: string;
  imagePreview?: string;
  status: 'completed' | 'pending_ai_service' | 'low_confidence';
  detectedSkinType?: string;
  confidence?: number;
  observations?: string[];
  morningRoutine?: RoutineStep[];
  eveningRoutine?: RoutineStep[];
  productCategories?: ProductCategoryGuidance[];
  lifestyleGuidance?: LifestyleGuidanceItem[];
  nutritionGuidance?: NutritionGuidanceItem[];
  modelVersion?: string;
  imageQuality?: ImageQualityReport;
  inputSnapshot?: SkincareAnalysisInput;
}

export interface SkinDiseaseAnalysisInput {
  imageFile?: File | null;
  imagePreview?: string | null;
  symptoms: string[];
  duration: string;
  itching: boolean;
  pain: boolean;
  redness: boolean;
  swelling: boolean;
  bodyLocation: string;
  additionalNotes?: string;
}

export interface AnalysisSubmissionResult {
  id: string;
  type: AnalysisType;
  submittedAt: string;
  status: 'pending_ai_service' | 'queued' | 'completed';
  message: string;
}
