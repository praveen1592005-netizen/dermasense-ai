from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Import router for prediction endpoint
from .routes import predict

# Placeholder for Firebase token verification (to be implemented)
security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # TODO: Verify Firebase ID token and return user info
    token = credentials.credentials
    # For now, just simulate success
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return {"uid": "dummy_user_id"}

app = FastAPI(title="DermaSense AI Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Include prediction router
app.include_router(predict)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
