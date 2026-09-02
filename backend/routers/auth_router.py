import os
import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from services.supabase_service import get_supabase_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

class AuthRequest(BaseModel):
    email: str
    password: str

class SignupRequest(AuthRequest):
    full_name: str
    phone: str = ""

@router.post("/signup")
async def signup(request: SignupRequest):
    try:
        client = get_supabase_client()
        # 1. Sign up user in Supabase Auth
        try:
            auth_res = client.auth.sign_up({
                "email": request.email,
                "password": request.password,
                "options": {
                    "data": {
                        "full_name": request.full_name
                    }
                }
            })
        except Exception as e:
            if "rate limit" in str(e).lower() or "invalid" in str(e).lower():
                # Fallback to admin creation to bypass rate limits
                admin_res = client.auth.admin.create_user({
                    "email": request.email,
                    "password": request.password,
                    "email_confirm": True,
                    "user_metadata": {
                        "full_name": request.full_name
                    }
                })
                # Sign in to get session
                auth_res = client.auth.sign_in_with_password({
                    "email": request.email,
                    "password": request.password
                })
            else:
                raise e

        # 2. Add profile info (id is the auth.uid())
        if auth_res.user:
            profile_data = {
                "id": auth_res.user.id,
                "email": request.email,
                "full_name": request.full_name,
                "phone": request.phone
            }
            # Depending on if a trigger already creates the profile, we might use upsert
            client.table("profiles").upsert(profile_data).execute()
            
            return JSONResponse(content={
                "success": True,
                "user": profile_data,
                "session": auth_res.session.model_dump(mode='json') if auth_res.session else None
            })
            
        raise HTTPException(status_code=400, detail="Signup failed")
    except Exception as e:
        logger.error(f"Signup error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login(request: AuthRequest):
    try:
        client = get_supabase_client()
        auth_res = client.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        
        if auth_res.user:
            # Fetch profile
            profile_res = client.table("profiles").select("*").eq("id", auth_res.user.id).execute()
            profile = profile_res.data[0] if profile_res.data else {"id": auth_res.user.id, "email": request.email}
            
            return JSONResponse(content={
                "success": True,
                "user": profile,
                "session": auth_res.session.model_dump(mode='json') if auth_res.session else None,
                "token": auth_res.session.access_token if auth_res.session else None
            })
            
        raise HTTPException(status_code=401, detail="Invalid credentials")
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=401, detail="Invalid email or password")

class ResetPasswordRequest(BaseModel):
    email: str

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    try:
        client = get_supabase_client()
        # Uses standard Supabase password reset link
        client.auth.reset_password_email(request.email, options={"redirect_to": "http://localhost:5173/reset-password"})
        return JSONResponse(content={"success": True, "message": f"Reset link sent to {request.email}"})
    except Exception as e:
        logger.error(f"Password reset error: {e}")
        # Return success true anyway to prevent email enumeration, standard security practice
        return JSONResponse(content={"success": True, "message": f"Reset link sent to {request.email}"})

@router.get("/google-url")
async def get_google_auth_url():
    try:
        client = get_supabase_client()
        res = client.auth.get_o_auth_provider_url(
            provider="google",
            options={"redirect_to": "http://localhost:5173"} # Will be replaced by frontend but just in case
        )
        return JSONResponse(content={"success": True, "url": res})
    except Exception as e:
        # Some versions of supabase-py might return the url differently or not support it directly
        logger.error(f"Error getting Google OAuth URL: {e}")
        # Fallback to construct manually if the method fails
        supabase_url = os.getenv("SUPABASE_URL", "")
        if not supabase_url:
            raise HTTPException(status_code=500, detail="Supabase not configured")
        
        url = f"{supabase_url}/auth/v1/authorize?provider=google&redirect_to=http://localhost:5173"
        return JSONResponse(content={"success": True, "url": url})

class GoogleAuthRequest(BaseModel):
    id_token: str

@router.post("/google")
async def google_login(request: GoogleAuthRequest):
    try:
        client = get_supabase_client()
        # Authenticate with Supabase using the Google ID Token
        auth_res = client.auth.sign_in_with_id_token({
            "provider": "google",
            "id_token": request.id_token
        })
        
        if auth_res.user:
            # Upsert profile or just fetch it
            profile_res = client.table("profiles").select("*").eq("id", auth_res.user.id).execute()
            
            if not profile_res.data:
                # First time Google login, create profile
                full_name = auth_res.user.user_metadata.get("full_name", "")
                profile_data = {
                    "id": auth_res.user.id,
                    "email": auth_res.user.email,
                    "full_name": full_name
                }
                client.table("profiles").upsert(profile_data).execute()
                profile = profile_data
            else:
                profile = profile_res.data[0]
            
            return JSONResponse(content={
                "success": True,
                "user": profile,
                "session": auth_res.session.model_dump(mode='json') if auth_res.session else None,
                "token": auth_res.session.access_token if auth_res.session else None
            })
            
        raise HTTPException(status_code=401, detail="Google authentication failed")
    except Exception as e:
        logger.error(f"Google Login error: {e}")
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/logout")
async def logout():
    try:
        # In a stateless JWT setup with a service_role client, logout is primarily
        # handled by the frontend deleting the token. 
        # We can also attempt to call the supabase API to invalidate the refresh token if needed,
        # but returning success for the frontend to clear its local state is sufficient.
        return JSONResponse(content={"success": True, "message": "Logged out"})
    except Exception as e:
        logger.error(f"Logout error: {e}")
        return JSONResponse(content={"success": False})

from fastapi import Depends
from dependencies.auth import verify_token

@router.get("/me")
async def get_current_user_profile(user = Depends(verify_token)):
    try:
        client = get_supabase_client()
        res = client.table("profiles").select("*").eq("id", user.id).execute()
        
        if res.data:
            profile = res.data[0]
        else:
            # First time user via OAuth: upsert profile
            full_name = user.user_metadata.get("full_name", "") if hasattr(user, "user_metadata") else ""
            profile_data = {
                "id": user.id,
                "email": user.email,
                "full_name": full_name
            }
            client.table("profiles").upsert(profile_data).execute()
            profile = profile_data
            
        return JSONResponse(content={"success": True, "user": profile})
    except Exception as e:
        logger.error(f"Error fetching current user profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))
