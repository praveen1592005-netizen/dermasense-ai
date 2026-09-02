import logging
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional

from services.supabase_service import get_supabase_client
from fastapi import Depends
from dependencies.auth import verify_token

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/profile", tags=["Profile"], dependencies=[Depends(verify_token)])

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    emergency_contact: Optional[str] = None

@router.get("/{user_id}")
async def get_profile(user_id: str):
    try:
        client = get_supabase_client()
        # Fetch profile
        res = client.table("profiles").select("*").eq("id", user_id).execute()
        
        if res.data:
            return JSONResponse(content={"success": True, "profile": res.data[0]})
        
        raise HTTPException(status_code=404, detail="Profile not found")
    except Exception as e:
        logger.error(f"Error fetching profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{user_id}")
async def update_profile(user_id: str, updates: ProfileUpdate):
    try:
        client = get_supabase_client()
        # Exclude None values
        update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
        
        if not update_data:
            return JSONResponse(content={"success": True, "message": "No updates provided"})
            
        res = client.table("profiles").update(update_data).eq("id", user_id).execute()
        
        if res.data:
            return JSONResponse(content={"success": True, "profile": res.data[0]})
            
        raise HTTPException(status_code=400, detail="Update failed")
    except Exception as e:
        logger.error(f"Error updating profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))
