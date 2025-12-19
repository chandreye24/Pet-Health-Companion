"""
Symptom checker routes for AI-powered health assessments
"""
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Dict, Optional, Any
from datetime import datetime
from bson import ObjectId
import logging

from app.models.symptom_check import (
    SymptomCheckCreate,
    SymptomCheckResponse,
    SymptomCheckFeedback,
    DetailedSection,
    ChatMessage
)
from app.models.user import UserInDB
from app.utils.dependencies import get_current_user, get_current_user_optional
from app.database import get_database
from app.services.ai_service import ai_service


router = APIRouter(prefix="/api/v1/symptom-checks", tags=["Symptom Checker"])
logger = logging.getLogger(__name__)


@router.post("", response_model=SymptomCheckResponse, status_code=status.HTTP_201_CREATED)
async def submit_symptom_check(
    symptom_data: SymptomCheckCreate,
    current_user: Optional[UserInDB] = Depends(get_current_user_optional)
) -> SymptomCheckResponse:
    """
    Submit symptom check for AI analysis
    
    This endpoint supports both authenticated and anonymous users.
    Authenticated users will have their symptom checks saved to history.
    
    Args:
        symptom_data: Symptom check data
        current_user: Current authenticated user (optional)
    
    Returns:
        SymptomCheckResponse: AI assessment with risk level and recommendations
    
    Raises:
        HTTPException: If validation fails
    """
    db = get_database()
    
    # Log incoming data for debugging
    print("\n" + "="*80)
    print("SYMPTOM CHECK ENDPOINT - REQUEST RECEIVED")
    print("="*80)
    logger.info(f"=== SYMPTOM CHECK REQUEST ===")
    logger.info(f"Raw symptom_data: {symptom_data}")
    logger.info(f"symptom_data.model_dump(): {symptom_data.model_dump()}")
    print(f"Symptoms: '{symptom_data.symptoms}'")
    print(f"Symptoms length: {len(symptom_data.symptoms) if symptom_data.symptoms else 0}")
    print(f"Images count: {len(symptom_data.images) if symptom_data.images else 0}")
    print(f"Video: {bool(symptom_data.video)}")
    print(f"Category: {symptom_data.category}")
    print(f"Pet ID: {symptom_data.pet_id}")
    logger.info(f"Symptoms: '{symptom_data.symptoms}'")
    logger.info(f"Symptoms length: {len(symptom_data.symptoms) if symptom_data.symptoms else 0}")
    logger.info(f"Images count: {len(symptom_data.images) if symptom_data.images else 0}")
    logger.info(f"Video: {bool(symptom_data.video)}")
    logger.info(f"Category: {symptom_data.category}")
    logger.info(f"Pet ID: {symptom_data.pet_id}")
    print("="*80 + "\n")
    
    # Validate input - require either symptoms text OR media
    has_symptoms = symptom_data.symptoms is not None and len(symptom_data.symptoms.strip()) >= 10
    has_media = (symptom_data.images and len(symptom_data.images) > 0) or symptom_data.video
    
    logger.info(f"Has symptoms: {has_symptoms}, Has media: {has_media}")
    
    if not has_symptoms and not has_media:
        logger.error("Validation failed: No symptoms or media provided")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide at least 10 characters of symptom description or upload media"
        )
    
    # Validate image count
    if symptom_data.images and len(symptom_data.images) > 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 3 images allowed"
        )
    
    # Get comprehensive pet context if petId provided
    pet_context = None
    
    if symptom_data.pet_id:
        # Validate ObjectId
        if not ObjectId.is_valid(symptom_data.pet_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid pet ID"
            )
        
        pet = await db.pets.find_one({"_id": ObjectId(symptom_data.pet_id)})
        if pet:
            # Verify pet belongs to current user if authenticated
            if current_user and pet["userId"] != str(current_user.id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to access this pet"
                )
            
            # Build comprehensive pet context
            pet_context = {
                "name": pet.get("name"),
                "breed": pet.get("breed"),
                "age": pet.get("age"),
                "gender": pet.get("gender"),
                "weight": pet.get("weight"),
                "lifestyle": pet.get("lifestyle"),
                "conditions": pet.get("conditions", []),
                "allergies": pet.get("allergies", [])
            }
            
            # Get previous symptom check history (last 5 checks)
            try:
                history = await db.symptom_checks.find({
                    "petId": symptom_data.pet_id
                }).sort("timestamp", -1).limit(5).to_list(length=5)
                
                pet_context["history"] = []
                pet_context["resolved_history"] = []
                
                for check in history:
                    check_data = {
                        "date": check.get("timestamp"),
                        "category": check.get("category"),
                        "subcategory": check.get("healthSubcategory"),
                        "riskLevel": check.get("riskLevel"),
                        "summary": check.get("summary"),
                        "resolved": check.get("resolved", False)
                    }
                    
                    # Separate active and resolved issues
                    if check.get("resolved", False):
                        pet_context["resolved_history"].append(check_data)
                    else:
                        pet_context["history"].append(check_data)
                        
            except Exception as e:
                logger.warning(f"Failed to load pet history: {e}")
                pet_context["history"] = []
                pet_context["resolved_history"] = []
            
            # Get season and location context if user is authenticated
            if current_user:
                from datetime import datetime
                current_month = datetime.now().month
                
                if 3 <= current_month <= 6:
                    pet_context["season"] = "Summer"
                elif 7 <= current_month <= 9:
                    pet_context["season"] = "Monsoon"
                else:
                    pet_context["season"] = "Winter"
                
                # Add user location if available
                if current_user.address:
                    pet_context["location"] = {
                        "city": current_user.address.city,
                        "state": current_user.address.state,
                        "pincode": current_user.address.zip_code
                    }
                elif current_user.location:
                    pet_context["location"] = {
                        "city": current_user.location.city,
                        "state": current_user.location.state
                    }
    
    # Call AI service for analysis
    try:
        print("\n" + "="*80)
        print("CALLING AI SERVICE")
        print("="*80 + "\n")
        ai_response = await ai_service.analyze_symptoms(
            symptoms=symptom_data.symptoms or "",
            category=symptom_data.category,
            subcategory=symptom_data.health_subcategory,
            pet_context=pet_context,
            images=symptom_data.images,
            video=symptom_data.video
        )
        print("\n" + "="*80)
        print("AI SERVICE RETURNED SUCCESSFULLY")
        print("="*80 + "\n")
    except Exception as e:
        print("\n" + "="*80)
        print("AI SERVICE ERROR IN ROUTE")
        print("="*80)
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        import traceback
        print(f"Traceback:\n{traceback.format_exc()}")
        print("="*80 + "\n")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI analysis failed: {str(e)}"
        )
    
    # Prepare symptom check document
    symptom_check_dict = {
        "userId": str(current_user.id) if current_user else None,
        "petId": symptom_data.pet_id,
        "category": symptom_data.category,
        "healthSubcategory": symptom_data.health_subcategory,
        "symptoms": symptom_data.symptoms or "",
        "images": symptom_data.images or [],
        "video": symptom_data.video,
        "riskLevel": ai_response["riskLevel"],
        "summary": ai_response["summary"],
        "detailedSections": ai_response["detailedSections"],
        "immediateActions": ai_response["immediateActions"],
        "reasoning": ai_response["reasoning"],
        "messages": [],  # Will be populated by frontend
        "feedback": None,
        "feedbackReason": None,
        "resolved": False,  # New checks are not resolved by default
        "resolvedAt": None,
        "timestamp": datetime.utcnow()
    }
    
    # Save to database if user is authenticated
    symptom_check_id = None
    if current_user:
        result = await db.symptom_checks.insert_one(symptom_check_dict)
        symptom_check_id = str(result.inserted_id)
    else:
        # For anonymous users, generate a temporary ID
        symptom_check_id = str(ObjectId())
    
    # Prepare response
    return SymptomCheckResponse(
        id=symptom_check_id,
        userId=str(current_user.id) if current_user else None,
        petId=symptom_data.pet_id,
        category=symptom_data.category,
        healthSubcategory=symptom_data.health_subcategory,
        symptoms=symptom_data.symptoms or "",
        riskLevel=ai_response["riskLevel"],
        summary=ai_response["summary"],
        detailedSections=[
            DetailedSection(**section) for section in ai_response["detailedSections"]
        ],
        immediateActions=ai_response["immediateActions"],
        reasoning=ai_response["reasoning"],
        resolved=False,
        resolved_at=None,
        timestamp=symptom_check_dict["timestamp"]
    )


@router.get("", response_model=List[SymptomCheckResponse])
async def get_symptom_check_history(
    current_user: UserInDB = Depends(get_current_user)
) -> List[SymptomCheckResponse]:
    """
    Get symptom check history for current user
    
    Args:
        current_user: Current authenticated user
    
    Returns:
        List[SymptomCheckResponse]: List of symptom checks
    """
    db = get_database()
    
    # Get all symptom checks for user, sorted by timestamp (newest first)
    cursor = db.symptom_checks.find({"userId": str(current_user.id)}).sort("timestamp", -1)
    checks = await cursor.to_list(length=None)
    
    return [
        SymptomCheckResponse(
            id=str(check["_id"]),
            userId=check.get("userId"),
            petId=check.get("petId"),
            category=check["category"],
            healthSubcategory=check.get("healthSubcategory"),
            symptoms=check["symptoms"],
            riskLevel=check["riskLevel"],
            summary=check["summary"],
            detailedSections=[
                DetailedSection(**section) for section in check["detailedSections"]
            ],
            immediateActions=check["immediateActions"],
            reasoning=check["reasoning"],
            messages=[ChatMessage(**msg) for msg in check.get("messages", [])],
            feedback=check.get("feedback"),
            feedbackReason=check.get("feedbackReason"),
            resolved=check.get("resolved", False),
            resolved_at=check.get("resolvedAt"),
            timestamp=check["timestamp"]
        )
        for check in checks
    ]


@router.get("/{check_id}", response_model=SymptomCheckResponse)
async def get_symptom_check(
    check_id: str,
    current_user: UserInDB = Depends(get_current_user)
) -> SymptomCheckResponse:
    """
    Get specific symptom check details
    
    Args:
        check_id: Symptom check ID
        current_user: Current authenticated user
    
    Returns:
        SymptomCheckResponse: Symptom check data
    
    Raises:
        HTTPException: If check not found or doesn't belong to user
    """
    db = get_database()
    
    # Validate ObjectId
    if not ObjectId.is_valid(check_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid symptom check ID"
        )
    
    # Get symptom check
    check = await db.symptom_checks.find_one({"_id": ObjectId(check_id)})
    
    if not check:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Symptom check not found"
        )
    
    # Verify check belongs to current user
    if check.get("userId") != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this symptom check"
        )
    
    return SymptomCheckResponse(
        id=str(check["_id"]),
        userId=check.get("userId"),
        petId=check.get("petId"),
        category=check["category"],
        healthSubcategory=check.get("healthSubcategory"),
        symptoms=check["symptoms"],
        riskLevel=check["riskLevel"],
        summary=check["summary"],
        detailedSections=[
            DetailedSection(**section) for section in check["detailedSections"]
        ],
        immediateActions=check["immediateActions"],
        reasoning=check["reasoning"],
        messages=[ChatMessage(**msg) for msg in check.get("messages", [])],
        feedback=check.get("feedback"),
        feedbackReason=check.get("feedbackReason"),
        resolved=check.get("resolved", False),
        resolved_at=check.get("resolvedAt"),
        timestamp=check["timestamp"]
    )


@router.post("/{check_id}/feedback", status_code=status.HTTP_200_OK)
async def submit_feedback(
    check_id: str,
    feedback_data: SymptomCheckFeedback,
    current_user: Optional[UserInDB] = Depends(get_current_user_optional)
) -> Dict[str, str]:
    """
    Submit feedback on symptom check assessment
    
    This endpoint supports both authenticated and anonymous users.
    
    Args:
        check_id: Symptom check ID
        feedback_data: Feedback data
        current_user: Current authenticated user (optional)
    
    Returns:
        Dict with success message
    
    Raises:
        HTTPException: If check not found
    """
    db = get_database()
    
    # Validate ObjectId
    if not ObjectId.is_valid(check_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid symptom check ID"
        )
    
    # Get symptom check
    check = await db.symptom_checks.find_one({"_id": ObjectId(check_id)})
    
    if not check:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Symptom check not found"
        )
    
    # If user is authenticated, verify ownership
    if current_user and check.get("userId") != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to provide feedback on this symptom check"
        )
    
    # Update feedback
    await db.symptom_checks.update_one(
        {"_id": ObjectId(check_id)},
        {
            "$set": {
                "feedback": feedback_data.feedback,
                "feedbackReason": feedback_data.feedback_reason
            }
        }
    )
    
    return {"message": "Thank you for your feedback"}


@router.get("/pet/{pet_id}", response_model=List[SymptomCheckResponse])
async def get_pet_symptom_checks(
    pet_id: str,
    current_user: UserInDB = Depends(get_current_user)
) -> List[SymptomCheckResponse]:
    """
    Get symptom check history for a specific pet
    
    Args:
        pet_id: Pet ID
        current_user: Current authenticated user
    
    Returns:
        List[SymptomCheckResponse]: List of symptom checks for the pet
    
    Raises:
        HTTPException: If pet not found or doesn't belong to user
    """
    db = get_database()
    
    # Validate ObjectId
    if not ObjectId.is_valid(pet_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid pet ID"
        )
    
    # Verify pet belongs to current user
    pet = await db.pets.find_one({"_id": ObjectId(pet_id)})
    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet not found"
        )
    
    if pet["userId"] != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this pet"
        )
    
    # Get all symptom checks for pet, sorted by timestamp (newest first)
    cursor = db.symptom_checks.find({
        "petId": pet_id,
        "userId": str(current_user.id)
    }).sort("timestamp", -1)
    checks = await cursor.to_list(length=None)
    
    return [
        SymptomCheckResponse(
            id=str(check["_id"]),
            userId=check.get("userId"),
            petId=check.get("petId"),
            category=check["category"],
            healthSubcategory=check.get("healthSubcategory"),
            symptoms=check["symptoms"],
            riskLevel=check["riskLevel"],
            summary=check["summary"],
            detailedSections=[
                DetailedSection(**section) for section in check["detailedSections"]
            ],
            immediateActions=check["immediateActions"],
            reasoning=check["reasoning"],
            messages=[ChatMessage(**msg) for msg in check.get("messages", [])],
            feedback=check.get("feedback"),
            feedbackReason=check.get("feedbackReason"),
            resolved=check.get("resolved", False),
            resolved_at=check.get("resolvedAt"),
            timestamp=check["timestamp"]
        )
        for check in checks
    ]


@router.patch("/{check_id}/messages", status_code=status.HTTP_200_OK)
async def update_chat_messages(
    check_id: str,
    messages: List[Dict[str, Any]],
    current_user: Optional[UserInDB] = Depends(get_current_user_optional)
) -> Dict[str, str]:
    """
    Update chat messages for a symptom check session
    
    This endpoint allows updating the complete chat history after the session is complete.
    
    Args:
        check_id: Symptom check ID
        messages: List of chat messages
        current_user: Current authenticated user (optional)
    
    Returns:
        Dict with success message
    
    Raises:
        HTTPException: If check not found
    """
    logger.info(f"=== UPDATE CHAT MESSAGES ENDPOINT CALLED ===")
    logger.info(f"Check ID: {check_id}")
    logger.info(f"Current User: {current_user.email if current_user else 'Anonymous'}")
    logger.info(f"Number of messages: {len(messages)}")
    logger.info(f"Messages: {messages}")
    
    db = get_database()
    
    # Validate ObjectId
    if not ObjectId.is_valid(check_id):
        logger.error(f"Invalid check ID: {check_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid symptom check ID"
        )
    
    # Get symptom check
    check = await db.symptom_checks.find_one({"_id": ObjectId(check_id)})
    
    if not check:
        logger.error(f"Symptom check not found: {check_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Symptom check not found"
        )
    
    logger.info(f"Found symptom check: {check.get('_id')}")
    logger.info(f"Check userId: {check.get('userId')}")
    
    # If user is authenticated, verify ownership
    if current_user and check.get("userId") != str(current_user.id):
        logger.error(f"Authorization failed - Check userId: {check.get('userId')}, Current user: {str(current_user.id)}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this symptom check"
        )
    
    # Update messages
    result = await db.symptom_checks.update_one(
        {"_id": ObjectId(check_id)},
        {"$set": {"messages": messages}}
    )
    
    logger.info(f"Update result - Matched: {result.matched_count}, Modified: {result.modified_count}")
    logger.info("Chat messages updated successfully")
    
    return {"message": "Chat messages updated successfully"}


@router.delete("/{check_id}", status_code=status.HTTP_200_OK)
async def delete_symptom_check(
    check_id: str,
    current_user: UserInDB = Depends(get_current_user)
) -> Dict[str, str]:
    """
    Delete a symptom check
    
    Args:
        check_id: Symptom check ID
        current_user: Current authenticated user
    
    Returns:
        Dict with success message
    
    Raises:
        HTTPException: If check not found or doesn't belong to user
    """
    db = get_database()
    
    # Validate ObjectId
    if not ObjectId.is_valid(check_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid symptom check ID"
        )
    
    # Get symptom check
    check = await db.symptom_checks.find_one({"_id": ObjectId(check_id)})
    
    if not check:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Symptom check not found"
        )
    
    # Verify check belongs to current user
    if check.get("userId") != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this symptom check"
        )
    
    # Delete the symptom check
    await db.symptom_checks.delete_one({"_id": ObjectId(check_id)})
    
    return {"message": "Symptom check deleted successfully"}


@router.patch("/{check_id}/resolve", status_code=status.HTTP_200_OK)
async def mark_symptom_check_resolved(
    check_id: str,
    resolved: bool,
    current_user: UserInDB = Depends(get_current_user)
) -> Dict[str, str]:
    """
    Mark a symptom check as resolved or unresolved
    
    Args:
        check_id: Symptom check ID
        resolved: Whether the concern has been addressed
        current_user: Current authenticated user
    
    Returns:
        Dict with success message
    
    Raises:
        HTTPException: If check not found or doesn't belong to user
    """
    db = get_database()
    
    # Validate ObjectId
    if not ObjectId.is_valid(check_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid symptom check ID"
        )
    
    # Get symptom check
    check = await db.symptom_checks.find_one({"_id": ObjectId(check_id)})
    
    if not check:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Symptom check not found"
        )
    
    # Verify check belongs to current user
    if check.get("userId") != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this symptom check"
        )
    
    # Update resolved status
    update_data = {
        "resolved": resolved,
        "resolvedAt": datetime.utcnow() if resolved else None
    }
    
    await db.symptom_checks.update_one(
        {"_id": ObjectId(check_id)},
        {"$set": update_data}
    )
    
    message = "Concern marked as resolved" if resolved else "Concern marked as unresolved"
    return {"message": message}