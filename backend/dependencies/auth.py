import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from services.supabase_service import get_supabase_client

logger = logging.getLogger(__name__)

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Dependency to verify JWT token with Supabase and return the authenticated user.
    Protects private endpoints from unauthorized access.
    """
    import os
    if os.getenv("TESTING_NO_AUTH") == "1":
        class MockUser:
            id = "test-user-123"
        return MockUser()

    token = credentials.credentials
    try:
        client = get_supabase_client()
        user_resp = client.auth.get_user(token)
        
        if not user_resp or not user_resp.user:
            logger.warning("Token verification failed: No user found for token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        return user_resp.user
    except Exception as e:
        logger.error(f"Error validating token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
