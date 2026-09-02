"""
DermaSense AI — Payment Router
=================================
Handles Razorpay webhooks to upgrade users to premium.
"""

import os
import hmac
import hashlib
import logging
from fastapi import APIRouter, Request, HTTPException, Depends
from pydantic import BaseModel
from supabase import create_client, Client
import razorpay
from dependencies.auth import verify_token

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/payments",
    tags=["Payments"],
)

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET", "mock_secret")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# Initialize Razorpay Client safely if keys are present
rzp_client = None
if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    rzp_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

def get_supabase() -> Client:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise ValueError("Supabase URL or Service Role Key not configured")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def verify_razorpay_signature(body: bytes, signature: str, secret: str) -> bool:
    """Verifies the webhook signature using HMAC SHA256."""
    expected_signature = hmac.new(
        key=secret.encode("utf-8"),
        msg=body,
        digestmod=hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected_signature, signature)

# Alias for clarity
_verify_sig = verify_razorpay_signature


class CreateOrderRequest(BaseModel):
    amount_inr: int

@router.post("/create-order")
async def create_order(request: CreateOrderRequest, user = Depends(verify_token)):
    """
    Creates a real Razorpay Order ID for the frontend checkout.
    """
    if not rzp_client:
        raise HTTPException(status_code=503, detail="Razorpay is not fully configured in the backend environment")

    try:
        data = {
            "amount": request.amount_inr * 100,  # Convert INR to paise
            "currency": "INR",
            "notes": {
                "user_id": user.id
            }
        }
        order = rzp_client.order.create(data=data)
        return {"success": True, "order_id": order["id"]}
    except Exception as e:
        logger.error(f"Failed to create Razorpay order: {e}")
        raise HTTPException(status_code=500, detail="Could not initiate payment")


@router.post("/razorpay/webhook")
async def razorpay_webhook(request: Request):
    """
    Endpoint to receive Razorpay payment success webhook.
    Reads body once, verifies HMAC signature, then parses JSON.
    """
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature") or request.headers.get("x-razorpay-signature")

    if not signature:
        raise HTTPException(status_code=400, detail="Missing Razorpay signature")

    # Always verify signature when a real secret is configured
    if RAZORPAY_WEBHOOK_SECRET and RAZORPAY_WEBHOOK_SECRET != "mock_secret":
        if not _verify_sig(body, signature, RAZORPAY_WEBHOOK_SECRET):
            raise HTTPException(status_code=400, detail="Invalid Razorpay signature")

    try:
        import json
        payload = json.loads(body)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event = payload.get("event")
    
    # We only care about payment success
    if event == "payment.captured":
        payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
        notes = payment_entity.get("notes", {})
        user_id = notes.get("user_id")

        if not user_id:
            logger.warning("Payment captured but no user_id found in notes")
            return {"status": "ignored", "reason": "no user_id in notes"}

        logger.info(f"Payment successful for user_id: {user_id}. Upgrading to premium...")
        
        try:
            supabase = get_supabase()
            from datetime import datetime, timedelta

            # Invalidate any existing active memberships
            supabase.table("memberships").update({"is_active": False}).eq("user_id", user_id).execute()

            # Create a new active premium membership (30-day)
            start_date = datetime.utcnow()
            end_date = start_date + timedelta(days=30)
            mem_data = {
                "user_id": user_id,
                "plan_name": "premium",
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "is_active": True
            }
            supabase.table("memberships").insert(mem_data).execute()

            # Also update membership_status on the profile
            supabase.table("profiles").update({"membership_status": "premium"}).eq("id", user_id).execute()

            logger.info(f"Successfully upgraded user {user_id} to premium.")
            return {"status": "success", "message": "Premium activated"}
        
        except Exception as e:
            logger.error(f"Failed to update membership in Supabase: {e}")
            raise HTTPException(status_code=500, detail="Failed to upgrade user")

    return {"status": "ignored", "event": event}
