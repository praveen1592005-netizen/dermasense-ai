export type SkinType = 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive' | 'unsure';

export type SkinSensitivity = 'none' | 'low' | 'moderate' | 'high';

export type SkinGoal = 
  | 'better_skincare_routine' 
  | 'understand_my_skin' 
  | 'track_skin_progress' 
  | 'explore_skin_health_guidance';

export interface StructuredAddress {
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string; // Default: 'India'
}

export interface DetailedSkinProfile {
  skinType?: SkinType;
  primaryConcerns?: string[];
  secondaryConcerns?: string[];
  sensitivity?: SkinSensitivity;
  currentRoutine?: string;
  preferredGoals?: SkinGoal[];
  lastAssessedDate?: string;
}

export interface AadhaarRecord {
  isProvided: boolean;
  maskedNumber?: string; // e.g. "•••• •••• 1234"
  lastFourDigits?: string; // e.g. "1234"
  verificationStatus: 'unverified' | 'pending_backend_vault' | 'verified';
  updatedAt?: string;
}

export interface UserProfile {
  age?: number | string;
  phone?: string;
  phoneCountryCode?: string;
  isPhoneVerified?: boolean;
  address?: string; // simple legacy fallback
  addressStructured?: StructuredAddress;
  preferredLanguage?: string;
  skinType?: SkinType;
  skinConcerns?: string[];
  mainGoal?: SkinGoal;
  skinProfile?: DetailedSkinProfile;
  aadhaar?: AadhaarRecord;
  avatarUrl?: string;
  isProfileCompleted?: boolean;
  onboardingCompleted?: boolean;
  accountStatus?: 'Active' | 'Pending Verification' | 'Suspended';
  lastLoginAt?: string;
  lastLoginDevice?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    analysis: boolean;
    appointments: boolean;
    offers: boolean;
  };
  privacy: {
    shareAnonymousMetrics: boolean;
    storeAnalysisHistory: boolean;
  };
}
