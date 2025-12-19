"""
OTP verification model for MongoDB with Pydantic v2
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timedelta
from bson import ObjectId
from enum import Enum


class OTPPurpose(str, Enum):
    """OTP purpose enumeration"""
    SIGNUP = "signup"
    LOGIN = "login"


class OTPCreate(BaseModel):
    """Model for creating OTP verification"""
    user_id: str = Field(alias="userId")
    otp: str
    purpose: OTPPurpose
    expires_at: datetime = Field(alias="expiresAt")

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "userId": "507f1f77bcf86cd799439011",
                "otp": "123456",
                "purpose": "signup",
                "expiresAt": "2025-01-01T00:05:00Z"
            }
        }
    }


class OTPInDB(BaseModel):
    """OTP model as stored in database"""
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str = Field(alias="userId")
    otp: str
    purpose: OTPPurpose
    expires_at: datetime = Field(alias="expiresAt")
    verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow, alias="createdAt")

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }


class OTPVerify(BaseModel):
    """Model for verifying OTP"""
    user_id: str = Field(alias="userId")
    otp: str

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "userId": "507f1f77bcf86cd799439011",
                "otp": "123456"
            }
        }
    }


def generate_otp_expiry(minutes: int = 5) -> datetime:
    """
    Generate OTP expiry time
    
    Args:
        minutes: Number of minutes until expiry (default: 5)
    
    Returns:
        datetime: Expiry timestamp
    """
    return datetime.utcnow() + timedelta(minutes=minutes)