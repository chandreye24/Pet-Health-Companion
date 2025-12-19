"""
Medical history model for MongoDB with Pydantic v2
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from enum import Enum


class MedicalHistoryType(str, Enum):
    """Medical history type enumeration"""
    VACCINATION = "vaccination"
    ILLNESS = "illness"
    SURGERY = "surgery"
    CHECKUP = "checkup"
    OTHER = "other"


class MedicalHistoryBase(BaseModel):
    """Base medical history model"""
    type: MedicalHistoryType
    date: datetime
    description: str = Field(..., min_length=1, max_length=500)
    photos: Optional[List[str]] = Field(default_factory=list)  # Base64 or URLs
    notes: Optional[str] = Field(None, max_length=1000)

    model_config = {
        "json_schema_extra": {
            "example": {
                "type": "vaccination",
                "date": "2024-12-01T00:00:00Z",
                "description": "Rabies vaccination",
                "photos": [],
                "notes": "Next due in 1 year"
            }
        }
    }


class MedicalHistoryCreate(MedicalHistoryBase):
    """Model for creating medical history entry"""
    pass


class MedicalHistoryInDB(MedicalHistoryBase):
    """Medical history model as stored in database"""
    id: Optional[str] = Field(default=None, alias="_id")
    pet_id: str = Field(alias="petId")
    created_at: datetime = Field(default_factory=datetime.utcnow, alias="createdAt")

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }


class MedicalHistoryResponse(BaseModel):
    """Medical history model for API responses"""
    id: str
    pet_id: str = Field(alias="petId")
    type: MedicalHistoryType
    date: datetime
    description: str
    photos: List[str] = Field(default_factory=list)
    notes: Optional[str] = None
    created_at: datetime = Field(alias="createdAt")

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "petId": "507f1f77bcf86cd799439012",
                "type": "vaccination",
                "date": "2024-12-01T00:00:00Z",
                "description": "Rabies vaccination",
                "photos": [],
                "notes": "Next due in 1 year",
                "createdAt": "2025-01-01T00:00:00Z"
            }
        }
    }