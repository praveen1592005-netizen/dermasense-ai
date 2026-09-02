import logging
from datetime import datetime, timedelta
from fastapi import HTTPException
from services.supabase_service import get_supabase_client

logger = logging.getLogger(__name__)

# Define limits
PLAN_LIMITS = {
    "free": {"analyses_lifetime": 5},
    "premium": {"analyses_lifetime": 999999}, # essentially unlimited for premium
    "professional": {"analyses_lifetime": 999999} # effectively unlimited
}

def verify_membership_limits(user_id: str):
    """
    Check if the user has reached their lifetime limit for AI analyses.
    This prevents frontend-only unlocking of premium features.
    """
    try:
        client = get_supabase_client()
        
        # 1. Get user's active membership
        profile_res = client.table("profiles").select("membership_status").eq("id", user_id).execute()
        
        if not profile_res.data:
            raise HTTPException(status_code=404, detail="User profile not found")
            
        current_plan = profile_res.data[0].get("membership_status", "free")
        if current_plan not in PLAN_LIMITS:
            current_plan = "free"
            
        limit = PLAN_LIMITS[current_plan]["analyses_lifetime"]
        
        # Premium/Professional plan is unlimited
        if limit >= 999999:
            return True
            
        # 2. Count total usage (lifetime)
        analyses_res = client.table("analyses").select("id", count="exact").eq("user_id", user_id).execute()
        
        usage_count = analyses_res.count if hasattr(analyses_res, "count") and analyses_res.count is not None else len(analyses_res.data)
        
        if usage_count >= limit:
            raise HTTPException(
                status_code=403, 
                detail=f"Free limit reached ({usage_count}/{limit}). Please upgrade your plan."
            )
            
        return True
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking membership limits: {e}")
        # Fail open if DB is completely unreachable to not block demo flows
        return True
