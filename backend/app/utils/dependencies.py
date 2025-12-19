"""
FastAPI dependencies for authentication and authorization
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from bson import ObjectId

from app.utils.security import decode_access_token
from app.database import get_database
from app.models.user import UserInDB


# HTTP Bearer token security scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> UserInDB:
    """
    Get the current authenticated user from JWT token
    
    Args:
        credentials: HTTP Bearer credentials from request header
    
    Returns:
        UserInDB: Current authenticated user
    
    Raises:
        HTTPException: If token is invalid or user not found
    """
    token = credentials.credentials
    
    # Decode token
    payload = decode_access_token(token)
    user_id: Optional[str] = payload.get("sub")
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    db = get_database()
    user_data = await db.users.find_one({"_id": ObjectId(user_id)})
    
    if user_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Convert ObjectId to string for Pydantic
    user_data["_id"] = str(user_data["_id"])
    
    return UserInDB(**user_data)


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[UserInDB]:
    """
    Get the current authenticated user from JWT token (optional)
    Returns None if no token provided or invalid
    
    Args:
        credentials: Optional HTTP Bearer credentials from request header
    
    Returns:
        Optional[UserInDB]: Current authenticated user or None
    """
    if credentials is None:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None