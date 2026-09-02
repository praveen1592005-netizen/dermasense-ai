"""
DermaSense AI — Predict Endpoint
===================================
POST /api/v1/predict

The primary ML inference endpoint.
Accepts a skin image, runs EfficientNetV2B2 inference with temperature calibration,
and returns a structured prediction response.

This endpoint is consumed by:
  - Web frontend (diseaseAnalysisService.ts)
  - Mobile app (disease_service.dart)

Both clients MUST consume this endpoint's result — no ML logic in client code.
"""

from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from fastapi.responses import JSONResponse
import logging

from ai.predict import run_prediction
from dependencies.auth import verify_token

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["AI Prediction"], dependencies=[Depends(verify_token)])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/predict")
async def predict_endpoint(image: UploadFile = File(...)):
    """
    Skin disease AI prediction endpoint.

    Pipeline:
      1. Validate file type and size
      2. Run EfficientNetV2B2 inference
      3. Apply temperature calibration
      4. Image quality check
      5. Risk assessment
      6. Return structured response

    Response status values:
      "success"                    — prediction successful
      "IMAGE_QUALITY_INSUFFICIENT" — image quality check failed
      "error"                      — model not loaded or inference failed

    HTTP status codes:
      200 — success
      400 — invalid file type, file too large, or IMAGE_QUALITY_INSUFFICIENT
      500 — model not loaded or inference error
    """
    # ── File type validation ──────────────────────────────────────────────────
    content_type = image.content_type or ""
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {content_type}. Accepted: JPEG, PNG, WebP.",
        )

    # ── File size validation ──────────────────────────────────────────────────
    image_bytes = await image.read()
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum is 10 MB. Received: {len(image_bytes) // 1024} KB.",
        )

    if len(image_bytes) < 512:
        raise HTTPException(
            status_code=400,
            detail="File appears empty or corrupted.",
        )

    # ── Run prediction ────────────────────────────────────────────────────────
    result = await run_prediction(image_bytes)

    status = result.get("status", "error")

    if status == "IMAGE_QUALITY_INSUFFICIENT":
        # Return 422 Unprocessable Entity — file was valid but image unsuitable
        return JSONResponse(status_code=422, content=result)

    if status == "error":
        # Model not loaded or inference failed
        return JSONResponse(status_code=500, content=result)

    # status == "success" (includes UNCERTAIN risk_level cases)
    return JSONResponse(content=result)
