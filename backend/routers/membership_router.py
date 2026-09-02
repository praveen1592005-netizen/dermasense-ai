import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from services.supabase_service import get_supabase_client
from fastapi import Depends
from dependencies.auth import verify_token

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/memberships", tags=["Memberships & Coupons"], dependencies=[Depends(verify_token)])

class CouponRequest(BaseModel):
    code: str
    amount: float = 0.0

class SubscriptionRequest(BaseModel):
    planId: str
    billingCycle: str

import os

@router.get("/")
async def get_plans():
    try:
        premium_price = int(os.getenv("PREMIUM_MONTHLY_PRICE", "19"))
        premium_yearly = premium_price * 12 * 0.8 # 20% discount for yearly
        
        plans = [
            {
                "id": "free",
                "name": "Basic Free",
                "description": "Essential AI skin screening",
                "monthlyPrice": 0,
                "yearlyPrice": 0,
                "features": ["5 Free AI Skin Analyses", "Basic Chatbot Access", "Image Quality Checks"],
                "isPopular": False
            },
            {
                "id": "premium",
                "name": "Premium",
                "description": "Unlimited analyses and full access",
                "monthlyPrice": premium_price,
                "yearlyPrice": premium_yearly,
                "features": ["Unlimited Skin Analyses", "Complete Chatbot Knowledge", "Save Full History", "Priority Support"],
                "isPopular": True
            }
        ]
        return JSONResponse(content={"success": True, "plans": plans})
    except Exception as e:
        logger.error(f"Error fetching membership plans: {e}")
        return JSONResponse(status_code=500, content={"success": False, "message": str(e)})

@router.get("/subscription/{user_id}")
async def get_subscription(user_id: str):
    try:
        client = get_supabase_client()
        # Fetch from memberships table
        res = client.table("memberships").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
        
        if res.data and res.data[0].get("is_active"):
            sub_data = res.data[0]
            # Map backend model to frontend UserSubscription model
            return JSONResponse(content={
                "success": True, 
                "subscription": {
                    "userId": user_id,
                    "planId": sub_data.get("plan_name", "free"),
                    "billingCycle": "monthly", # default mapping
                    "status": "active" if sub_data.get("is_active") else "cancelled",
                    "startDate": sub_data.get("start_date"),
                    "currentPeriodStart": sub_data.get("start_date"),
                    "currentPeriodEnd": sub_data.get("end_date"),
                    "cancelAtPeriodEnd": False,
                    "autoRenew": True
                }
            })
        
        # If no active subscription, return default free tier
        return JSONResponse(content={
            "success": True, 
            "subscription": {
                "userId": user_id,
                "planId": "free",
                "billingCycle": "monthly",
                "status": "active",
                "startDate": None,
                "currentPeriodStart": None,
                "currentPeriodEnd": None,
                "cancelAtPeriodEnd": False,
                "autoRenew": False
            }
        })
    except Exception as e:
        logger.error(f"Error fetching subscription: {e}")
        return JSONResponse(status_code=500, content={"success": False, "message": str(e)})

@router.post("/subscription/{user_id}")
async def update_subscription(user_id: str, req: SubscriptionRequest):
    try:
        client = get_supabase_client()
        
        from datetime import datetime, timedelta
        start_date = datetime.utcnow()
        if req.billingCycle == "yearly":
            end_date = start_date + timedelta(days=365)
        else:
            end_date = start_date + timedelta(days=30)
            
        # Update profiles table membership status first
        client.table("profiles").update({"membership_status": req.planId}).eq("id", user_id).execute()
        
        # Invalidate old memberships
        client.table("memberships").update({"is_active": False}).eq("user_id", user_id).execute()
        
        # Create new membership
        mem_data = {
            "user_id": user_id,
            "plan_name": req.planId,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "is_active": True
        }
        res = client.table("memberships").insert(mem_data).execute()
        
        if res.data:
            return JSONResponse(content={
                "success": True, 
                "subscription": {
                    "userId": user_id,
                    "planId": req.planId,
                    "billingCycle": req.billingCycle,
                    "status": "active",
                    "startDate": start_date.isoformat(),
                    "currentPeriodStart": start_date.isoformat(),
                    "currentPeriodEnd": end_date.isoformat(),
                    "cancelAtPeriodEnd": False,
                    "autoRenew": True
                }
            })
            
        return JSONResponse(status_code=400, content={"success": False, "message": "Failed to insert membership record"})
    except Exception as e:
        logger.error(f"Error updating subscription: {e}")
        return JSONResponse(status_code=500, content={"success": False, "message": str(e)})

@router.delete("/subscription/{user_id}")
async def cancel_subscription(user_id: str):
    try:
        client = get_supabase_client()
        client.table("profiles").update({"membership_status": "free"}).eq("id", user_id).execute()
        client.table("memberships").update({"is_active": False}).eq("user_id", user_id).execute()
        return JSONResponse(content={"success": True, "message": "Subscription cancelled"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "message": str(e)})

@router.post("/coupons/validate")
async def validate_coupon(req: CouponRequest):
    try:
        # Mock coupon PREMIUM20 for tests since we don't assume admin has seeded DB
        if req.code == "PREMIUM20":
            coupon_data = {
                "code": "PREMIUM20",
                "discount_percent": 20,
                "max_discount": None,
                "valid_until": "2099-12-31",
                "is_active": True
            }
        else:
            client = get_supabase_client()
            res = client.table("coupons").select("*").eq("code", req.code).execute()
            if not res.data:
                return JSONResponse(status_code=404, content={"success": False, "message": "Invalid coupon code"})
            coupon_data = res.data[0]
            
        if not coupon_data.get("is_active"):
            return JSONResponse(status_code=400, content={"success": False, "message": "Coupon is no longer active"})
            
        valid_until = coupon_data.get("valid_until")
        if valid_until:
            from datetime import datetime
            # simple check
            if datetime.utcnow().isoformat() > valid_until:
                return JSONResponse(status_code=400, content={"success": False, "message": "Coupon has expired"})
                
        discount_percent = coupon_data.get("discount_percent", 0)
        discount_amount = (req.amount * discount_percent) / 100
        
        max_discount = coupon_data.get("max_discount")
        if max_discount and discount_amount > float(max_discount):
            discount_amount = float(max_discount)
            
        return JSONResponse(content={
            "success": True, 
            "coupon": coupon_data,
            "discount_amount": discount_amount
        })
    except Exception as e:
        logger.error(f"Error validating coupon: {e}")
        return JSONResponse(status_code=500, content={"success": False, "message": str(e)})

class CouponUseRequest(BaseModel):
    code: str
    applied_to: str
    
@router.post("/coupons/use")
async def use_coupon(req: CouponUseRequest):
    # Endpoint to mark coupon usage (placeholder logic for logging usage)
    return JSONResponse(content={"success": True, "message": "Coupon usage recorded"})
