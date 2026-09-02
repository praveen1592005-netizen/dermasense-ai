"""
DermaSense AI — Model Loader
==============================
Loads the trained EfficientNetV2B2 .keras model ONCE at startup.
All subsequent inference calls reuse the cached model instance.

Paths are configured via environment variables:
  SKIN_MODEL_PATH       — path to DermaSense_SkinDisease_v1.keras
  SKIN_MODEL_CONFIG_PATH — path to calibration_config.json
"""

import os
import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# ── Path Configuration ────────────────────────────────────────────────────────
MODEL_PATH = Path(os.getenv(
    "SKIN_MODEL_PATH",
    "models/skin_disease/DermaSense_SkinDisease_v1.keras"
))
CONFIG_PATH = Path(os.getenv(
    "SKIN_MODEL_CONFIG_PATH",
    "models/skin_disease/calibration_config.json"
))

# Module-level singletons — loaded once at startup
_model = None
_config = None


def get_config() -> dict | None:
    """Return the loaded calibration config dict, or None if not available."""
    global _config
    if _config is not None:
        return _config

    if not CONFIG_PATH.exists():
        logger.error(
            f"Calibration config not found at: {CONFIG_PATH.resolve()}. "
            "Temperature calibration will not be applied."
        )
        return None

    try:
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            _config = json.load(f)
        logger.info(
            f"Calibration config loaded from {CONFIG_PATH.resolve()} — "
            f"model={_config.get('model_name')}, "
            f"temperature={_config.get('temperature')}, "
            f"classes={_config.get('num_classes')}"
        )
    except Exception as e:
        logger.error(f"Failed to load calibration config: {e}")
        _config = None

    return _config


def load_model():
    """
    Load the trained Keras model into memory.
    Called once at application startup via the @startup_event handler.
    Returns the loaded model, or None if unavailable.
    """
    global _model

    if _model is not None:
        return _model

    # Load calibration config first (needed for validation)
    config = get_config()

    if not MODEL_PATH.exists():
        logger.warning(
            f"Trained AI model not found at: {MODEL_PATH.resolve()}. "
            "Skin disease AI inference will be unavailable. "
            "Place the .keras model file at the above path and restart."
        )
        return None

    try:
        import tensorflow as tf
        logger.info(f"Loading DermaSense AI model from: {MODEL_PATH.resolve()} ...")
        _model = tf.keras.models.load_model(str(MODEL_PATH))

        # Validate output shape against config
        output_classes = _model.output_shape[-1]
        expected_classes = config.get("num_classes", 7) if config else 7
        if output_classes != expected_classes:
            logger.error(
                f"CRITICAL: Model outputs {output_classes} classes but "
                f"calibration config expects {expected_classes}. "
                "Predictions are disabled to prevent incorrect disease labels."
            )
            _model = None
            return None

        logger.info(
            f"DermaSense AI model loaded successfully — "
            f"Input shape: {_model.input_shape}, "
            f"Output classes: {output_classes}"
        )
    except Exception as e:
        logger.error(f"Failed to load DermaSense AI model: {e}", exc_info=True)
        _model = None

    return _model


def get_model():
    """
    Return the cached model instance.
    If config is not yet loaded, loads it first.
    Returns None if model is not available.
    """
    if _config is None:
        get_config()
    return _model
