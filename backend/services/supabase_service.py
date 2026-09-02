import os
import io
import uuid
import time
import logging
import httpx
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

_supabase_client: Client = None


def get_supabase_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise ValueError(
            "Missing Supabase configuration. "
            "Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env"
        )
    try:
        opts = ClientOptions(postgrest_client_timeout=20.0, httpx_client=httpx.Client(timeout=20.0))
        return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, options=opts)
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        raise


def check_db_health() -> bool:
    """Simple check to verify DB is reachable."""
    try:
        client = get_supabase_client()
        client.table("profiles").select("id").limit(1).execute()
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False


def upload_skin_image(user_id: str, filename: str, file_bytes: bytes) -> str:
    """Upload skin image to Supabase Storage and return the storage path."""
    client = get_supabase_client()
    unique_filename = f"{user_id}/{int(time.time())}_{uuid.uuid4().hex[:8]}_{filename}"
    try:
        client.storage.from_("skin-analysis-images").upload(
            path=unique_filename,
            file=file_bytes,
            file_options={"content-type": "image/jpeg"},
        )
        return unique_filename
    except Exception as e:
        logger.error(f"Failed to upload image to Supabase Storage: {e}")
        return ""


def save_analysis_result(user_id: str, image_path: str, prediction: dict, symptoms: dict) -> str:
    """
    Save a skin disease analysis result to the analyses table.
    Maps the new prediction schema fields to the database columns.

    prediction keys used:
      possible_condition → condition
      confidence
      risk_level
      class_probabilities
      model_name
      model_version
      recommendation
    """
    client = get_supabase_client()

    try:
        analysis_data = {
            "user_id": user_id,
            "image_storage_path": image_path,
            "analysis_type": "disease",
            # Use model_version from prediction; fallback to config version
            "model_version": prediction.get("model_version", "1.0"),
            # Map possible_condition → condition for DB column
            "condition": prediction.get("possible_condition"),
            "confidence": prediction.get("confidence"),
            "risk_level": prediction.get("risk_level"),
            "recommendations": {
                "recommendation": prediction.get("recommendation", ""),
                "class_probabilities": prediction.get("class_probabilities", {}),
                "model_name": prediction.get("model_name", ""),
                "display_name": prediction.get("display_name", ""),
            },
        }

        analysis_resp = client.table("analyses").insert(analysis_data).execute()
        if not analysis_resp.data:
            return ""

        analysis_id = analysis_resp.data[0]["id"]

        # Save symptoms if provided
        if symptoms:
            symptoms_data = {
                "analysis_id": analysis_id,
                "symptom_list": symptoms,
                "duration": symptoms.get("duration", "unknown"),
                "body_location": symptoms.get("location", "unknown"),
            }
            try:
                client.table("symptoms").insert(symptoms_data).execute()
            except Exception as e:
                logger.warning(f"Failed to save symptoms (non-fatal): {e}")

        return analysis_id
    except Exception as e:
        logger.error(f"Failed to save analysis to Supabase: {e}")
        return ""


def save_skincare_analysis(user_id: str, image_path: str, result: dict) -> str:
    """Save a skincare analysis result to the analyses table."""
    client = get_supabase_client()

    try:
        analysis_data = {
            "user_id": user_id,
            "image_storage_path": image_path,
            "analysis_type": "skincare",
            "model_version": result.get("modelVersion", "v1.0"),
            "condition": result.get("skinType", "Unknown"),
            "confidence": float(result.get("confidence", 0)),
            "recommendations": {
                "observations": result.get("observations", []),
                "morningRoutine": result.get("morningRoutine", []),
                "eveningRoutine": result.get("eveningRoutine", []),
                "productCategories": result.get("productCategories", []),
                "lifestyleGuidance": result.get("lifestyleGuidance", []),
                "nutritionGuidance": result.get("nutritionGuidance", []),
            },
        }
        analysis_resp = client.table("analyses").insert(analysis_data).execute()

        if not analysis_resp.data:
            return ""

        return analysis_resp.data[0]["id"]
    except Exception as e:
        logger.error(f"Failed to save skincare analysis to Supabase: {e}")
        return ""
