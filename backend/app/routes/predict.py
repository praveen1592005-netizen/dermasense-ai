"""
DermaSense AI — Hybrid Prediction API v2.0
==========================================
Endpoints:
  POST /predict              → Legacy single-prediction (kept for compatibility)
  POST /predict/hybrid       → New: Image Quality → EfficientNetV2B3 Top-5 → Gemini Report
  GET  /predict/classes      → List all supported disease classes
"""

import os, io, base64, json, httpx
import numpy as np
from typing import Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from PIL import Image

router = APIRouter()

# ─── Import inference module ─────────────────────────────────────────────────
try:
    import sys
    _backend = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    if _backend not in sys.path:
        sys.path.insert(0, _backend)
    from inference import (
        validate_image_quality, get_top5_predictions,
        decode_base64_image, get_class_names, model_is_loaded,
        ImageQualityError,
    )
    INFERENCE_AVAILABLE = True
except Exception as e:
    print(f"[DermaSense] inference.py not available: {e}")
    INFERENCE_AVAILABLE = False

# ─── Gemini config ───────────────────────────────────────────────────────────
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_URL     = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.5-flash:generateContent?key={key}"
)

# ─── Cancer risk thresholds ──────────────────────────────────────────────────
HIGH_RISK_DISEASES  = {"Melanoma", "Basal Cell Carcinoma", "Squamous Cell Carcinoma", "Actinic Keratosis"}
URGENT_THRESHOLD    = 0.70  # Melanoma confidence above this → URGENT warning

# ─── Curated fallback metadata per class ────────────────────────────────────
FALLBACK_META = {
    "Melanoma": {
        "severity": "Critical", "risk": "High",
        "needsDoctor": True,
        "urgency": "⚠️ URGENT — Schedule an appointment with a dermatologist within 1-2 days.",
    },
    "Basal Cell Carcinoma": {
        "severity": "Severe", "risk": "Moderate-High",
        "needsDoctor": True,
        "urgency": "Consult a dermatologist within 2-4 weeks.",
    },
    "Squamous Cell Carcinoma": {
        "severity": "Severe", "risk": "High",
        "needsDoctor": True,
        "urgency": "Consult a dermatologist urgently.",
    },
    "Actinic Keratosis": {
        "severity": "Moderate (Pre-cancerous)", "risk": "Moderate",
        "needsDoctor": True,
        "urgency": "Schedule a dermatological appointment within a month.",
    },
    "Melanocytic Nevi": {
        "severity": "Mild (Typically Benign)", "risk": "Low",
        "needsDoctor": False,
        "urgency": "Monitor monthly using the ABCDE rule.",
    },
    "Benign Keratosis": {
        "severity": "Mild", "risk": "Low",
        "needsDoctor": False,
        "urgency": "See a dermatologist if irritated or bleeds.",
    },
    "Dermatofibroma": {
        "severity": "Mild", "risk": "Low",
        "needsDoctor": False,
        "urgency": "Safe to leave untreated; consult if grows rapidly.",
    },
    "Vascular Lesion": {
        "severity": "Mild", "risk": "Low",
        "needsDoctor": False,
        "urgency": "No treatment needed unless cosmetic removal is desired.",
    },
    "Clear Skin": {
        "severity": "None — Healthy", "risk": "None",
        "needsDoctor": False,
        "urgency": "No action needed. Continue routine skincare.",
    },
}


# ══════════════════════════════════════════════════════════════════════════════
# REQUEST / RESPONSE MODELS
# ══════════════════════════════════════════════════════════════════════════════

class PatientInfo(BaseModel):
    age:            Optional[int]  = None
    gender:         Optional[str] = None
    body_location:  Optional[str] = None
    duration_days:  Optional[int] = None
    itching:        Optional[bool] = None
    pain:           Optional[bool] = None
    bleeding:       Optional[bool] = None
    growing:        Optional[bool] = None
    family_history: Optional[bool] = None


class HybridRequest(BaseModel):
    image_base64: str
    patient_info: Optional[PatientInfo] = None


class LegacyRequest(BaseModel):
    image_base64: str


# ══════════════════════════════════════════════════════════════════════════════
# GEMINI ORCHESTRATION
# ══════════════════════════════════════════════════════════════════════════════

async def call_gemini_explainer(
    top5: list[dict],
    patient: PatientInfo | None,
    image_b64: str,
) -> dict:
    """
    Gemini acts ONLY as a medical explainer — it does NOT diagnose.
    It receives the Top-5 CNN predictions + patient info.
    """
    if not GEMINI_API_KEY:
        return _fallback_explanation(top5)

    # Build patient context string
    patient_ctx = ""
    if patient:
        lines = []
        if patient.age:          lines.append(f"Age: {patient.age}")
        if patient.gender:       lines.append(f"Gender: {patient.gender}")
        if patient.body_location:lines.append(f"Body Location: {patient.body_location}")
        if patient.duration_days:lines.append(f"Duration: ~{patient.duration_days} days")
        if patient.itching  is not None: lines.append(f"Itching: {'Yes' if patient.itching else 'No'}")
        if patient.pain     is not None: lines.append(f"Pain: {'Yes' if patient.pain else 'No'}")
        if patient.bleeding is not None: lines.append(f"Bleeding: {'Yes' if patient.bleeding else 'No'}")
        if patient.growing  is not None: lines.append(f"Growing: {'Yes' if patient.growing else 'No'}")
        if patient.family_history is not None:
            lines.append(f"Family History of Skin Cancer: {'Yes' if patient.family_history else 'No'}")
        if lines:
            patient_ctx = "PATIENT INFORMATION:\n" + "\n".join(lines)

    top5_ctx = "CNN MODEL TOP-5 PREDICTIONS (do NOT override these):\n"
    for p in top5:
        top5_ctx += f"  {p['rank']}. {p['disease']} — {p['confidence']*100:.1f}%\n"

    prompt = f"""You are a senior medical AI assistant working alongside a dermatology CNN classifier.
Your role is STRICTLY to explain and elaborate on the CNN's findings. You must NOT make your own visual diagnosis.

{top5_ctx}

{patient_ctx}

Based on the CNN's PRIMARY diagnosis of "{top5[0]['disease']}" ({top5[0]['confidence']*100:.1f}% confidence), provide:

1. A clear, patient-friendly explanation of what "{top5[0]['disease']}" is.
2. Common symptoms the patient might experience.
3. Risk level and potential complications if untreated.
4. Recommended precautions.
5. Whether urgent dermatologist consultation is required.
6. A personalized skincare routine (5 steps) appropriate for this condition.

Respond ONLY with this exact JSON (no markdown, no extra text):
{{
  "explanation": "<2-3 clear sentences explaining the condition based on CNN result>",
  "symptoms": ["<symptom 1>", "<symptom 2>", "<symptom 3>"],
  "risks": "<what happens if untreated>",
  "precautions": ["<precaution 1>", "<precaution 2>", "<precaution 3>"],
  "skincare": ["<step 1>", "<step 2>", "<step 3>", "<step 4>", "<step 5>"],
  "treatment": "<first-line treatment options>",
  "consultation_advice": "<specific advice on when/how urgently to see a doctor>"
}}"""

    payload = {
        "contents": [{"parts": [
            {"inline_data": {"mime_type": "image/jpeg", "data": image_b64}},
            {"text": prompt},
        ]}],
        "generationConfig": {"temperature": 0.1, "maxOutputTokens": 1500},
    }

    try:
        async with httpx.AsyncClient(timeout=45) as client:
            for attempt in range(3):
                resp = await client.post(
                    GEMINI_URL.format(key=GEMINI_API_KEY),
                    headers={"Content-Type": "application/json"},
                    json=payload,
                )
                if resp.status_code == 200:
                    break
                if resp.status_code in (429, 503) and attempt < 2:
                    import asyncio
                    await asyncio.sleep(2 ** attempt * 2)
                    continue
                return _fallback_explanation(top5)

        data       = resp.json()
        candidates = data.get("candidates", [])
        if not candidates:
            return _fallback_explanation(top5)

        text = candidates[0]["content"]["parts"][0]["text"].strip()
        if text.startswith("```"):
            text = text.replace("```json", "").replace("```", "").strip()
        j = text[text.index("{"):text.rindex("}")+1]
        return json.loads(j)

    except Exception as e:
        print(f"[DermaSense] Gemini error: {e}")
        return _fallback_explanation(top5)


def _fallback_explanation(top5: list[dict]) -> dict:
    """Offline fallback when Gemini is unavailable."""
    disease = top5[0]["disease"]
    meta    = FALLBACK_META.get(disease, {})
    return {
        "explanation": f"The AI model identified this as {disease}. Please consult a dermatologist for a confirmed clinical diagnosis.",
        "symptoms": ["Skin changes in the affected area"],
        "risks": "Unknown without professional evaluation.",
        "precautions": ["Avoid sun exposure", "Do not scratch or pick the lesion", "Consult a dermatologist"],
        "skincare": [
            "Apply broad-spectrum SPF 30+ sunscreen daily",
            "Cleanse gently with pH-balanced cleanser",
            "Moisturize daily",
            "Avoid harsh chemicals on the area",
            "Schedule a professional skin check",
        ],
        "treatment": meta.get("urgency", "Consult a dermatologist."),
        "consultation_advice": meta.get("urgency", "Please consult a certified dermatologist."),
    }


# ══════════════════════════════════════════════════════════════════════════════
# CANCER RISK SCORING
# ══════════════════════════════════════════════════════════════════════════════

def compute_cancer_risk(top5: list[dict]) -> dict:
    """Compute a 0-100 cancer risk score based on Top-5 predictions."""
    cancer_prob = 0.0
    for pred in top5:
        if pred["disease"] in HIGH_RISK_DISEASES:
            cancer_prob += pred["confidence"]

    cancer_prob = min(cancer_prob, 1.0)

    if cancer_prob >= 0.70:
        level = "High"
        color = "red"
    elif cancer_prob >= 0.40:
        level = "Moderate"
        color = "orange"
    else:
        level = "Low"
        color = "green"

    # Check for urgent Melanoma case
    melanoma_conf = next(
        (p["confidence"] for p in top5 if p["disease"] == "Melanoma"), 0.0
    )
    is_urgent = melanoma_conf >= URGENT_THRESHOLD or cancer_prob >= URGENT_THRESHOLD

    return {
        "cancer_risk_score": round(cancer_prob * 100, 1),
        "cancer_risk_level": level,
        "cancer_risk_color": color,
        "urgent_consultation": is_urgent,
        "melanoma_confidence": round(melanoma_conf * 100, 1),
    }


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/classes")
def get_classes():
    """Return all supported disease classes."""
    if INFERENCE_AVAILABLE:
        return {"classes": get_class_names()}
    return {"classes": list(FALLBACK_META.keys())}


@router.post("/predict")
async def predict_legacy(request: LegacyRequest):
    """Legacy endpoint — kept for Flutter app compatibility."""
    hybrid_req = HybridRequest(image_base64=request.image_base64)
    result = await predict_hybrid(hybrid_req)
    # Map new format back to old format for backward compatibility
    top1 = result["top5"][0]
    meta = FALLBACK_META.get(top1["disease"], {})
    gemini = result.get("gemini_analysis", {})
    return {
        "result": {
            "disease":     top1["disease"],
            "confidence":  top1["confidence"],
            "severity":    meta.get("severity", "Unknown"),
            "risk":        meta.get("risk", "Unknown"),
            "explanation": gemini.get("explanation", ""),
            "treatment":   gemini.get("treatment", ""),
            "skincare":    gemini.get("skincare", []),
            "urgency":     gemini.get("consultation_advice", ""),
            "needsDoctor": meta.get("needsDoctor", False),
            "affected_area": "Uploaded Area",
            "contagious":  False,
            "symptoms":    gemini.get("symptoms", []),
        }
    }


@router.post("/predict/hybrid")
async def predict_hybrid(request: HybridRequest):
    """
    Full Hybrid Pipeline:
      1. Image Quality Validation
      2. EfficientNetV2-B3 → Top-5 Predictions
      3. Gemini → Medical Explanation
      4. Cancer Risk Scoring
      5. Complete Patient Report
    """
    # ── 1. Decode image ───────────────────────────────────────────────────────
    try:
        img_bytes = decode_base64_image(request.image_base64) if INFERENCE_AVAILABLE \
                    else base64.b64decode(request.image_base64)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 image data.")

    # ── 2. Image Quality Validation ──────────────────────────────────────────
    if INFERENCE_AVAILABLE:
        try:
            validate_image_quality(img_bytes)
        except ImageQualityError as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    # ── 3. CNN Top-5 Predictions ─────────────────────────────────────────────
    top5 = None
    if INFERENCE_AVAILABLE and model_is_loaded():
        top5 = get_top5_predictions(img_bytes)

    if not top5:
        # Model not available — use placeholder to still run Gemini
        top5 = [{"rank": 1, "disease": "Unknown", "confidence": 0.0}]
        model_used = "none"
    else:
        model_used = "EfficientNetV2-B3"

    # ── 4. Cancer Risk Scoring ────────────────────────────────────────────────
    risk_data = compute_cancer_risk(top5)

    # ── 5. Gemini Medical Explanation ────────────────────────────────────────
    gemini_result = await call_gemini_explainer(
        top5=top5,
        patient=request.patient_info,
        image_b64=request.image_base64,
    )

    # ── 6. Assemble final report ──────────────────────────────────────────────
    primary    = top5[0]
    meta       = FALLBACK_META.get(primary["disease"], {})

    return {
        "model_used":   model_used,
        "top5":         top5,
        "primary":      primary,
        "severity":     meta.get("severity", "Unknown"),
        "needs_doctor": meta.get("needsDoctor", True),
        "cancer_risk":  risk_data,
        "gemini_analysis": gemini_result,
        "patient_info": request.patient_info.dict() if request.patient_info else None,
    }
