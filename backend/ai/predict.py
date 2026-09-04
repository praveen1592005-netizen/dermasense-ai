"""
DermaSense AI — Core Prediction Pipeline
==========================================
Full inference pipeline:
  Uploaded image
  ↓ Validate file
  ↓ Decode image
  ↓ Convert RGB
  ↓ Image quality check (blur, brightness, contrast, resolution)
  ↓ Resize to 260×260
  ↓ EfficientNetV2B2 inference
  ↓ Raw probabilities
  ↓ Temperature calibration (from calibration_config.json)
  ↓ Final probabilities
  ↓ Predicted class + confidence
  ↓ Risk assessment
  ↓ API response

IMPORTANT:
- The FastAPI backend is the SINGLE source of truth for all ML inference.
- Do NOT perform inference in the frontend (Web or Mobile).
- Temperature is loaded from calibration_config.json — never hard-coded.
- Confidence below CONFIDENCE_THRESHOLD returns risk_level="UNCERTAIN".
- Risk level uses BOTH class risk mapping AND calibrated confidence.
"""

import io
import os
import logging
import numpy as np
from typing import Dict, Any

from .model_loader import get_model, get_config

logger = logging.getLogger(__name__)

# ── Class Labels (exact order from calibration_config.json) ──────────────────
# CRITICAL: Do not reorder. These correspond 1:1 to model output neurons.
CLASS_NAMES = ["MEL", "NV", "BCC", "AKIEC", "BKL", "DF", "VASC"]

# Human-readable display names
DISPLAY_NAMES = {
    "MEL":   "Melanoma",
    "NV":    "Melanocytic Nevi",
    "BCC":   "Basal Cell Carcinoma",
    "AKIEC": "Actinic Keratosis",
    "BKL":   "Benign Keratosis",
    "DF":    "Dermatofibroma",
    "VASC":  "Vascular Lesion",
}

# Class-level base risk mapping
# Risk level is ALSO gated by confidence — low confidence always → UNCERTAIN
CLASS_RISK_LEVELS = {
    "MEL":   "HIGH",
    "BCC":   "HIGH",
    "AKIEC": "HIGH",
    "VASC":  "MODERATE",
    "NV":    "LOW",
    "BKL":   "LOW",
    "DF":    "LOW",
}

# Configurable confidence threshold (below = UNCERTAIN)
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.60"))

MEDICAL_DISCLAIMER = (
    "This AI result is for screening and informational purposes only "
    "and is not a medical diagnosis."
)

# ── Image Quality Thresholds ──────────────────────────────────────────────────
MIN_RESOLUTION = 64          # pixels — absolute minimum per side
MAX_RESOLUTION = 8000        # pixels — sanity upper bound
BRIGHTNESS_MIN = 0.05        # fraction of max (0–1) — too dark
BRIGHTNESS_MAX = 0.97        # fraction of max (0–1) — too bright/overexposed
CONTRAST_MIN_STD = 0.015     # standard deviation — too uniform/blank
# Laplacian variance for [0,1]-normalised float images.
# Uniform/blank images give 0.0, noisy images give ~0.4, real skin photos > 0.003.
# Threshold must be < real photos (> 0.003) but > completely flat images (0.0).
BLUR_LAPLACIAN_MIN = 0.0008  # Laplacian variance — catches only flat/blank images


def _check_image_quality(img_array: np.ndarray, orig_width: int, orig_height: int) -> Dict[str, Any]:
    """
    Multi-factor image quality validation.
    Returns {"ok": bool, "reason": str}
    img_array: float32 numpy array in [0,1], shape (H, W, 3) — already resized to model input.
    orig_width, orig_height: original dimensions before resize.
    """
    # 1. Minimum resolution check (on original image dimensions)
    if orig_width < MIN_RESOLUTION or orig_height < MIN_RESOLUTION:
        return {
            "ok": False,
            "reason": (
                f"Image resolution {orig_width}×{orig_height} is too small. "
                "Please upload a higher quality image (minimum 64×64 pixels)."
            ),
        }

    # 2. Brightness check
    avg_brightness = float(np.mean(img_array))
    if avg_brightness < BRIGHTNESS_MIN:
        return {
            "ok": False,
            "reason": (
                "Image is too dark for reliable analysis. "
                "Please capture the photo in good natural lighting."
            ),
        }
    if avg_brightness > BRIGHTNESS_MAX:
        return {
            "ok": False,
            "reason": (
                "Image appears overexposed or washed out. "
                "Please reduce flash intensity or capture in diffused lighting."
            ),
        }

    # 3. Contrast / blank image check
    std_dev = float(np.std(img_array))
    if std_dev < CONTRAST_MIN_STD:
        return {
            "ok": False,
            "reason": (
                "Image has insufficient contrast — it may be blank or a solid colour. "
                "Please upload a clear photo of the skin area."
            ),
        }

    # 4. Blur detection using Laplacian variance (on grayscale)
    try:
        # Convert to grayscale manually (avoid OpenCV dependency)
        gray = (
            img_array[:, :, 0] * 0.2989
            + img_array[:, :, 1] * 0.5870
            + img_array[:, :, 2] * 0.1140
        )
        # Approximate Laplacian using finite differences
        lap_y = np.diff(gray, n=2, axis=0)
        lap_x = np.diff(gray, n=2, axis=1)
        laplacian_var = float(np.var(lap_y)) + float(np.var(lap_x))
        if laplacian_var < BLUR_LAPLACIAN_MIN:
            return {
                "ok": False,
                "reason": (
                    "Image appears blurry or out of focus. "
                    "Please hold the camera steady and ensure the skin area is in sharp focus."
                ),
            }
    except Exception as e:
        logger.warning(f"Blur detection failed: {e}")

    # 5. Skin detection heuristic: Red channel typically dominant in skin
    r = img_array[:, :, 0]
    g = img_array[:, :, 1]
    b = img_array[:, :, 2]
    
    skin_pixels = np.logical_and(np.logical_and(r > g, r > b), r > 0.1)
    skin_fraction = float(np.sum(skin_pixels)) / float(skin_pixels.size)
    
    if skin_fraction < 0.15:
        return {
            "ok": False,
            "reason": (
                "No skin or face detected. "
                "Please upload a clear photo of the skin area to be analyzed."
            ),
        }

    return {"ok": True, "reason": "Image quality acceptable."}


def _preprocess_image(image_bytes: bytes, input_size: int = 260):
    """
    Preprocess image bytes to match training pipeline:
    1. Decode JPEG / PNG / WebP
    2. Convert to RGB
    3. Resize to input_size × input_size (LANCZOS)
    4. Scale pixels to [0, 1]  ← matches EfficientNetV2 training preprocessing
    5. Add batch dimension → shape (1, H, W, 3)

    Returns: (img_array, orig_width, orig_height) or raises on error.
    """
    from PIL import Image
    img = Image.open(io.BytesIO(image_bytes))
    orig_width, orig_height = img.size

    if img.mode != "RGB":
        img = img.convert("RGB")

    img = img.resize((input_size, input_size), Image.LANCZOS)
    img_array = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(img_array, axis=0), orig_width, orig_height


def apply_temperature_scaling(probs: np.ndarray, temperature: float) -> np.ndarray:
    """
    Apply temperature scaling to calibrate model probabilities.
    Uses log-space approximation of logits from softmax outputs.
    Temperature < 1: sharpens distribution (more confident).
    Temperature > 1: softens distribution (more uncertain).
    """
    epsilon = 1e-7
    logits = np.log(probs + epsilon)
    scaled_logits = logits / temperature
    # Numerically stable softmax
    exp_logits = np.exp(scaled_logits - np.max(scaled_logits))
    return exp_logits / np.sum(exp_logits)


def _build_quality_error() -> Dict[str, Any]:
    """Standard IMAGE_QUALITY_INSUFFICIENT response."""
    return {
        "status": "IMAGE_QUALITY_INSUFFICIENT",
        "message": (
            "Image quality is insufficient for reliable AI screening. "
            "Please upload a clearer image."
        ),
        "medical_disclaimer": MEDICAL_DISCLAIMER,
    }


def _build_error_response(message: str) -> Dict[str, Any]:
    """Generic error response."""
    return {
        "status": "error",
        "message": message,
        "medical_disclaimer": MEDICAL_DISCLAIMER,
    }


async def run_prediction(image_bytes: bytes) -> Dict[str, Any]:
    """
    Main prediction pipeline. Returns the exact API response schema.

    Success response fields:
        status, possible_condition, display_name, confidence,
        risk_level, class_probabilities, model_name, model_version,
        recommendation, medical_disclaimer

    Error response fields:
        status, message, medical_disclaimer
    """
    model = get_model()
    config = get_config()

    if model is None or config is None:
        return _build_error_response(
            "AI model or calibration configuration not loaded. "
            "Please contact support or restart the backend."
        )

    # Extract calibration config values
    model_name = config.get("model_name", "DermaSense_EfficientNetV2B2")
    model_version = str(config.get("model_version", "1.0"))
    input_size = int(config.get("input_size", 260))
    temperature = float(config.get("temperature", 1.0))
    config_class_names = config.get("class_names", CLASS_NAMES)

    # ── Step 1: Decode and preprocess ────────────────────────────────────────
    try:
        img_batch, orig_w, orig_h = _preprocess_image(image_bytes, input_size)
    except Exception as e:
        logger.error(f"Image preprocessing / decode failed: {e}")
        # Could not decode image at all → quality error
        return _build_quality_error()

    # ── Step 2: Image quality check ───────────────────────────────────────────
    quality = _check_image_quality(img_batch[0], orig_w, orig_h)
    if not quality["ok"]:
        logger.info(f"Image quality check failed: {quality['reason']}")
        return _build_quality_error()

    # ── Step 3: Model inference ───────────────────────────────────────────────
    try:
        predictions = model.predict(img_batch, verbose=0)
        raw_probs = predictions[0]  # shape: (num_classes,)

        # Validate output matches expected class count
        if len(raw_probs) != len(config_class_names):
            logger.error(
                f"Model output has {len(raw_probs)} classes, "
                f"expected {len(config_class_names)} from config."
            )
            return _build_error_response(
                "Model class count mismatch. Please contact support."
            )

        # ── Step 4: Temperature calibration ───────────────────────────────────
        calibrated_probs = apply_temperature_scaling(raw_probs, temperature)

        # ── Step 5: Determine predicted class ─────────────────────────────────
        top_idx = int(np.argmax(calibrated_probs))
        confidence = float(calibrated_probs[top_idx])
        prediction_class = config_class_names[top_idx]
        display_name = DISPLAY_NAMES.get(prediction_class, prediction_class)
        base_risk = CLASS_RISK_LEVELS.get(prediction_class, "MODERATE")

        # Build class probabilities dict (rounded to 4 dp)
        class_probs = {
            config_class_names[i]: round(float(calibrated_probs[i]), 4)
            for i in range(len(config_class_names))
        }

        # ── Step 6: Risk assessment ────────────────────────────────────────────
        # Risk uses BOTH class-level risk AND confidence gate.
        # Low confidence → UNCERTAIN regardless of class.
        if confidence < CONFIDENCE_THRESHOLD:
            return {
                "status": "success",
                "possible_condition": prediction_class,
                "display_name": display_name,
                "confidence": round(confidence, 4),
                "risk_level": "UNCERTAIN",
                "class_probabilities": class_probs,
                "model_name": model_name,
                "model_version": model_version,
                "message": "AI confidence is too low to provide a reliable screening result.",
                "recommendation": "Professional medical evaluation is recommended.",
                "medical_disclaimer": MEDICAL_DISCLAIMER,
            }

        # Sufficient confidence — use class-based risk
        risk_level = base_risk

        # Build recommendation per risk level
        if risk_level == "HIGH":
            recommendation = (
                "⚠️ This AI screening result may indicate a condition that requires "
                "professional medical evaluation. Please consult a qualified dermatologist "
                "or visit a dermatology hospital for proper examination."
            )
        elif risk_level == "MODERATE":
            recommendation = (
                "Consider consulting a dermatologist for a professional evaluation. "
                "Monitor the area for any changes in size, colour, or texture."
            )
        else:  # LOW
            recommendation = (
                "Maintain a regular skincare routine. Keep the area clean and moisturised. "
                "Monitor for any changes and consult a dermatologist if concerned."
            )

        return {
            "status": "success",
            "possible_condition": prediction_class,
            "display_name": display_name,
            "confidence": round(confidence, 4),
            "risk_level": risk_level,
            "class_probabilities": class_probs,
            "model_name": model_name,
            "model_version": model_version,
            "recommendation": recommendation,
            "medical_disclaimer": MEDICAL_DISCLAIMER,
        }

    except Exception as e:
        logger.error(f"Model inference failed: {e}", exc_info=True)
        return _build_error_response(
            "AI inference failed. Please try again with a different image."
        )
