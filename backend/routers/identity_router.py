"""
DermaSense AI — Identity & Aadhaar Verification Router
======================================================
Endpoints:
  POST /api/v1/identity/aadhaar/start       — Initiate Aadhaar verification & send OTP
  POST /api/v1/identity/aadhaar/verify-otp  — Verify 6-digit OTP code
  POST /api/v1/identity/aadhaar/resend-otp  — Resend OTP with cooldown
  GET  /api/v1/identity/aadhaar/status      — Check current user identity verification status

Security & Privacy:
  - Raw Aadhaar is validated in-memory and immediately masked.
  - Raw Aadhaar is NEVER persisted to disk or sent to AI models.
  - Rate limiting, attempt lockouts, and OTP expiration enforced.
"""

import logging
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional

from services.aadhaar_service import AadhaarVerificationService
from fastapi import Depends
from dependencies.auth import verify_token

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/identity/aadhaar", tags=["Identity & Aadhaar Verification"], dependencies=[Depends(verify_token)])


class StartAadhaarRequest(BaseModel):
    aadhaar_number: str = Field(..., description="12-digit Aadhaar number")
    user_id: str = Field(default="usr_guest", description="User ID initiating verification")


class VerifyOtpRequest(BaseModel):
    txn_id: str = Field(..., description="Transaction reference ID from start step")
    otp: str = Field(..., description="6-digit verification code")
    user_id: str = Field(default="usr_guest", description="User ID")


class ResendOtpRequest(BaseModel):
    txn_id: str = Field(..., description="Transaction reference ID")
    user_id: str = Field(default="usr_guest", description="User ID")


class SyncVerificationRequest(BaseModel):
    user_id: str
    masked_aadhaar: str


@router.post("/start")
async def start_aadhaar_verification(request: StartAadhaarRequest):
    """
    Start Aadhaar verification:
    - Validates format & Verhoeff checksum
    - Generates secure transaction ID
    - Sends OTP to Aadhaar-registered mobile
    - Returns masked identifier (e.g. XXXX-XXXX-1234)
    """
    result = AadhaarVerificationService.start_verification(
        aadhaar_number=request.aadhaar_number,
        user_id=request.user_id,
    )

    if not result.get("success"):
        return JSONResponse(
            status_code=400,
            content=result,
        )

    return JSONResponse(status_code=200, content=result)


@router.post("/verify-otp")
async def verify_aadhaar_otp(request: VerifyOtpRequest):
    """
    Verify Aadhaar OTP:
    - Verifies 6-digit OTP code against transaction session
    - Enforces 5-minute expiry & max 3 attempts
    - Updates user verification state to VERIFIED upon success
    """
    result = AadhaarVerificationService.verify_otp(
        txn_id=request.txn_id,
        otp=request.otp,
        user_id=request.user_id,
    )

    if not result.get("success"):
        status_code = 400
        if result.get("error_code") in ("TOO_MANY_ATTEMPTS", "OTP_EXPIRED"):
            status_code = 429 if result.get("error_code") == "TOO_MANY_ATTEMPTS" else 410
        return JSONResponse(
            status_code=status_code,
            content=result,
        )

    return JSONResponse(status_code=200, content=result)


@router.post("/resend-otp")
async def resend_aadhaar_otp(request: ResendOtpRequest):
    """
    Resend verification OTP:
    - Enforces 30-second cooldown timer
    - Limits to maximum 3 resends per session
    """
    result = AadhaarVerificationService.resend_otp(
        txn_id=request.txn_id,
        user_id=request.user_id,
    )

    if not result.get("success"):
        status_code = 429 if result.get("error_code") == "COOLDOWN_ACTIVE" else 400
        return JSONResponse(
            status_code=status_code,
            content=result,
        )

    return JSONResponse(status_code=200, content=result)


@router.get("/status")
async def get_aadhaar_status(user_id: str = Query(..., description="User ID to check")):
    """
    Check current Aadhaar verification status for user (VERIFIED vs PENDING).
    """
    result = AadhaarVerificationService.get_status(user_id=user_id)
    return JSONResponse(status_code=200, content=result)


@router.post("/sync")
async def sync_verification_state(request: SyncVerificationRequest):
    """
    Synchronizes verification completed on another client (e.g. Mobile to Web).
    """
    result = AadhaarVerificationService.set_user_verified_manual(
        user_id=request.user_id,
        masked_aadhaar=request.masked_aadhaar,
    )
    return JSONResponse(status_code=200, content=result)
