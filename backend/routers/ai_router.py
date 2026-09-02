"""
DermaSense AI — AI Chat/Explanation Router
==========================================
Endpoints:
  POST /api/ai/chat           — Chat with local Ollama LLM
  POST /api/ai/explain-result — Explain a skin analysis result in plain language
  POST /api/ai/recommendations — Lifestyle and food guidance
  GET  /api/ai/status         — Check Ollama availability status
"""

import logging
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional

from fastapi import Depends
from dependencies.auth import verify_token

from services.local_ai_service import (
    send_chat_message,
    explain_analysis_result,
    get_lifestyle_recommendations,
    _check_ollama_health,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/ai", tags=["AI Chat"], dependencies=[Depends(verify_token)])


class ChatMessage(BaseModel):
    role: str   # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: list[ChatMessage] = []
    analysis_context: Optional[dict] = None


class ExplainRequest(BaseModel):
    condition: Optional[str] = None
    confidence_percentage: Optional[int] = None
    confidence_level: Optional[str] = None
    risk_level: Optional[str] = None
    symptoms: list[str] = []
    skin_type: Optional[str] = None
    duration: Optional[str] = None
    body_location: Optional[str] = None


class RecommendationRequest(BaseModel):
    condition: Optional[str] = None
    risk_level: Optional[str] = None
    skin_type: Optional[str] = None
    symptoms: list[str] = []


@router.get("/status")
async def get_ai_status():
    """Check if Ollama is running and the model is available."""
    health = await _check_ollama_health()
    return JSONResponse(content={
        "ollama_available": health["available"],
        "model": "manual",
        "status": "ok" if health["available"] else health.get("reason", "unavailable"),
        "message": (
            f"Local AI is ready."
            if health["available"]
            else f"Local AI unavailable: {health.get('reason', 'unknown')}. "
        ),
        "available_models": health.get("available_models", []),
    })


@router.get("/chat/history")
async def get_chat_history(user: dict = Depends(verify_token)):
    try:
        from services.supabase_service import get_supabase_client
        client = get_supabase_client()
        res = client.table("chat_messages").select("*").eq("user_id", user.id).order("created_at", desc=False).execute()
        
        return JSONResponse(content={"success": True, "history": res.data})
    except Exception as e:
        logger.error(f"Error fetching chat history: {e}")
        return JSONResponse(status_code=500, content={"success": False, "message": str(e)})

@router.post("/chat")
async def chat(request: ChatRequest, user: dict = Depends(verify_token)):
    """
    Send a message to the local Ollama LLM chatbot.
    Optionally pass analysis context to personalize responses.

    Privacy rules enforced here:
    - No passwords, payment data, or Aadhaar numbers are forwarded to LLM
    - Only relevant medical context fields are passed
    """
    # Sanitize analysis context — only pass safe fields
    safe_context = None
    if request.analysis_context:
        ctx = request.analysis_context
        safe_context = {
            k: ctx[k] for k in [
                "condition", "confidence_percentage", "confidence_level",
                "risk_level", "skin_type", "symptoms", "duration", "body_location"
            ] if k in ctx
        }

    history = [{"role": m.role, "content": m.content} for m in request.conversation_history]

    result = await send_chat_message(
        user_message=request.message,
        conversation_history=history,
        analysis_context=safe_context,
    )

    try:
        from services.supabase_service import get_supabase_client
        client = get_supabase_client()
        # Ensure we only insert valid data
        user_msg = {
            "user_id": user.id,
            "role": "user",
            "content": request.message
        }
        bot_msg = {
            "user_id": user.id,
            "role": "assistant",
            "content": result["response"]
        }
        client.table("chat_messages").insert([user_msg, bot_msg]).execute()
    except Exception as e:
        logger.error(f"Failed to log chat history: {e}")

    return JSONResponse(content={
        "success": result["success"],
        "response": result["response"],
        "status": result["status"],
        "model": result["model"],
    })


@router.post("/explain-result")
async def explain_result(request: ExplainRequest):
    """
    Generate a plain-language explanation of a skin analysis result.
    Only uses the structured fields — does not access raw images.
    """
    analysis_data = {
        "condition": request.condition,
        "confidence_percentage": request.confidence_percentage,
        "confidence_level": request.confidence_level,
        "risk_level": request.risk_level,
        "symptoms": request.symptoms,
        "skin_type": request.skin_type,
        "duration": request.duration,
        "body_location": request.body_location,
    }

    result = await explain_analysis_result(analysis_data)

    return JSONResponse(content={
        "success": result["success"],
        "explanation": result["response"],
        "status": result["status"],
        "model": result["model"],
    })


@router.post("/recommendations")
async def recommendations(request: RecommendationRequest):
    """
    Generate lifestyle and food guidance based on detected condition.
    The LLM provides general wellness information — not treatment plans.
    """
    analysis_data = {
        "condition": request.condition,
        "risk_level": request.risk_level,
        "skin_type": request.skin_type,
        "symptoms": request.symptoms,
    }

    result = await get_lifestyle_recommendations(analysis_data)

    return JSONResponse(content={
        "success": result["success"],
        "recommendations": result["response"],
        "status": result["status"],
        "model": result["model"],
    })
