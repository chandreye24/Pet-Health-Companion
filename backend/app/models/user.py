"""
User model for MongoDB with Pydantic v2
"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic"""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, info):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


class Location(BaseModel):
    """User location model"""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    city: str
    state: str


class Address(BaseModel):
    """User address model"""
    street: Optional[str] = None
    city: str
    state: str
    zip_code: str = Field(alias="zipCode")
    country: str = "India"

    model_config = {
        "populate_by_name": True
    }


class UserBase(BaseModel):
    """Base user model with common fields"""
    email: EmailStr
    name: str
    contact_number: Optional[str] = Field(default=None, alias="contactNumber")
    emergency_contact: Optional[str] = Field(default=None, alias="emergencyContact")
    address: Optional[Address] = None
    location: Optional[Location] = None
    terms_accepted: bool = Field(default=False, alias="termsAccepted")
    age_confirmed: bool = Field(default=False, alias="ageConfirmed")

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "email": "user@example.com",
                "name": "John Doe",
                "contactNumber": "+919876543210",
                "emergencyContact": "+919876543211",
                "address": {
                    "street": "123 Main St",
                    "city": "Mumbai",
                    "state": "Maharashtra",
                    "zipCode": "400001",
                    "country": "India"
                },
                "termsAccepted": True,
                "ageConfirmed": True
            }
        }
    }


class UserCreate(UserBase):
    """Model for creating a new user"""
    pass


class UserUpdate(BaseModel):
    """Model for updating user profile"""
    name: Optional[str] = None
    contact_number: Optional[str] = Field(default=None, alias="contactNumber")
    emergency_contact: Optional[str] = Field(default=None, alias="emergencyContact")
    address: Optional[Address] = None
    location: Optional[Location] = None

    model_config = {
        "populate_by_name": True
    }


class UserInDB(UserBase):
    """User model as stored in database"""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    password_hash: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }


class UserResponse(BaseModel):
    """User model for API responses"""
    id: str
    email: str
    name: str
    contact_number: Optional[str] = Field(default=None, alias="contactNumber")
    emergency_contact: Optional[str] = Field(default=None, alias="emergencyContact")
    address: Optional[Address] = None
    location: Optional[Location] = None
    terms_accepted: bool = Field(alias="termsAccepted")
    age_confirmed: bool = Field(alias="ageConfirmed")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "email": "user@example.com",
                "name": "John Doe",
                "contactNumber": "+919876543210",
                "emergencyContact": "+919876543211",
                "address": {
                    "street": "123 Main St",
                    "city": "Mumbai",
                    "state": "Maharashtra",
                    "zipCode": "400001",
                    "country": "India"
                },
                "location": {
                    "latitude": 19.0760,
                    "longitude": 72.8777,
                    "city": "Mumbai",
                    "state": "Maharashtra"
                },
                "termsAccepted": True,
                "ageConfirmed": True,
                "createdAt": "2025-01-01T00:00:00Z",
                "updatedAt": "2025-01-01T00:00:00Z"
            }
        }
    }