"""
DermaSense AI — Skincare Analysis Router
======================================
Endpoints:
  POST /api/v1/skincare/analyze  — Routine generation & skin type detection
"""

import logging
import json
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Depends
from fastapi.responses import JSONResponse

from services.skin_ai_service import _check_image_quality, _preprocess_image
from services.local_ai_service import generate_skincare_routine
from services.supabase_service import upload_skin_image, get_supabase_client, save_skincare_analysis
from dependencies.auth import verify_token

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/skincare", tags=["Skincare Analysis"], dependencies=[Depends(verify_token)])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

@router.post("/analyze")
async def analyze_skincare(
    image: UploadFile = File(None),
    metadata: str = Form(default="{}"),
    user_dict: dict = Depends(verify_token),
):
    """
    Skincare routine generation flow:
    1. Validate image quality (if provided)
    2. Read metadata (skinType, concerns, lifestyle)
    3. Generate routine via LLM
    4. Save image and JSON result to DB
    """
    
    # Image Validation
    image_path = None
    image_bytes = None  # Initialize here to avoid NameError if no image is provided
    if image:
        content_type = image.content_type or ""
        if content_type not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(status_code=400, detail="Invalid file type.")
        
        image_bytes = await image.read()
        if len(image_bytes) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File too large.")
            
        img_array = _preprocess_image(image_bytes)
        if img_array is None:
            # Custom error message requested by user
            return JSONResponse(status_code=400, content={"detail": "Please upload a clearer image.", "message": "Please upload a clearer image."})
            
        quality = _check_image_quality(img_array[0])
        if not quality["is_usable"]:
            return JSONResponse(status_code=400, content={"detail": quality["reason"], "message": quality["reason"]})
            
    try:
        meta_dict = json.loads(metadata)
    except Exception:
        meta_dict = {}

    result = await generate_skincare_routine(meta_dict)
    
    # Save Image to Supabase Storage if provided
    # verify_token returns a supabase User object (not a dict), so we use .id
    user_id = getattr(user_dict, "id", None) or getattr(user_dict, "sub", None) or "unknown_user"
    image_storage_path = None
    if image:
        image_storage_path = upload_skin_image(user_id, image.filename, image_bytes)

    # Save to Supabase Database
    db_analysis_id = save_skincare_analysis(user_id, image_storage_path, result)
    
    # Ensure it conforms to what the frontend expects
    response = {
        "success": True,
        "skinType": result.get("skinType", meta_dict.get("skinType", "Combination")),
        "confidence": result.get("confidence", 85),
        "observations": result.get("observations", []),
        "morningRoutine": result.get("morningRoutine", []),
        "eveningRoutine": result.get("eveningRoutine", []),
        "productCategories": result.get("productCategories", []),
        "lifestyleGuidance": result.get("lifestyleGuidance", []),
        "nutritionGuidance": result.get("nutritionGuidance", []),
        "modelVersion": "DermaSense-Ollama-v1" if result.get("is_ollama") else "DermaSense-Knowledge-v1",
        "analysisId": db_analysis_id or f"skin_ai_server_{id(result)}"
    }
    
    return JSONResponse(content=response)

