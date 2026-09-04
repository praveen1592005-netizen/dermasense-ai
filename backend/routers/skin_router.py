"""
DermaSense AI — Skin Analysis Router
======================================
Endpoints:
  POST /api/skin/analyze       — Full skin image analysis (EfficientNetV2B2 + Ollama)
  POST /api/skin/quality-check — Image quality pre-validation only
  GET  /api/skin/history       — User's past skin analyses

Pipeline for /api/skin/analyze:
  1. Validate file type and size
  2. Run EfficientNetV2B2 model inference (via ai/predict.py)
  3. Apply temperature calibration (handled inside predict.py)
  4. Apply risk/confidence rules (handled inside predict.py)
  5. Generate Ollama explanation (if model prediction available)
  6. Generate lifestyle guidance (optional)
  7. Upload image to Supabase Storage
  8. Save analysis result to Supabase DB
  9. Return structured response

IMPORTANT:
  - All ML inference is done in ai/predict.py — this router only orchestrates.
  - Ollama explains the result but NEVER overrides the model prediction.
  - The .keras model is never exposed via a public URL.
"""

import logging
import json
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Depends
from fastapi.responses import JSONResponse

from ai.predict import run_prediction
from services.local_ai_service import explain_analysis_result, get_lifestyle_recommendations
from services.supabase_service import upload_skin_image, save_analysis_result
from dependencies.auth import verify_token
logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/skin", tags=["Skin Analysis"], dependencies=[Depends(verify_token)])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/analyze")
async def analyze_skin(
    image: UploadFile = File(...),
    user_id: str = Form(...),
    symptoms: str = Form(default="{}"),
    include_explanation: bool = Form(default=True),
    include_lifestyle: bool = Form(default=True),
):
    """
    Full skin disease analysis pipeline.
    Uses EfficientNetV2B2 for diagnosis + Ollama for explanation.
    The image model provides the prediction — Ollama only explains it.
    """
    # ── File Type Validation ──────────────────────────────────────────────────
    content_type = image.content_type or ""
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {content_type}. Accepted: JPEG, PNG, WebP.",
        )

    # ── File Size Validation ──────────────────────────────────────────────────
    image_bytes = await image.read()
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum is 10 MB. Received: {len(image_bytes) // 1024} KB.",
        )
    if len(image_bytes) < 1024:
        raise HTTPException(
            status_code=400,
            detail="File appears empty or corrupted (< 1 KB).",
        )

    # ── Parse Symptoms ────────────────────────────────────────────────────────
    try:
        symptoms_data = json.loads(symptoms) if symptoms else {}
    except json.JSONDecodeError:
        symptoms_data = {}

    # ── Run AI Prediction (EfficientNetV2B2 + Temperature Calibration) ────────
    prediction = await run_prediction(image_bytes)

    # prediction["status"] is one of:
    #   "success"                   — prediction returned
    #   "IMAGE_QUALITY_INSUFFICIENT"— image quality check failed
    #   "error"                     — model not loaded or inference failed
    prediction_status = prediction.get("status", "error")

    # ── Upload Image and Save Analysis (only for usable predictions) ──────────
    image_path = ""
    analysis_id = ""

    if prediction_status == "success":
        # Upload to Supabase Storage
        try:
            image_path = upload_skin_image(user_id, image.filename or "upload.jpg", image_bytes)
        except Exception as e:
            logger.warning(f"Image upload to Supabase failed (non-fatal): {e}")

        # Save analysis result to DB
        try:
            analysis_id = save_analysis_result(user_id, image_path, prediction, symptoms_data)
            if analysis_id:
                prediction["analysis_id"] = analysis_id
        except Exception as e:
            logger.warning(f"Failed to save analysis to DB (non-fatal): {e}")

    # ── Build Base Response ───────────────────────────────────────────────────
    response = {
        "success": True,
        "prediction": prediction,
        "symptoms_received": symptoms_data,
        "analysis_id": analysis_id,
        "image_path": image_path,
        "disclaimer": (
            "DermaSense AI provides AI-assisted informational screening and does not "
            "provide a definitive medical diagnosis. AI results may be inaccurate. "
            "Always consult a qualified dermatologist for clinical evaluation and treatment."
        ),
    }

    # ── Ollama Explanation (only for successful predictions) ──────────────────
    # Ollama explains; it does NOT override the model's prediction.
    risk_level = prediction.get("risk_level")
    condition = prediction.get("possible_condition")
    has_usable_prediction = (
        prediction_status == "success"
        and condition is not None
        and risk_level not in (None, "UNCERTAIN")
    )

    if has_usable_prediction and include_explanation:
        try:
            explanation_result = await explain_analysis_result({
                "condition": prediction.get("display_name", condition),
                "confidence_percentage": int(round(prediction.get("confidence", 0) * 100)),
                "confidence_level": (
                    "HIGH" if prediction.get("confidence", 0) >= 0.80
                    else "MODERATE" if prediction.get("confidence", 0) >= 0.60
                    else "LOW"
                ),
                "risk_level": risk_level,
                "symptoms": list(symptoms_data.values()) if isinstance(symptoms_data, dict) else [],
            })
            response["ai_explanation"] = explanation_result.get("response", "")
            response["ai_explanation_available"] = explanation_result.get("success", False)
        except Exception as e:
            logger.warning(f"Ollama explanation failed (non-fatal): {e}")
            response["ai_explanation"] = None
            response["ai_explanation_available"] = False
    else:
        response["ai_explanation"] = None
        response["ai_explanation_available"] = False

    if has_usable_prediction and include_lifestyle:
        try:
            lifestyle_result = await get_lifestyle_recommendations({
                "condition": prediction.get("display_name", condition),
                "risk_level": risk_level,
            })
            response["lifestyle_guidance"] = lifestyle_result.get("response", "")
            response["lifestyle_guidance_available"] = lifestyle_result.get("success", False)
        except Exception as e:
            logger.warning(f"Lifestyle guidance failed (non-fatal): {e}")
            response["lifestyle_guidance"] = None
            response["lifestyle_guidance_available"] = False
    else:
        response["lifestyle_guidance"] = None
        response["lifestyle_guidance_available"] = False

    return JSONResponse(content=response)


@router.post("/quality-check")
async def quality_check(image: UploadFile = File(...)):
    """
    Fast image quality pre-check before running full analysis.
    Returns quality status without running the full AI model.
    """
    content_type = image.content_type or ""
    if content_type not in ALLOWED_CONTENT_TYPES:
        return JSONResponse(content={
            "is_usable": False,
            "status": "invalid_type",
            "message": f"Invalid file type: {content_type}. Please use JPEG, PNG, or WebP.",
        })

    image_bytes = await image.read()

    if len(image_bytes) > MAX_FILE_SIZE:
        return JSONResponse(content={
            "is_usable": False,
            "status": "too_large",
            "message": f"File size {len(image_bytes) // 1024} KB exceeds 10 MB limit.",
        })

    try:
        from PIL import Image
        import io
        img = Image.open(io.BytesIO(image_bytes))
        width, height = img.size
        is_usable = width >= 64 and height >= 64
        return JSONResponse(content={
            "is_usable": is_usable,
            "status": "ok" if is_usable else "too_small",
            "message": (
                "Image quality check passed."
                if is_usable
                else f"Image resolution {width}×{height} is too small. "
                     "Please upload a higher quality image (minimum 64×64 pixels)."
            ),
            "resolution": {"width": width, "height": height},
            "file_size_bytes": len(image_bytes),
        })
    except Exception as e:
        return JSONResponse(content={
            "is_usable": False,
            "status": "decode_error",
            "message": "Unable to decode image. Please upload a valid JPEG, PNG, or WebP file.",
        })


@router.get("/history")
async def get_analysis_history(user_id: str, user: Depends = Depends(verify_token)):
    """Fetch user's past skin analyses from Supabase."""
    from services.supabase_service import get_supabase_client
    
    if hasattr(user, "id") and user.id != user_id:
        return JSONResponse(status_code=403, content={"success": False, "message": "Unauthorized access to history"})
        
    try:
        client = get_supabase_client()
        response = (
            client.table("analyses")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return JSONResponse(content={"success": True, "analyses": response.data})
    except Exception as e:
        logger.error(f"Failed to fetch analysis history: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": str(e)}
        )

