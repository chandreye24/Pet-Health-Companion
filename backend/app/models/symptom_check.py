"""
Symptom check model for MongoDB with Pydantic v2
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
from enum import Enum


class HealthCategory(str, Enum):
    """Health category enumeration"""
    NUTRITION = "Nutrition"
    EXERCISE = "Exercise"
    GROOMING = "Grooming"
    HEALTH = "Health"
    SEASONAL = "Seasonal"


class RiskLevel(str, Enum):
    """Risk level enumeration"""
    EMERGENCY = "Emergency"
    URGENT = "Urgent"
    MONITOR = "Monitor"
    LOW_RISK = "Low Risk"


class FeedbackType(str, Enum):
    """Feedback type enumeration"""
    UP = "up"
    DOWN = "down"


class DetailedSection(BaseModel):
    """Detailed section in symptom check response"""
    title: str
    points: List[str]


class ChatMessage(BaseModel):
    """Chat message in symptom check session"""
    id: str
    type: str  # 'bot' or 'user'
    content: str
    timestamp: datetime
    image: Optional[str] = None
    options: Optional[List[Dict[str, str]]] = None


class SymptomCheckBase(BaseModel):
    """Base symptom check model"""
    pet_id: Optional[str] = Field(None, alias="petId")
    category: HealthCategory
    health_subcategory: Optional[str] = Field(None, alias="healthSubcategory")
    symptoms: Optional[str] = Field(default=None, max_length=5000)  # Increased to handle longer descriptions
    images: Optional[List[str]] = Field(default_factory=list)  # Base64 strings, max 3 validated in endpoint
    video: Optional[str] = None  # Base64 string
    
    @field_validator('images')
    @classmethod
    def validate_image_count(cls, v: List[str]) -> List[str]:
        """Validate maximum 3 images"""
        if v and len(v) > 3:
            raise ValueError('Maximum 3 images allowed')
        return v

    @field_validator('symptoms')
    @classmethod
    def validate_symptoms_or_media(cls, v: str, info) -> str:
        """Validate that either symptoms text or media is provided"""
        # This will be checked in the endpoint
        return v

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "petId": "507f1f77bcf86cd799439011",
                "category": "Health",
                "healthSubcategory": "Digestive Issues",
                "symptoms": "Dog has been vomiting for 2 days",
                "images": [],
                "video": None
            }
        }
    }


class SymptomCheckCreate(SymptomCheckBase):
    """Model for creating symptom check"""
    pass


class SymptomCheckInDB(SymptomCheckBase):
    """Symptom check model as stored in database"""
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: Optional[str] = Field(None, alias="userId")  # Nullable for anonymous checks
    risk_level: RiskLevel = Field(alias="riskLevel")
    summary: str
    detailed_sections: List[DetailedSection] = Field(alias="detailedSections")
    immediate_actions: List[str] = Field(alias="immediateActions")
    reasoning: str
    messages: Optional[List[ChatMessage]] = Field(default_factory=list)  # Complete chat history
    feedback: Optional[FeedbackType] = None
    feedback_reason: Optional[str] = Field(None, alias="feedbackReason")
    resolved: bool = False  # Flag to indicate if the concern has been addressed
    resolved_at: Optional[datetime] = Field(None, alias="resolvedAt")  # When it was marked as resolved
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }


class SymptomCheckResponse(BaseModel):
    """Symptom check model for API responses"""
    id: str
    user_id: Optional[str] = Field(None, alias="userId")
    pet_id: Optional[str] = Field(None, alias="petId")
    category: HealthCategory
    health_subcategory: Optional[str] = Field(None, alias="healthSubcategory")
    symptoms: Optional[str] = None
    risk_level: RiskLevel = Field(alias="riskLevel")
    summary: str
    detailed_sections: List[DetailedSection] = Field(alias="detailedSections")
    immediate_actions: List[str] = Field(alias="immediateActions")
    reasoning: str
    messages: Optional[List[ChatMessage]] = Field(default_factory=list)  # Complete chat history
    feedback: Optional[FeedbackType] = None
    feedback_reason: Optional[str] = Field(None, alias="feedbackReason")
    resolved: bool = False  # Flag to indicate if the concern has been addressed
    resolved_at: Optional[datetime] = Field(None, alias="resolvedAt")  # When it was marked as resolved
    timestamp: datetime
    disclaimer: str = "This AI assessment is for informational purposes only and does not replace professional veterinary advice. Always consult a licensed veterinarian for medical concerns."

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "userId": "507f1f77bcf86cd799439012",
                "petId": "507f1f77bcf86cd799439013",
                "category": "Health",
                "healthSubcategory": "Digestive Issues",
                "symptoms": "Dog has been vomiting for 2 days",
                "riskLevel": "Urgent",
                "summary": "Persistent vomiting requires vet attention",
                "detailedSections": [
                    {
                        "title": "Immediate Care",
                        "points": ["Withhold food for 12 hours", "Provide small amounts of water"]
                    }
                ],
                "immediateActions": ["Contact vet within 24 hours"],
                "reasoning": "Vomiting for 2+ days can lead to dehydration",
                "timestamp": "2025-01-01T00:00:00Z",
                "disclaimer": "This AI assessment is for informational purposes only..."
            }
        }
    }


class SymptomCheckFeedback(BaseModel):
    """Model for submitting feedback on symptom check"""
    feedback: FeedbackType
    feedback_reason: Optional[str] = Field(None, alias="feedbackReason")

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "feedback": "down",
                "feedbackReason": "Assessment was not accurate"
            }
        }
    }