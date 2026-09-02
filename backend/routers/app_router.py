from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter(prefix="/api/v1/app", tags=["App Version"])

@router.get("/version", response_model=Dict[str, Any])
async def get_app_version():
    """
    Returns the latest available mobile application version configuration.
    This allows the Android app to check for optional or mandatory updates.
    """
    return {
        "latest_version": "1.0.0",
        "min_supported_version": "1.0.0",
        "android_build_number": 1,
        "update_available": False,  # Client calculates this, but server can force it
        "mandatory_update": False,
        "release_notes": "Initial release of DermaSense AI with React Native + Expo.",
        "store_url": "market://details?id=com.dermasense.app"
    }
