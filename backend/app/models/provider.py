"""
Veterinary provider model for MongoDB with Pydantic v2
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId


class ProviderBase(BaseModel):
    """Base provider model"""
    name: str = Field(..., min_length=1, max_length=200)
    phone: str
    address: str = Field(..., min_length=1, max_length=500)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    operating_hours: str = Field(alias="operatingHours")
    rating: float = Field(default=0.0, ge=0, le=5)
    is_24x7: bool = Field(default=False, alias="is24x7")
    services: Optional[List[str]] = Field(default_factory=list)

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "name": "Pet Care Veterinary Clinic",
                "phone": "+919876543210",
                "address": "Shop 12, Linking Road, Bandra West",
                "city": "Mumbai",
                "state": "Maharashtra",
                "latitude": 19.0596,
                "longitude": 72.8295,
                "operatingHours": "9:00 AM - 9:00 PM",
                "rating": 4.5,
                "is24x7": False,
                "services": ["General Checkup", "Surgery", "Emergency Care"]
            }
        }
    }


class ProviderCreate(ProviderBase):
    """Model for creating provider"""
    pass


class ProviderInDB(ProviderBase):
    """Provider model as stored in database"""
    id: Optional[str] = Field(default=None, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow, alias="createdAt")
    updated_at: datetime = Field(default_factory=datetime.utcnow, alias="updatedAt")

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }


class ProviderResponse(BaseModel):
    """Provider model for API responses"""
    id: str
    name: str
    phone: str
    address: str
    city: str
    state: str
    latitude: float
    longitude: float
    operating_hours: str = Field(alias="operatingHours")
    rating: float
    is_24x7: bool = Field(alias="is24x7")
    services: List[str] = Field(default_factory=list)
    distance: Optional[float] = None  # Distance in km (calculated)

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "name": "Pet Care Veterinary Clinic",
                "phone": "+919876543210",
                "address": "Shop 12, Linking Road, Bandra West",
                "city": "Mumbai",
                "state": "Maharashtra",
                "latitude": 19.0596,
                "longitude": 72.8295,
                "operatingHours": "9:00 AM - 9:00 PM",
                "rating": 4.5,
                "is24x7": False,
                "services": ["General Checkup", "Surgery", "Emergency Care"],
                "distance": 2.5
            }
        }
    }