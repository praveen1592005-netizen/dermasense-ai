"""
DermaSense AI — FastAPI Backend
================================
Main application entry point.

Architecture:
  /api/v1/predict     → EfficientNetV2B2 skin disease inference (primary endpoint)
  /api/skin/*         → Full skin analysis pipeline (predict + Ollama explanation + DB save)
  /api/ai/*           → Ollama local LLM (chat, explain, recommend)
  /api/v1/reports/*   → Analysis reports & history
  /api/v1/hospitals/* → Nearby dermatology hospital search
  /api/v1/auth/*      → Authentication (signup, login, JWT)
  /health             → Health check

Privacy:
  - Ollama is NEVER exposed directly to the public
  - .keras model is never placed in a public/static directory
  - No API keys returned in responses
  - All AI inference happens server-side
"""

import logging
import os
from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables from .env file if present
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the AI model and calibration config at startup."""
    from ai.model_loader import load_model, get_config, MODEL_PATH, CONFIG_PATH
    from services.supabase_service import SUPABASE_URL

    logger.info("=" * 60)
    logger.info("DermaSense AI Backend starting...")

    # ── Load AI model + calibration ───────────────────────────────────────────
    logger.info(f"Model path: {MODEL_PATH.resolve()}")
    logger.info(f"Calibration config path: {CONFIG_PATH.resolve()}")
    logger.info(f"Model file exists: {MODEL_PATH.exists()}")
    logger.info(f"Config file exists: {CONFIG_PATH.exists()}")

    model = load_model()
    config = get_config()

    if model is not None and config is not None:
        logger.info(
            f"✅ AI model loaded — {config.get('model_name')} v{config.get('model_version')} "
            f"| {config.get('num_classes')} classes | input {config.get('input_size')}×{config.get('input_size')}"
        )
        logger.info(f"✅ Temperature calibration: {config.get('temperature')}")
    else:
        if model is None:
            logger.error(
                "❌ AI model NOT loaded. Skin disease inference will return errors. "
                f"Place the model at: {MODEL_PATH.resolve()}"
            )
        if config is None:
            logger.error(
                "❌ Calibration config NOT loaded. "
                f"Place calibration_config.json at: {CONFIG_PATH.resolve()}"
            )

    # ── Supabase status ───────────────────────────────────────────────────────
    if not SUPABASE_URL or "dummy" in SUPABASE_URL:
        logger.warning(
            "⚠️  Supabase is not configured or using dummy credentials. "
            "Database features (reports, history, auth) will not work."
        )
    else:
        logger.info(f"Supabase configured: {SUPABASE_URL}")

    # ── Ollama status ─────────────────────────────────────────────────────────
    logger.info("Ollama/Local AI: Using manual knowledge-based chatbot")
    logger.info("=" * 60)
    
    yield

# Initialize FastAPI app
app = FastAPI(
    title="DermaSense AI Backend",
    description=(
        "Backend for DermaSense AI. "
        "Provides EfficientNetV2B2 skin disease screening and Ollama LLM chat. "
        "All AI inference is server-side — never in the browser or mobile app."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS Configuration ────────────────────────────────────────────────────────
allowed_origins_str = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://localhost:3000,https://dermasense-ai-pi.vercel.app"
)
allowed_origins = [o.strip() for o in allowed_origins_str.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Include Routers ───────────────────────────────────────────────────────────
from routers.skin_router import router as skin_router
from routers.skincare_router import router as skincare_router
from routers.ai_router import router as ai_router
from routers.identity_router import router as identity_router
from routers.predict_router import router as predict_router

app.include_router(skin_router)
app.include_router(skincare_router)
app.include_router(identity_router)
app.include_router(ai_router)
app.include_router(predict_router)

from routers import auth_router, profile_router, hospital_router, store_router, report_router, membership_router, payment_router, app_router

app.include_router(auth_router.router)
app.include_router(profile_router.router)
app.include_router(hospital_router.router)
app.include_router(store_router.router)
app.include_router(report_router.router)
app.include_router(membership_router.router)
app.include_router(payment_router.router)
app.include_router(app_router.router)

# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    """Backend health check endpoint."""
    from ai.model_loader import get_model, get_config
    from services.supabase_service import check_db_health

    model = get_model()
    config = get_config()
    db_health = check_db_health()

    return {
        "status": "ok",
        "database": "ok" if db_health else "error",
        "model_loaded": model is not None,
        "calibration_loaded": config is not None,
        "model_name": config.get("model_name") if config else None,
        "model_version": str(config.get("model_version")) if config else None,
        "version": "1.0",
    }




if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
