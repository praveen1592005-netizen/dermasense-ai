"""
DermaSense AI — Inference Pipeline v2.0
========================================
Handles:
  - Image Quality Validation (blur, brightness, contrast)
  - EfficientNetV2-B3 Top-5 Predictions
  - Patient metadata injection

Used by: backend/app/routes/predict.py
"""

import io, os, base64
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance
import cv2

try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR    = os.path.join(os.path.dirname(BASE_DIR), "model")
MODEL_PATH   = os.path.join(MODEL_DIR, "dermasense_model.keras")
CLASSES_PATH = os.path.join(BASE_DIR, "model_classes.txt")

# ─── Image quality thresholds ────────────────────────────────────────────────
BLUR_THRESHOLD        = 80.0   # Laplacian variance; < this = too blurry
BRIGHTNESS_MIN        = 40.0   # Average brightness; below = too dark
BRIGHTNESS_MAX        = 220.0  # Average brightness; above = overexposed
IMAGE_SIZE            = (300, 300)
TOP_K                 = 5


# ─── Load model + classes once ───────────────────────────────────────────────
_model       = None
_class_names = []

def _load_artifacts():
    global _model, _class_names

    # Load class names
    if os.path.exists(CLASSES_PATH):
        with open(CLASSES_PATH, "r") as f:
            _class_names = [l.strip() for l in f if l.strip()]
    else:
        # fallback defaults
        _class_names = [
            "Actinic Keratosis", "Basal Cell Carcinoma", "Benign Keratosis",
            "Clear Skin", "Dermatofibroma", "Melanocytic Nevi",
            "Melanoma", "Squamous Cell Carcinoma", "Vascular Lesion",
        ]

    # Load TF model
    if TF_AVAILABLE and os.path.exists(MODEL_PATH):
        try:
            _model = tf.keras.models.load_model(MODEL_PATH)
            print(f"[DermaSense] ✅ EfficientNetV2-B3 model loaded from {MODEL_PATH}")
        except Exception as e:
            print(f"[DermaSense] ❌ Failed to load model: {e}")
    else:
        print("[DermaSense] ⚠️  No model file found. Gemini-only mode active.")

_load_artifacts()


# ══════════════════════════════════════════════════════════════════════════════
# IMAGE QUALITY VALIDATION
# ══════════════════════════════════════════════════════════════════════════════

class ImageQualityError(Exception):
    """Raised when the image fails quality checks."""
    pass


def validate_image_quality(img_bytes: bytes) -> Image.Image:
    """
    Validate image quality. Returns a PIL Image on success.
    Raises ImageQualityError with a user-friendly message on failure.
    """
    try:
        pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    except Exception:
        raise ImageQualityError("Invalid image file. Please upload a JPG or PNG.")

    # Convert to numpy for OpenCV analysis
    np_img = np.array(pil_img)
    gray   = cv2.cvtColor(np_img, cv2.COLOR_RGB2GRAY)

    # ── Blur check (Laplacian variance) ──────────────────────────────────────
    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
    if blur_score < BLUR_THRESHOLD:
        raise ImageQualityError(
            f"Image is too blurry (sharpness score: {blur_score:.1f}). "
            "Please upload a clearer, in-focus image."
        )

    # ── Brightness check ─────────────────────────────────────────────────────
    avg_brightness = float(np.mean(gray))
    if avg_brightness < BRIGHTNESS_MIN:
        raise ImageQualityError(
            f"Image is too dark (brightness: {avg_brightness:.1f}). "
            "Please take the photo in good lighting."
        )
    if avg_brightness > BRIGHTNESS_MAX:
        raise ImageQualityError(
            f"Image is overexposed / too bright (brightness: {avg_brightness:.1f}). "
            "Please reduce the light source or avoid flash."
        )

    return pil_img


# ══════════════════════════════════════════════════════════════════════════════
# IMAGE PREPROCESSING
# ══════════════════════════════════════════════════════════════════════════════

def preprocess_for_model(pil_img: Image.Image) -> np.ndarray:
    """Resize, enhance contrast, normalize for EfficientNetV2."""
    # CLAHE-style contrast enhancement
    enhancer = ImageEnhance.Contrast(pil_img)
    pil_img  = enhancer.enhance(1.2)

    # Resize
    pil_img  = pil_img.resize(IMAGE_SIZE, Image.LANCZOS)

    # Mild denoise
    pil_img  = pil_img.filter(ImageFilter.MedianFilter(size=3))

    # EfficientNetV2 preprocessing: scale to [0,1] style (done by EfficientNet)
    arr = np.array(pil_img, dtype=np.float32)
    # EfficientNetV2 expects input scaled to [0, 255]; preprocess_input applies normalization internally
    arr = np.expand_dims(arr, axis=0)
    return arr


# ══════════════════════════════════════════════════════════════════════════════
# TOP-5 INFERENCE
# ══════════════════════════════════════════════════════════════════════════════

def get_top5_predictions(img_bytes: bytes) -> list[dict]:
    """
    Run the model and return top-5 predictions as a list of dicts.
    Each dict: {"rank": int, "disease": str, "confidence": float}
    Returns None if no model is loaded.
    """
    if _model is None:
        return None

    # Preprocess (we already validated, so just decode)
    try:
        pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    except Exception:
        return None

    arr   = preprocess_for_model(pil_img)

    # Run model
    from tensorflow.keras.applications.efficientnet_v2 import preprocess_input
    arr_normalized = preprocess_input(arr.copy())
    preds = _model.predict(arr_normalized, verbose=0)[0]  # shape: (num_classes,)

    # Top-K
    top_indices = np.argsort(preds)[::-1][:TOP_K]
    results = []
    for rank, idx in enumerate(top_indices, start=1):
        label = _class_names[idx] if idx < len(_class_names) else f"Class {idx}"
        results.append({
            "rank":       rank,
            "disease":    label,
            "confidence": float(round(preds[idx], 4)),
        })

    return results


# ══════════════════════════════════════════════════════════════════════════════
# CONVENIENCE EXPORTS
# ══════════════════════════════════════════════════════════════════════════════

def decode_base64_image(b64_str: str) -> bytes:
    """Decode a base64 image string to raw bytes."""
    # Strip data URI prefix if present
    if "," in b64_str:
        b64_str = b64_str.split(",", 1)[1]
    return base64.b64decode(b64_str)


def get_class_names() -> list[str]:
    return list(_class_names)


def model_is_loaded() -> bool:
    return _model is not None
