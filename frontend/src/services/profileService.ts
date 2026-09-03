import { User } from '../types/auth';
import { UserProfile, DetailedSkinProfile, StructuredAddress, AadhaarRecord } from '../types/user';
import { authService } from './authService';

export interface ProfileCompletionReport {
  percentage: number;
  completedFieldsCount: number;
  totalFieldsCount: number;
  missingFields: { id: string; label: string; action: string }[];
  completedFields: string[];
}

export const profileService = {
  /**
   * Evaluates dynamic profile completion percentage based on non-sensitive, actionable fields.
   * Note: Sensitive identity data like Aadhaar is strictly excluded from mandatory completion requirements.
   */
  calculateCompletion(user: User | null): ProfileCompletionReport {
    if (!user) {
      return {
        percentage: 0,
        completedFieldsCount: 0,
        totalFieldsCount: 6,
        missingFields: [],
        completedFields: [],
      };
    }

    const profile = user.profile || {};
    const skin = profile.skinProfile || {};
    const addr = profile.addressStructured || {};

    const checks = [
      {
        id: 'fullName',
        label: 'Full Name',
        action: 'Add your full name',
        isComplete: Boolean(user.fullName && user.fullName.trim().length > 2),
      },
      {
        id: 'avatar',
        label: 'Profile Photo',
        action: 'Upload a profile photo',
        isComplete: Boolean(profile.avatarUrl),
      },
      {
        id: 'phone',
        label: 'Phone Number',
        action: 'Add contact phone number',
        isComplete: Boolean(profile.phone && profile.phone.trim().length > 6),
      },
      {
        id: 'address',
        label: 'Structured Address',
        action: 'Set your city and country',
        isComplete: Boolean(addr.city || profile.address),
      },
      {
        id: 'skinType',
        label: 'Skin Type Assessment',
        action: 'Specify your skin type',
        isComplete: Boolean(skin.skinType || profile.skinType),
      },
      {
        id: 'skinConcerns',
        label: 'Primary Skin Concerns',
        action: 'Select your key skin concerns',
        isComplete: Boolean((skin.primaryConcerns && skin.primaryConcerns.length > 0) || (profile.skinConcerns && profile.skinConcerns.length > 0)),
      },
    ];

    const completed = checks.filter((c) => c.isComplete);
    const missing = checks.filter((c) => !c.isComplete);
    const percentage = Math.round((completed.length / checks.length) * 100);

    return {
      percentage,
      completedFieldsCount: completed.length,
      totalFieldsCount: checks.length,
      missingFields: missing.map((m) => ({ id: m.id, label: m.label, action: m.action })),
      completedFields: completed.map((c) => c.label),
    };
  },

  /**
   * Securely formats and validates Aadhaar number.
   * Returns a masked representation (•••• •••• 1234) without persisting raw number in localStorage.
   */
  processAadhaarInput(rawNumber: string): AadhaarRecord {
    const cleanDigits = rawNumber.replace(/\D/g, '');
    if (cleanDigits.length !== 12) {
      throw new Error('Aadhaar number must contain exactly 12 numeric digits.');
    }

    const lastFour = cleanDigits.slice(-4);
    const masked = `•••• •••• ${lastFour}`;

    return {
      isProvided: true,
      maskedNumber: masked,
      lastFourDigits: lastFour,
      verificationStatus: 'pending_backend_vault',
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * Validates profile photo file.
   */
  validatePhotoFile(file: File): { isValid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return { isValid: false, error: 'Only JPG, PNG, and WebP image formats are supported.' };
    }

    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeBytes) {
      return { isValid: false, error: 'Profile photo must be smaller than 5MB.' };
    }

    return { isValid: true };
  },

  /**
   * Updates user profile with partial updates.
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<User> {
    return authService.updateUserProfile(userId, updates);
  },
};
