"""
DermaSense AI — Skin Disease AI Service
=========================================
Loads and runs EfficientNetV2 model inference for skin disease classification.

IMPORTANT: This service will NEVER fabricate predictions.
- If model file is missing  → returns status: "model_not_configured"
- If image is invalid       → returns status: "invalid_image"
- If image quality is poor  → returns status: "poor_quality"
- If inference fails        → returns status: "inference_error"

Class labels follow the exact HAM10000 dataset class order.
DO NOT modify CLASS_LABELS without retraining or verifying model output indices.

HAM10000 Dataset Source: https://www.kaggle.com/datasets/kmader/skin-lesion-analysis-toward-melanoma-detection
"""

import os
import io
import logging
import numpy as np
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

# ─── Class Labels ─────────────────────────────────────────────────────────────
# These are the EXACT class labels from the HAM10000 dataset in index order.
# Index 0 corresponds to the first output neuron, Index 6 to the last.
# Source: HAM10000 (Human Against Machine with 10000 training images)
# DO NOT reorder or rename without confirming model output index mapping.
CLASS_LABELS = [
    "Actinic Keratosis",          # 0 — akiec (pre-cancerous, requires evaluation)
    "Basal Cell Carcinoma",       # 1 — bcc   (most common skin cancer)
    "Benign Keratosis",           # 2 — bkl   (seborrheic keratosis, solar lentigo)
    "Dermatofibroma",             # 3 — df    (benign fibrous nodule)
    "Melanoma",                   # 4 — mel   (serious, requires urgent evaluation)
    "Melanocytic Nevi",           # 5 — nv    (common mole — most frequent class)
    "Vascular Lesion",            # 6 — vasc  (angiomas, angiokeratomas, pyogenic granuloma)
]

# Class-specific risk levels (controlled, not LLM-decided)
CLASS_RISK_LEVELS = {
    "Actinic Keratosis":    "HIGH",
    "Basal Cell Carcinoma": "HIGH",
    "Benign Keratosis":     "LOW",
    "Dermatofibroma":       "LOW",
    "Melanoma":             "HIGH",
    "Melanocytic Nevi":     "LOW",
    "Vascular Lesion":      "MODERATE",
}

# Classes that always require doctor consultation regardless of confidence
HIGH_RISK_CLASSES = {"Actinic Keratosis", "Basal Cell Carcinoma", "Melanoma"}

# Confidence thresholds (configurable via .env)
CONFIDENCE_HIGH = float(os.getenv("CONFIDENCE_HIGH", "0.80"))
CONFIDENCE_MODERATE = float(os.getenv("CONFIDENCE_MODERATE", "0.60"))

# Model input configuration — MUST match training preprocessing
MODEL_INPUT_SIZE = int(os.getenv("SKIN_MODEL_INPUT_SIZE", "224"))
MODEL_PATH = Path(os.getenv("SKIN_MODEL_PATH", "models/skin_model.keras"))

# Module-level model cache (loaded once on first use)
_model = None
_model_load_attempted = False


def _get_confidence_level(confidence: float) -> str:
    if confidence >= CONFIDENCE_HIGH:
        return "HIGH"
    elif confidence >= CONFIDENCE_MODERATE:
        return "MODERATE"
    return "LOW"


def _load_model():
    """Load the EfficientNetV2 model from disk. Called once and cached."""
    global _model, _model_load_attempted
    if _model_load_attempted:
        return _model
    _model_load_attempted = True

    if not MODEL_PATH.exists():
        logger.warning(
            f"Skin model not found at: {MODEL_PATH.resolve()}. "
            "Place your trained model at this path to enable predictions."
        )
        return None

    try:
        import tensorflow as tf
        logger.info(f"Loading skin AI model from {MODEL_PATH} ...")
        _model = tf.keras.models.load_model(str(MODEL_PATH))
        logger.info(
            f"Skin AI model loaded. Input shape: {_model.input_shape}. "
            f"Output classes: {_model.output_shape[-1]}"
        )
        # Validate output class count matches our label list
        output_classes = _model.output_shape[-1]
        if output_classes != len(CLASS_LABELS):
            logger.error(
                f"CRITICAL: Model outputs {output_classes} classes but "
                f"CLASS_LABELS has {len(CLASS_LABELS)} entries. "
                "Predictions disabled to prevent incorrect disease names."
            )
            _model = None
    except Exception as e:
        logger.error(f"Failed to load skin AI model: {e}")
        _model = None

    return _model


def _check_image_quality(img_array: np.ndarray) -> dict:
    """
    Basic image quality validation before inference.
    Returns dict with is_usable bool and reason string.
    """
    # Check average brightness
    avg_brightness = float(np.mean(img_array))
    if avg_brightness < 0.08:  # Too dark (< ~20/255)
        return {"is_usable": False, "reason": "Image appears too dark. Please capture in good natural lighting."}
    if avg_brightness > 0.95:  # Too bright / overexposed
        return {"is_usable": False, "reason": "Image appears overexposed. Please reduce glare or flash."}

    # Check contrast (std dev of pixel values)
    std_dev = float(np.std(img_array))
    if std_dev < 0.02:  # Extremely low contrast = likely blank/solid image
        return {"is_usable": False, "reason": "Image has insufficient contrast for analysis. Please upload a clear skin photo."}

    return {"is_usable": True, "reason": "Image quality acceptable."}


def _preprocess_image(image_bytes: bytes) -> Optional[np.ndarray]:
    """
    Preprocess image bytes to match EfficientNetV2 training pipeline:
    1. Decode JPEG/PNG/WebP
    2. Convert to RGB
    3. Resize to MODEL_INPUT_SIZE x MODEL_INPUT_SIZE
    4. Scale pixels to [0, 1] (matching EfficientNetV2 preprocessing)
    5. Add batch dimension → shape (1, H, W, 3)
    """
    try:
        from PIL import Image
        img = Image.open(io.BytesIO(image_bytes))

        # Convert to RGB (handles RGBA, grayscale, palette modes)
        if img.mode != "RGB":
            img = img.convert("RGB")

        # Resize using LANCZOS resampling (high quality)
        img = img.resize((MODEL_INPUT_SIZE, MODEL_INPUT_SIZE), Image.LANCZOS)

        # Convert to float32 numpy array and scale to [0, 1]
        img_array = np.array(img, dtype=np.float32) / 255.0

        # Add batch dimension
        return np.expand_dims(img_array, axis=0)

    except Exception as e:
        logger.error(f"Image preprocessing failed: {e}")
        return None


async def analyze_skin_image(image_bytes: bytes, filename: str = "") -> dict:
    """
    Main inference function. Returns a structured prediction dict.

    Returns:
        {
            "status": "prediction_available" | "model_not_configured" |
                      "invalid_image" | "poor_quality" | "inference_error" |
                      "class_mapping_error" | "low_confidence",
            "condition": str,
            "confidence": float,
            "confidence_percentage": int,
            "confidence_level": "HIGH" | "MODERATE" | "LOW",
            "risk_level": "HIGH" | "MODERATE" | "LOW" | "UNCERTAIN",
            "hospital_recommended": bool,
            "top_k": [{"condition": str, "confidence": float, "confidence_percentage": int}],
            "model": str,
            "class_count": int,
            "message": str,
        }
    """
    model = _load_model()

    # ── Model not configured ──────────────────────────────────────────────────
    if model is None:
        return {
            "status": "model_not_configured",
            "message": (
                "Skin analysis model is not configured. "
                f"Please place a trained model at: {MODEL_PATH.resolve()}"
            ),
            "condition": None,
            "confidence": None,
            "confidence_percentage": None,
            "confidence_level": None,
            "risk_level": "UNCERTAIN",
            "hospital_recommended": True,
            "top_k": [],
            "model": "EfficientNetV2 (Not Loaded)",
            "class_count": len(CLASS_LABELS),
        }

    # ── Preprocess image ──────────────────────────────────────────────────────
    img_array = _preprocess_image(image_bytes)
    if img_array is None:
        return {
            "status": "invalid_image",
            "message": "Unable to decode image. Please upload a valid JPG, PNG, or WebP file.",
            "condition": None,
            "confidence": None,
            "confidence_percentage": None,
            "confidence_level": None,
            "risk_level": "UNCERTAIN",
            "hospital_recommended": True,
            "top_k": [],
            "model": "EfficientNetV2",
            "class_count": len(CLASS_LABELS),
        }

    # ── Image quality check ───────────────────────────────────────────────────
    quality = _check_image_quality(img_array[0])
    if not quality["is_usable"]:
        return {
            "status": "poor_quality",
            "message": quality["reason"],
            "condition": None,
            "confidence": None,
            "confidence_percentage": None,
            "confidence_level": None,
            "risk_level": "UNCERTAIN",
            "hospital_recommended": True,
            "top_k": [],
            "model": "EfficientNetV2",
            "class_count": len(CLASS_LABELS),
        }

    # ── Run inference ─────────────────────────────────────────────────────────
    try:
        import tensorflow as tf
        predictions = model.predict(img_array, verbose=0)
        probs = predictions[0]  # Shape: (num_classes,)

        # Validate output shape
        if len(probs) != len(CLASS_LABELS):
            return {
                "status": "class_mapping_error",
                "message": (
                    f"Model output has {len(probs)} classes but CLASS_LABELS "
                    f"defines {len(CLASS_LABELS)}. "
                    "Model class mapping is not configured correctly. "
                    "Prediction suppressed to prevent incorrect disease names."
                ),
                "condition": None,
                "confidence": None,
                "confidence_percentage": None,
                "confidence_level": None,
                "risk_level": "UNCERTAIN",
                "hospital_recommended": True,
                "top_k": [],
                "model": "EfficientNetV2",
                "class_count": len(CLASS_LABELS),
            }

        # Get top prediction
        top_idx = int(np.argmax(probs))
        top_confidence = float(probs[top_idx])
        top_condition = CLASS_LABELS[top_idx]
        confidence_level = _get_confidence_level(top_confidence)

        # Get top-3 predictions for display
        top3_indices = np.argsort(probs)[::-1][:3]
        top_k = [
            {
                "condition": CLASS_LABELS[int(i)],
                "confidence": float(probs[int(i)]),
                "confidence_percentage": int(round(float(probs[int(i)]) * 100)),
            }
            for i in top3_indices
        ]

        # Determine risk level
        if confidence_level == "LOW":
            risk_level = "UNCERTAIN"
            hospital_recommended = True
        else:
            risk_level = CLASS_RISK_LEVELS.get(top_condition, "MODERATE")
            if top_condition in HIGH_RISK_CLASSES and risk_level != "HIGH":
                risk_level = "HIGH"
                
            hospital_recommended = (
                risk_level == "HIGH" or risk_level == "UNCERTAIN"
            )

        # Low confidence: don't force a diagnosis
        if confidence_level == "LOW":
            return {
                "status": "low_confidence",
                "message": (
                    f"AI model confidence is too low ({int(top_confidence * 100)}%) "
                    "for a reliable prediction. "
                    "Please upload a clearer, well-lit image of the affected skin area."
                ),
                "condition": top_condition,  # Still return for reference
                "confidence": top_confidence,
                "confidence_percentage": int(round(top_confidence * 100)),
                "confidence_level": "LOW",
                "risk_level": "UNCERTAIN",
                "hospital_recommended": True,
                "top_k": top_k,
                "model": "EfficientNetV2",
                "class_count": len(CLASS_LABELS),
            }

        return {
            "status": "prediction_available",
            "message": f"AI analysis complete. Detected: {top_condition} ({int(top_confidence * 100)}% confidence).",
            "condition": top_condition,
            "confidence": top_confidence,
            "confidence_percentage": int(round(top_confidence * 100)),
            "confidence_level": confidence_level,
            "risk_level": risk_level,
            "hospital_recommended": hospital_recommended,
            "top_k": top_k,
            "model": "EfficientNetV2",
            "class_count": len(CLASS_LABELS),
        }

    except Exception as e:
        logger.error(f"Model inference failed: {e}", exc_info=True)
        return {
            "status": "inference_error",
            "message": f"Model inference error: {str(e)}",
            "condition": None,
            "confidence": None,
            "confidence_percentage": None,
            "confidence_level": None,
            "risk_level": "UNCERTAIN",
            "hospital_recommended": True,
            "top_k": [],
            "model": "EfficientNetV2",
            "class_count": len(CLASS_LABELS),
        }
