import {
  DiseaseAnalysis,
  DiseaseImage,
  SymptomProfile,
  PossibleCategory,
  ModelPrediction,
} from '../types/disease';
import { triageService } from './triageService';
import { reportService } from './reportService';
import { Report } from '../types/report';
import { apiClient } from './apiClient';

const DISEASE_STORAGE_KEY = 'dermasense_disease_analyses_v6';

// AI chat routes are at /api/ai/* (not under /api/v1)
const _API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const AI_HOST_URL = _API_BASE.replace(/\/api\/v1\/?$/, '');

/**
 * Maps the backend /api/v1/predict response to the frontend ModelPrediction type.
 *
 * Backend response schema:
 *   status: "success" | "IMAGE_QUALITY_INSUFFICIENT" | "error"
 *   possible_condition: string   (e.g. "NV", "MEL", "BCC")
 *   display_name: string         (e.g. "Melanocytic Nevi")
 *   confidence: float            (0.0 – 1.0)
 *   risk_level: "LOW"|"MODERATE"|"HIGH"|"UNCERTAIN"
 *   class_probabilities: {MEL: float, NV: float, ...}
 *   model_name: string
 *   model_version: string
 *   recommendation: string
 *   medical_disclaimer: string
 *   message: string (on UNCERTAIN or error)
 */
function mapBackendResponse(backendResponse: Record<string, any>): ModelPrediction {
  const status = backendResponse.status as string;
  const riskLevel = backendResponse.risk_level ?? 'UNCERTAIN';

  if (status === 'IMAGE_QUALITY_INSUFFICIENT') {
    return {
      status: 'image_quality_insufficient',
      condition: null,
      confidence: null,
      confidence_percentage: null,
      confidence_level: null,
      risk_level: 'UNCERTAIN',
      hospital_recommended: true,
      top_k: [],
      model: backendResponse.model_name ?? 'DermaSense_EfficientNetV2B2',
      class_count: 7,
      message: backendResponse.message ?? 'Image quality is insufficient for reliable AI screening.',
      medical_disclaimer: backendResponse.medical_disclaimer,
      class_probabilities: null,
      model_name: backendResponse.model_name,
      model_version: backendResponse.model_version,
    };
  }

  if (status === 'error') {
    return {
      status: 'inference_error',
      condition: null,
      confidence: null,
      confidence_percentage: null,
      confidence_level: null,
      risk_level: 'UNCERTAIN',
      hospital_recommended: true,
      top_k: [],
      model: backendResponse.model_name ?? 'DermaSense_EfficientNetV2B2',
      class_count: 7,
      message: backendResponse.message ?? 'AI inference failed. Please try again.',
      medical_disclaimer: backendResponse.medical_disclaimer,
      class_probabilities: null,
      model_name: backendResponse.model_name,
      model_version: backendResponse.model_version,
    };
  }

  // status === 'success' — may still be UNCERTAIN if confidence < threshold
  const confidence = backendResponse.confidence ?? null;
  const confidencePct = confidence !== null ? Math.round(confidence * 100) : null;
  const confLevel =
    confidence === null ? null
    : confidence >= 0.80 ? 'HIGH'
    : confidence >= 0.60 ? 'MODERATE'
    : 'LOW';

  const isUncertain = riskLevel === 'UNCERTAIN';
  const isHighRisk = riskLevel === 'HIGH';

  return {
    // Map possible_condition (not "prediction" — that's a different old field)
    status: isUncertain ? 'low_confidence' : 'prediction_available',
    condition: backendResponse.possible_condition ?? null,
    display_name: backendResponse.display_name ?? backendResponse.possible_condition ?? null,
    confidence,
    confidence_percentage: confidencePct,
    confidence_level: confLevel,
    risk_level: riskLevel,
    hospital_recommended: isHighRisk || isUncertain,
    top_k: [],
    model: backendResponse.model_name ?? 'DermaSense_EfficientNetV2B2',
    class_count: 7,
    message: backendResponse.message ?? backendResponse.recommendation ?? '',
    recommendation: backendResponse.recommendation ?? '',
    medical_disclaimer: backendResponse.medical_disclaimer ?? '',
    class_probabilities: backendResponse.class_probabilities ?? null,
    model_name: backendResponse.model_name,
    model_version: backendResponse.model_version,
  };
}

export const diseaseAnalysisService = {
  /**
   * Runs skin disease analysis.
   *
   * When backend is available:
   *   1. Sends image to EfficientNetV2B2 via POST /api/v1/predict
   *   2. Gets real disease prediction + confidence + risk level
   *   3. Gets Ollama-generated explanation (from /api/skin/analyze if needed)
   *
   * When backend is unavailable:
   *   - Returns modelPrediction.status = "backend_unavailable"
   *   - NEVER shows a fake prediction
   *   - Still runs triage logic on symptoms
   */
  async runScreening(
    userId: string,
    images: DiseaseImage[],
    symptoms: SymptomProfile
  ): Promise<DiseaseAnalysis> {
    const triage = triageService.evaluateTriage(symptoms);
    const isEmergency = triage.isEmergency;

    // Build symptoms data for backend
    const symptomsPayload: Record<string, string | boolean | string[]> = {
      itching: symptoms.itching,
      pain: symptoms.pain,
      redness: symptoms.redness,
      swelling: String(symptoms.swelling),
      discharge: symptoms.discharge,
      duration: symptoms.duration,
      progression: symptoms.progression,
      is_area_increasing: String(symptoms.isAreaIncreasing),
      has_recurred: String(symptoms.hasRecurred),
      body_locations: symptoms.bodyLocations.join(', '),
      additional_symptoms: symptoms.additionalSymptoms.join(', '),
    };

    let modelPrediction: ModelPrediction | null = null;
    let aiExplanation: string | null = null;
    let aiLifestyleGuidance: string | null = null;
    let backendConnected = false;

    // ── Attempt real backend analysis ────────────────────────────────────────
    if (images.length > 0) {
      try {
        // Fetch the first image file from its previewUrl
        const imagePreviewUrl = images[0].previewUrl;
        let imageBlob: Blob | null = null;

        if (imagePreviewUrl.startsWith('data:')) {
          const response = await fetch(imagePreviewUrl);
          imageBlob = await response.blob();
        } else if (imagePreviewUrl.startsWith('blob:')) {
          imageBlob = await fetch(imagePreviewUrl).then((r) => r.blob());
        }

        if (imageBlob) {
          const formData = new FormData();
          const fileExt = imageBlob.type.includes('png') ? 'png' : 'jpg';
          formData.append('image', imageBlob, `skin_image.${fileExt}`);
          // Note: user_id is not required by /api/v1/predict but needed by /api/skin/analyze
          // We use the lighter /api/v1/predict endpoint here for prediction only

          const backendResponse = await apiClient.post('/predict', formData);
          backendConnected = true;

          // Map backend response to ModelPrediction type
          modelPrediction = mapBackendResponse(backendResponse);

          // If prediction available and not uncertain, attempt Ollama explanation
          if (
            modelPrediction.status === 'prediction_available' &&
            modelPrediction.risk_level !== 'UNCERTAIN'
          ) {
            try {
              const explainPayload = {
                condition: modelPrediction.display_name ?? modelPrediction.condition,
                confidence_percentage: modelPrediction.confidence_percentage,
                confidence_level: modelPrediction.confidence_level,
                risk_level: modelPrediction.risk_level,
                symptoms: Object.entries(symptomsPayload)
                  .filter(([, v]) => v && v !== 'no' && v !== 'none' && v !== 'false')
                  .map(([k, v]) => `${k}: ${v}`),
              };
              const explainFetch = await fetch(`${AI_HOST_URL}/api/ai/explain-result`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(explainPayload),
              });
              const explainResp = explainFetch.ok ? await explainFetch.json() : null;
              if (explainResp?.success) {
                aiExplanation = explainResp.explanation ?? null;
              }
            } catch {
              // Ollama explanation is non-fatal
            }
          }
        }
      } catch (error: unknown) {
        const isNetworkError =
          error instanceof TypeError ||
          (error instanceof Error &&
            (error.name === 'AbortError' || error.name === 'TimeoutError'));

        if (isNetworkError) {
          modelPrediction = {
            status: 'backend_unavailable',
            condition: null,
            confidence: null,
            confidence_percentage: null,
            confidence_level: null,
            risk_level: 'UNCERTAIN',
            hospital_recommended: true,
            top_k: [],
            model: 'EfficientNetV2B2',
            class_count: 7,
            message:
              'Skin analysis backend is not running. Start it with: cd backend && uvicorn main:app --reload',
          };
        } else {
          modelPrediction = {
            status: 'inference_error',
            condition: null,
            confidence: null,
            confidence_percentage: null,
            confidence_level: null,
            risk_level: 'UNCERTAIN',
            hospital_recommended: true,
            top_k: [],
            model: 'EfficientNetV2B2',
            class_count: 7,
            message: 'Image analysis failed. Please try again with a clearer image.',
          };
        }
      }
    }

    // ── Symptom-based categories (always computed for safety screening) ──────
    const possibleCategories: PossibleCategory[] = [];
    const observations: string[] = [];

    if (isEmergency) {
      possibleCategories.push({
        categoryName: 'Acute Urgent Assessment Required',
        confidencePct: 92,
        description: 'Reported symptoms indicate severe acute reactions requiring immediate medical triage.',
        keyIndicators: symptoms.redFlagDetails || ['Acute respiratory or facial swelling markers'],
      });
      observations.push('Critical red-flag indicators reported during symptom intake.');
    } else if (
      symptoms.itching === 'severe' ||
      symptoms.itching === 'moderate' ||
      symptoms.additionalSymptoms.includes('scaling') ||
      symptoms.additionalSymptoms.includes('dryness')
    ) {
      possibleCategories.push({
        categoryName: 'Inflammatory / Eczematous-like Pattern',
        confidencePct: 78,
        description:
          'Symptom characteristics suggest an inflammatory barrier disturbance. Image AI model provides the specific detection.',
        keyIndicators: [
          `Reported ${symptoms.itching} pruritus (itching)`,
          `Erythema (redness) severity: ${symptoms.redness}`,
          `Duration category: ${symptoms.duration.replace('_', ' ')}`,
        ],
      });
      observations.push('Erythematous presentation with reported pruritic discomfort noted in symptom intake.');
    } else if (symptoms.additionalSymptoms.includes('blister') || symptoms.discharge === 'yes') {
      possibleCategories.push({
        categoryName: 'Vesicular / Exudative Inflammatory Pattern',
        confidencePct: 72,
        description:
          'Symptom pattern characterized by possible fluid-filled vesicle formation or exudative changes.',
        keyIndicators: ['Vesicular appearance', 'Active fluid discharge reported'],
      });
      observations.push('Localized exudative activity reported in symptoms.');
    } else if (
      symptoms.additionalSymptoms.includes('color_change') ||
      symptoms.additionalSymptoms.includes('lesion_growth')
    ) {
      possibleCategories.push({
        categoryName: 'Pigmentary / Lesional Assessment Pattern',
        confidencePct: 68,
        description:
          'Pigmentation variation or structural lesion changes observed — dermoscopy by a specialist recommended.',
        keyIndicators: ['Color asymmetry reported', 'Reported area progression'],
      });
      observations.push('Focal pigment variation noted in patient-reported symptoms.');
    } else {
      possibleCategories.push({
        categoryName: 'Mild Inflammatory / Papular Appearance',
        confidencePct: 65,
        description: 'Mild non-specific inflammatory pattern without acute emergency or high-risk markers.',
        keyIndicators: ['Mild erythema', 'Localized distribution'],
      });
      observations.push('Superficial localized erythema with stable boundaries per symptom report.');
    }

    const precautions = [
      'Avoid harsh mechanical scrubbing, picking, or scratching the affected area.',
      'Cleanse with mild, fragrance-free, pH-balanced cleansers and lukewarm water.',
      'Do not apply unverified home remedies, strong acids, or prescription steroid creams without doctor guidance.',
      'If you notice spreading redness, increasing pain, or systemic fever, seek in-person medical evaluation.',
    ];

    const lifestyleGuidance = [
      'Maintain optimal skin barrier hydration with bland, ceramide-based emollients.',
      'Ensure adequate daily fluid intake to support cellular hydration.',
      'Avoid tight, friction-inducing synthetic clothing over affected body sites.',
    ];

    const nutritionGuidance = [
      'Focus on a balanced, anti-inflammatory whole-foods dietary pattern.',
      'Incorporate antioxidant-rich leafy greens, berries, and omega-3 fatty acids.',
    ];

    // Determine model version label
    let modelVersionLabel = 'DermaVision-Hybrid-v2.4 (Symptom Analysis)';
    if (modelPrediction && backendConnected) {
      if (modelPrediction.status === 'prediction_available') {
        const condLabel = modelPrediction.display_name ?? modelPrediction.condition;
        modelVersionLabel = `EfficientNetV2B2 (${condLabel} — ${modelPrediction.confidence_percentage}% confidence)`;
      } else if (modelPrediction.status === 'image_quality_insufficient') {
        modelVersionLabel = 'EfficientNetV2B2 (Image quality insufficient)';
      } else if (modelPrediction.status === 'low_confidence') {
        modelVersionLabel = `EfficientNetV2B2 (Low confidence — ${modelPrediction.confidence_percentage}%)`;
      } else if (modelPrediction.status === 'backend_unavailable') {
        modelVersionLabel = 'Backend offline — start with: cd backend && uvicorn main:app --reload';
      } else {
        modelVersionLabel = `EfficientNetV2B2 (${modelPrediction.status})`;
      }
    }

    const analysis: DiseaseAnalysis = {
      id: `dis_${Date.now().toString().slice(-8)}`,
      userId,
      createdAt: new Date().toISOString(),
      images,
      symptomProfile: symptoms,
      urgencyLevel: triage.urgencyLevel,
      urgencyMessage: triage.urgencyMessage,
      possibleCategories,
      observations,
      precautions,
      lifestyleGuidance,
      nutritionGuidance,
      disclaimer:
        'Medical Disclaimer: DermaSense AI provides AI-assisted informational screening and does not provide a definitive medical diagnosis. AI screening results may be inaccurate or incomplete. A qualified healthcare professional must evaluate your skin condition before starting any treatment.',
      modelVersion: modelVersionLabel,
      isEmergencyRedFlag: isEmergency,
      // Real AI fields
      modelPrediction,
      aiExplanation,
      aiLifestyleGuidance,
      aiAvailable: !!aiExplanation,
      backendConnected,
    };

    // Generate and save report (non-fatal)
    try {
      if (
        backendConnected &&
        userId !== 'usr_guest' &&
        modelPrediction?.status === 'prediction_available'
      ) {
        const reportData: Partial<Report> = {
          title: 'Skin Disease Screening',
          type: 'disease',
          date: analysis.createdAt,
          status: 'ready',
          summary: `AI Screening: ${modelPrediction.display_name ?? modelPrediction.condition} (${modelPrediction.confidence_percentage}% confidence, ${modelPrediction.risk_level} risk)`,
          imagePreview: images.length > 0 ? images[0].previewUrl : undefined,
          observations: analysis.observations,
          recommendations: [
            ...analysis.precautions,
            ...(modelPrediction.recommendation ? [modelPrediction.recommendation] : []),
          ],
          lifestyleGuidance: analysis.lifestyleGuidance,
          nutritionGuidance: analysis.nutritionGuidance,
          symptoms: Object.entries(symptomsPayload)
            .filter(([k, v]) => v && v !== 'no' && v !== 'none')
            .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`),
          prediction: modelPrediction?.condition ?? undefined,
          confidence: modelPrediction?.confidence ?? undefined,
          riskLevel: modelPrediction?.risk_level ?? undefined,
          hospitalRecommendation: modelPrediction?.hospital_recommended,
          modelName: modelPrediction?.model_name ?? modelPrediction?.model,
          modelVersion: analysis.modelVersion,
        };

        const reportId = await reportService.createReport(userId, reportData);
        console.log('Saved skin disease report with ID:', reportId);
      }
    } catch (e) {
      console.error('Failed to automatically save disease analysis report', e);
    }

    return analysis;
  },

  async saveAnalysis(_analysis: DiseaseAnalysis): Promise<void> {
    // Deprecated: backend automatically saves the analysis during /api/skin/analyze
  },

  async getUserAnalyses(userId: string = 'usr_guest'): Promise<DiseaseAnalysis[]> {
    try {
      const response = await apiClient.get(`/skin/history?user_id=${userId}`);
      if (response.success && response.analyses) {
        return response.analyses.map((item: any) => ({
          id: item.id,
          userId: item.user_id,
          createdAt: item.created_at,
          images: [{ previewUrl: item.image_storage_path }],
          modelPrediction: {
            condition: item.condition,
            confidence: item.confidence,
            confidence_percentage: item.confidence ? Math.round(item.confidence * 100) : null,
            risk_level: item.risk_level,
          },
        }));
      }
      return [];
    } catch {
      return [];
    }
  },

  async getAnalysisById(_id: string): Promise<DiseaseAnalysis | null> {
    return null;
  },

  async deleteAnalysis(_id: string): Promise<boolean> {
    return true;
  },
};
