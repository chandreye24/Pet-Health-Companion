"""
Pet model for MongoDB with Pydantic v2
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from enum import Enum


class Lifestyle(str, Enum):
    """Pet lifestyle enumeration"""
    INDOOR = "indoor"
    OUTDOOR = "outdoor"
    MIXED = "mixed"


class Gender(str, Enum):
    """Pet gender enumeration"""
    MALE = "male"
    FEMALE = "female"


class PetBase(BaseModel):
    """Base pet model with common fields"""
    name: str = Field(..., min_length=1, max_length=100)
    breed: str = Field(..., min_length=1, max_length=100)
    age: float = Field(..., gt=0, le=30)  # Age in years
    gender: Gender = Field(...)  # Required gender field
    weight: Optional[float] = Field(None, gt=0, le=200)  # Weight in kg
    photo: Optional[str] = None  # Base64 or URL
    lifestyle: Optional[Lifestyle] = None
    conditions: Optional[List[str]] = Field(default_factory=list)
    allergies: Optional[List[str]] = Field(default_factory=list)

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "Max",
                "breed": "Labrador Retriever",
                "age": 3.5,
                "gender": "male",
                "weight": 28.5,
                "lifestyle": "mixed",
                "conditions": ["Hip Dysplasia"],
                "allergies": ["Chicken"]
            }
        }
    }


class PetCreate(PetBase):
    """Model for creating a new pet"""
    pass


class PetUpdate(BaseModel):
    """Model for updating pet profile"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    breed: Optional[str] = Field(None, min_length=1, max_length=100)
    age: Optional[float] = Field(None, gt=0, le=30)
    gender: Optional[Gender] = None
    weight: Optional[float] = Field(None, gt=0, le=200)
    photo: Optional[str] = None
    lifestyle: Optional[Lifestyle] = None
    conditions: Optional[List[str]] = None
    allergies: Optional[List[str]] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "weight": 30.0,
                "conditions": ["Hip Dysplasia", "Arthritis"]
            }
        }
    }


class PetInDB(PetBase):
    """Pet model as stored in database"""
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str = Field(alias="userId")
    created_at: datetime = Field(default_factory=datetime.utcnow, alias="createdAt")
    updated_at: datetime = Field(default_factory=datetime.utcnow, alias="updatedAt")

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }


class PetResponse(BaseModel):
    """Pet model for API responses"""
    id: str
    user_id: str = Field(alias="userId")
    name: str
    breed: str
    age: float
    gender: Gender
    weight: Optional[float] = None
    photo: Optional[str] = None
    lifestyle: Optional[Lifestyle] = None
    conditions: List[str] = Field(default_factory=list)
    allergies: List[str] = Field(default_factory=list)
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "userId": "507f1f77bcf86cd799439012",
                "name": "Max",
                "breed": "Labrador Retriever",
                "age": 3.5,
                "gender": "male",
                "weight": 28.5,
                "lifestyle": "mixed",
                "conditions": ["Hip Dysplasia"],
                "allergies": ["Chicken"],
                "createdAt": "2025-01-01T00:00:00Z",
                "updatedAt": "2025-01-01T00:00:00Z"
            }
        }
    }