import { SymptomProfile, UrgencyLevel } from '../types/disease';

export interface TriageEvaluation {
  urgencyLevel: UrgencyLevel;
  urgencyTitle: string;
  urgencyMessage: string;
  isEmergency: boolean;
  recommendedAction: string;
}

export const triageService = {
  /**
   * Evaluates symptom profile against clinical safety guidelines and red-flag rules.
   */
  evaluateTriage(symptoms: SymptomProfile): TriageEvaluation {
    // 1. Emergency Red-Flag Interceptor
    if (symptoms.hasRedFlags || (symptoms.redFlagDetails && symptoms.redFlagDetails.length > 0)) {
      return {
        urgencyLevel: 'emergency',
        urgencyTitle: 'Immediate Emergency Medical Care Advised',
        urgencyMessage:
          'Your reported symptoms include potential acute emergency indicators (e.g. respiratory difficulty, rapid facial swelling, or severe acute systemic reaction). Please seek immediate emergency medical care rather than relying on this AI screening tool.',
        isEmergency: true,
        recommendedAction: 'Proceed immediately to the nearest emergency department or urgent care facility.',
      };
    }

    // 2. Prompt Medical Evaluation (Severe symptoms, discharge + worsening)
    const hasSevereSymptom =
      symptoms.pain === 'severe' ||
      symptoms.itching === 'severe' ||
      symptoms.redness === 'severe';
    const isWorseningWithDischarge =
      symptoms.progression === 'worsening' && symptoms.discharge === 'yes';

    if (hasSevereSymptom || isWorseningWithDischarge) {
      return {
        urgencyLevel: 'prompt_evaluation',
        urgencyTitle: 'Prompt Dermatological Evaluation Recommended',
        urgencyMessage:
          'The reported acute symptom intensity (severe discomfort or progressive discharge) indicates that professional medical assessment should not be delayed.',
        isEmergency: false,
        recommendedAction:
          'Schedule an in-person appointment with a qualified dermatologist within 24 to 48 hours.',
      };
    }

    // 3. Professional Evaluation Recommended (Chronic duration, growing area, recurrence)
    const isChronic =
      symptoms.duration === 'several_weeks' ||
      symptoms.duration === 'over_a_month';
    const isModerateOrGrowing =
      symptoms.isAreaIncreasing ||
      symptoms.pain === 'moderate' ||
      symptoms.redness === 'moderate';

    if (isChronic || isModerateOrGrowing || symptoms.hasRecurred) {
      return {
        urgencyLevel: 'evaluation_recommended',
        urgencyTitle: 'Professional Healthcare Consultation Recommended',
        urgencyMessage:
          'The visual and symptom pattern warrants clinical evaluation by a board-certified dermatologist for definitive physical examination and tailored management.',
        isEmergency: false,
        recommendedAction:
          'Book a routine consultation with a local dermatologist or verified clinic at your convenience.',
      };
    }

    // 4. General Informational Guidance (Mild, stable, early onset)
    return {
      urgencyLevel: 'general_info',
      urgencyTitle: 'General Informational Guidance',
      urgencyMessage:
        'No immediate high-urgency indicators detected. The system provides supportive skin-health information and gentle barrier care precautions.',
      isEmergency: false,
      recommendedAction:
        'Monitor the area for changes. If symptoms persist or worsen, consult a qualified healthcare professional.',
    };
  },
};
