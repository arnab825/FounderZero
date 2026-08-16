from fastapi import APIRouter, Header, HTTPException
from typing import Optional
from firebase import verify_firebase_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/me")
async def get_current_user(authorization: Optional[str] = Header(None)):
    """Verifies Firebase Auth token from header and returns user profile."""
    if not authorization:
        # Default mock user if no auth header passed
        return {
            "authenticated": True,
            "uid": "demo-founder-1",
            "email": "demo@founderzero.ai",
            "name": "Demo Founder",
            "picture": "https://api.dicebear.com/7.x/bottts/svg?seed=founderzero"
        }

    token = authorization.replace("Bearer ", "").strip()
    decoded = verify_firebase_token(token)

    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid or expired Firebase Auth token")

    return {
        "authenticated": True,
        "uid": decoded.get("uid"),
        "email": decoded.get("email"),
        "name": decoded.get("name", "Founder"),
        "picture": decoded.get("picture")
    }
