"""
Authentication routes for user signup, login, and profile management
"""
from fastapi import APIRouter, HTTPException, status, Depends
from typing import Dict, Any
from datetime import datetime
from bson import ObjectId

from app.models.user import UserCreate, UserResponse, UserUpdate, UserInDB
from app.utils.security import create_access_token
from app.utils.dependencies import get_current_user
from app.database import get_database


router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post("/signup", status_code=status.HTTP_200_OK)
async def signup(user_data: UserCreate) -> Dict[str, Any]:
    """
    Register a new user
    
    Args:
        user_data: User registration data
    
    Returns:
        Dict with JWT token and user data
    
    Raises:
        HTTPException: If user already exists or validation fails
    """
    db = get_database()
    
    # Validate terms and age confirmation
    if not user_data.terms_accepted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must accept the terms and conditions"
        )
    
    if not user_data.age_confirmed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must be 18 years or older to use this service"
        )
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Create user document
    user_dict = user_data.model_dump(by_alias=True)
    user_dict["created_at"] = datetime.utcnow()
    user_dict["updated_at"] = datetime.utcnow()
    user_dict["password_hash"] = None  # For future password auth
    
    result = await db.users.insert_one(user_dict)
    user_id = str(result.inserted_id)
    
    # Generate JWT token
    access_token = create_access_token(data={"sub": user_id})
    
    # Prepare user response
    user_response = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "contactNumber": user_data.contact_number,
        "emergencyContact": user_data.emergency_contact,
        "address": user_data.address.model_dump(by_alias=True) if user_data.address else None,
        "location": user_data.location.model_dump() if user_data.location else None,
        "termsAccepted": user_data.terms_accepted,
        "ageConfirmed": user_data.age_confirmed,
        "createdAt": user_dict["created_at"].isoformat(),
        "updatedAt": user_dict["updated_at"].isoformat()
    }
    
    return {
        "token": access_token,
        "user": user_response
    }


@router.post("/login", status_code=status.HTTP_200_OK)
async def login(login_data: Dict[str, str]) -> Dict[str, Any]:
    """
    Login existing user
    
    Args:
        login_data: Dict with email
    
    Returns:
        Dict with JWT token and user data
    
    Raises:
        HTTPException: If user not found
    """
    db = get_database()
    
    email = login_data.get("email")
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required"
        )
    
    # Find user
    user = await db.users.find_one({"email": email})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user_id = str(user["_id"])
    
    # Generate JWT token
    access_token = create_access_token(data={"sub": user_id})
    
    # Prepare user response
    user_response = {
        "id": user_id,
        "email": user["email"],
        "name": user["name"],
        "contactNumber": user.get("contact_number"),
        "emergencyContact": user.get("emergency_contact"),
        "address": user.get("address"),
        "location": user.get("location"),
        "termsAccepted": user.get("terms_accepted", user.get("termsAccepted", False)),
        "ageConfirmed": user.get("age_confirmed", user.get("ageConfirmed", False)),
        "createdAt": user["created_at"].isoformat() if isinstance(user["created_at"], datetime) else user["created_at"],
        "updatedAt": user["updated_at"].isoformat() if isinstance(user["updated_at"], datetime) else user["updated_at"]
    }
    
    return {
        "token": access_token,
        "user": user_response
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: UserInDB = Depends(get_current_user)
) -> UserResponse:
    """
    Get current authenticated user profile
    
    Args:
        current_user: Current authenticated user from JWT
    
    Returns:
        UserResponse: User profile data
    """
    return UserResponse(
        id=str(current_user.id) if current_user.id else "",
        email=current_user.email,
        name=current_user.name,
        contactNumber=current_user.contact_number,
        emergencyContact=current_user.emergency_contact,
        address=current_user.address,
        location=current_user.location,
        termsAccepted=current_user.terms_accepted,
        ageConfirmed=current_user.age_confirmed,
        createdAt=current_user.created_at,
        updatedAt=current_user.updated_at
    )


@router.patch("/me", response_model=UserResponse)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: UserInDB = Depends(get_current_user)
) -> UserResponse:
    """
    Update current user profile
    
    Args:
        user_update: User update data
        current_user: Current authenticated user from JWT
    
    Returns:
        UserResponse: Updated user profile
    """
    db = get_database()
    
    # Debug logging
    print(f"Received update request - Raw model: {user_update}")
    print(f"contact_number attribute: {user_update.contact_number}")
    print(f"Model dump: {user_update.model_dump(by_alias=False)}")
    
    # Build update data by directly checking model attributes
    update_data = {}
    
    # Check each field directly from the model
    if user_update.name is not None:
        update_data["name"] = user_update.name
    
    if user_update.contact_number is not None:
        update_data["contact_number"] = user_update.contact_number
        print(f"Adding contact_number to update_data: {user_update.contact_number}")
    
    if user_update.emergency_contact is not None:
        update_data["emergency_contact"] = user_update.emergency_contact
    
    if user_update.address is not None:
        update_data["address"] = user_update.address.model_dump(by_alias=True)
    
    if user_update.location is not None:
        update_data["location"] = user_update.location.model_dump()
    
    update_data["updated_at"] = datetime.utcnow()
    
    print(f"Final update_data to be saved: {update_data}")
    
    # Update user in database
    await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": update_data}
    )
    
    # Get updated user
    updated_user = await db.users.find_one({"_id": ObjectId(current_user.id)})
    
    return UserResponse(
        id=str(updated_user["_id"]),
        email=updated_user["email"],
        name=updated_user["name"],
        contactNumber=updated_user.get("contact_number"),
        emergencyContact=updated_user.get("emergency_contact"),
        address=updated_user.get("address"),
        location=updated_user.get("location"),
        termsAccepted=updated_user.get("terms_accepted", updated_user.get("termsAccepted", False)),
        ageConfirmed=updated_user.get("age_confirmed", updated_user.get("ageConfirmed", False)),
        createdAt=updated_user["created_at"],
        updatedAt=updated_user["updated_at"]
    )


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout() -> Dict[str, str]:
    """
    Logout user (token removal handled by frontend)
    
    Returns:
        Dict with success message
    """
    return {"message": "Logged out successfully"}