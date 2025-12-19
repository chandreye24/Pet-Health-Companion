"""
Pet profile management routes
"""
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Dict
from datetime import datetime
from bson import ObjectId

from app.models.pet import PetCreate, PetUpdate, PetResponse
from app.models.medical_history import MedicalHistoryCreate, MedicalHistoryResponse
from app.models.user import UserInDB
from app.utils.dependencies import get_current_user
from app.database import get_database


router = APIRouter(prefix="/api/v1/pets", tags=["Pets"])


@router.post("/", response_model=PetResponse, status_code=status.HTTP_201_CREATED)
async def create_pet(
    pet_data: PetCreate,
    current_user: UserInDB = Depends(get_current_user)
) -> PetResponse:
    """
    Create a new pet profile
    
    Args:
        pet_data: Pet creation data
        current_user: Current authenticated user
    
    Returns:
        PetResponse: Created pet data
    
    Raises:
        HTTPException: If user has reached max pets limit (10)
    """
    db = get_database()
    
    print("=" * 80)
    print("BACKEND - CREATE PET REQUEST RECEIVED")
    print("=" * 80)
    print(f"Raw pet_data object: {pet_data}")
    print(f"pet_data.conditions attribute: {pet_data.conditions}")
    print(f"pet_data.allergies attribute: {pet_data.allergies}")
    print(f"Type of conditions: {type(pet_data.conditions)}")
    print(f"Type of allergies: {type(pet_data.allergies)}")
    
    # Check if user has reached max pets limit
    pet_count = await db.pets.count_documents({"userId": str(current_user.id)})
    if pet_count >= 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum of 10 pets allowed per user"
        )
    
    # Create pet document
    pet_dict = pet_data.model_dump()
    print(f"After model_dump(): {pet_dict}")
    print(f"conditions in dict: {pet_dict.get('conditions')}")
    print(f"allergies in dict: {pet_dict.get('allergies')}")
    
    pet_dict["userId"] = str(current_user.id)
    pet_dict["createdAt"] = datetime.utcnow()
    pet_dict["updatedAt"] = datetime.utcnow()
    
    # Ensure conditions and allergies are lists, not None
    if pet_dict.get("conditions") is None:
        pet_dict["conditions"] = []
        print("WARNING: conditions was None, set to empty array")
    if pet_dict.get("allergies") is None:
        pet_dict["allergies"] = []
        print("WARNING: allergies was None, set to empty array")
    
    print(f"Final pet_dict to be inserted into database: {pet_dict}")
    print("=" * 80)
    
    result = await db.pets.insert_one(pet_dict)
    pet_id = str(result.inserted_id)
    
    # Get created pet
    created_pet = await db.pets.find_one({"_id": result.inserted_id})
    
    return PetResponse(
        id=pet_id,
        userId=created_pet["userId"],
        name=created_pet["name"],
        breed=created_pet["breed"],
        age=created_pet["age"],
        gender=created_pet["gender"],
        weight=created_pet.get("weight"),
        photo=created_pet.get("photo"),
        lifestyle=created_pet.get("lifestyle"),
        conditions=created_pet.get("conditions", []),
        allergies=created_pet.get("allergies", []),
        createdAt=created_pet["createdAt"],
        updatedAt=created_pet["updatedAt"]
    )


@router.get("/", response_model=List[PetResponse])
async def get_all_pets(
    current_user: UserInDB = Depends(get_current_user)
) -> List[PetResponse]:
    """
    Get all pets for current user
    
    Args:
        current_user: Current authenticated user
    
    Returns:
        List[PetResponse]: List of user's pets
    """
    db = get_database()
    
    # Get all pets for user, sorted by creation date (newest first)
    cursor = db.pets.find({"userId": str(current_user.id)}).sort("createdAt", -1)
    pets = await cursor.to_list(length=None)
    
    return [
        PetResponse(
            id=str(pet["_id"]),
            userId=pet["userId"],
            name=pet["name"],
            breed=pet["breed"],
            age=pet["age"],
            gender=pet.get("gender", "male"),  # Default to 'male' if not present
            weight=pet.get("weight"),
            photo=pet.get("photo"),
            lifestyle=pet.get("lifestyle"),
            conditions=pet.get("conditions", []),
            allergies=pet.get("allergies", []),
            createdAt=pet["createdAt"],
            updatedAt=pet["updatedAt"]
        )
        for pet in pets
    ]


@router.get("/{pet_id}", response_model=PetResponse)
async def get_pet(
    pet_id: str,
    current_user: UserInDB = Depends(get_current_user)
) -> PetResponse:
    """
    Get specific pet details
    
    Args:
        pet_id: Pet ID
        current_user: Current authenticated user
    
    Returns:
        PetResponse: Pet data
    
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
    
    # Get pet
    pet = await db.pets.find_one({"_id": ObjectId(pet_id)})
    
    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet not found"
        )
    
    # Verify pet belongs to current user
    if pet["userId"] != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this pet"
        )
    
    return PetResponse(
        id=str(pet["_id"]),
        userId=pet["userId"],
        name=pet["name"],
        breed=pet["breed"],
        age=pet["age"],
        gender=pet.get("gender", "male"),  # Default to 'male' if not present
        weight=pet.get("weight"),
        photo=pet.get("photo"),
        lifestyle=pet.get("lifestyle"),
        conditions=pet.get("conditions", []),
        allergies=pet.get("allergies", []),
        createdAt=pet["createdAt"],
        updatedAt=pet["updatedAt"]
    )


@router.patch("/{pet_id}", response_model=PetResponse)
async def update_pet(
    pet_id: str,
    pet_update: PetUpdate,
    current_user: UserInDB = Depends(get_current_user)
) -> PetResponse:
    """
    Update pet profile
    
    Args:
        pet_id: Pet ID
        pet_update: Pet update data
        current_user: Current authenticated user
    
    Returns:
        PetResponse: Updated pet data
    
    Raises:
        HTTPException: If pet not found or doesn't belong to user
    """
    db = get_database()
    
    print("=" * 80)
    print("BACKEND - UPDATE PET REQUEST RECEIVED")
    print("=" * 80)
    print(f"Pet ID: {pet_id}")
    print(f"Raw pet_update object: {pet_update}")
    print(f"pet_update.gender attribute: {pet_update.gender}")
    print(f"Type of gender: {type(pet_update.gender)}")
    
    # Validate ObjectId
    if not ObjectId.is_valid(pet_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid pet ID"
        )
    
    # Get pet
    pet = await db.pets.find_one({"_id": ObjectId(pet_id)})
    
    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet not found"
        )
    
    # Verify pet belongs to current user
    if pet["userId"] != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this pet"
        )
    
    # Prepare update data - get all fields including those set to None
    update_data = {}
    update_dict = pet_update.model_dump(exclude_unset=True)
    
    print(f"After model_dump(exclude_unset=True): {update_dict}")
    print(f"gender in dict: {update_dict.get('gender')}")
    
    # Add all provided fields to update_data
    for key, value in update_dict.items():
        update_data[key] = value
    
    # Ensure conditions and allergies are lists if provided
    if "conditions" in update_data:
        update_data["conditions"] = update_data["conditions"] if update_data["conditions"] is not None else []
    if "allergies" in update_data:
        update_data["allergies"] = update_data["allergies"] if update_data["allergies"] is not None else []
    
    update_data["updatedAt"] = datetime.utcnow()
    
    print(f"Final update_data to be saved to database: {update_data}")
    print("=" * 80)
    
    # Update pet
    await db.pets.update_one(
        {"_id": ObjectId(pet_id)},
        {"$set": update_data}
    )
    
    # Get updated pet
    updated_pet = await db.pets.find_one({"_id": ObjectId(pet_id)})
    
    return PetResponse(
        id=str(updated_pet["_id"]),
        userId=updated_pet["userId"],
        name=updated_pet["name"],
        breed=updated_pet["breed"],
        age=updated_pet["age"],
        gender=updated_pet["gender"],
        weight=updated_pet.get("weight"),
        photo=updated_pet.get("photo"),
        lifestyle=updated_pet.get("lifestyle"),
        conditions=updated_pet.get("conditions", []),
        allergies=updated_pet.get("allergies", []),
        createdAt=updated_pet["createdAt"],
        updatedAt=updated_pet["updatedAt"]
    )


@router.delete("/{pet_id}", status_code=status.HTTP_200_OK)
async def delete_pet(
    pet_id: str,
    current_user: UserInDB = Depends(get_current_user)
) -> Dict[str, str]:
    """
    Delete pet profile
    
    Args:
        pet_id: Pet ID
        current_user: Current authenticated user
    
    Returns:
        Dict with success message
    
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
    
    # Get pet
    pet = await db.pets.find_one({"_id": ObjectId(pet_id)})
    
    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet not found"
        )
    
    # Verify pet belongs to current user
    if pet["userId"] != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this pet"
        )
    
    # Delete pet
    await db.pets.delete_one({"_id": ObjectId(pet_id)})
    
    # Delete associated medical history
    await db.medical_history.delete_many({"petId": pet_id})
    
    return {"message": "Pet deleted successfully"}


@router.post("/{pet_id}/medical-history", response_model=MedicalHistoryResponse, status_code=status.HTTP_201_CREATED)
async def add_medical_history(
    pet_id: str,
    history_data: MedicalHistoryCreate,
    current_user: UserInDB = Depends(get_current_user)
) -> MedicalHistoryResponse:
    """
    Add medical history entry for pet
    
    Args:
        pet_id: Pet ID
        history_data: Medical history data
        current_user: Current authenticated user
    
    Returns:
        MedicalHistoryResponse: Created medical history entry
    
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
    
    # Get pet
    pet = await db.pets.find_one({"_id": ObjectId(pet_id)})
    
    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet not found"
        )
    
    # Verify pet belongs to current user
    if pet["userId"] != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to add medical history for this pet"
        )
    
    # Create medical history entry
    history_dict = history_data.model_dump()
    history_dict["petId"] = pet_id
    history_dict["createdAt"] = datetime.utcnow()
    
    result = await db.medical_history.insert_one(history_dict)
    history_id = str(result.inserted_id)
    
    # Get created entry
    created_history = await db.medical_history.find_one({"_id": result.inserted_id})
    
    return MedicalHistoryResponse(
        id=history_id,
        petId=created_history["petId"],
        type=created_history["type"],
        date=created_history["date"],
        description=created_history["description"],
        photos=created_history.get("photos", []),
        notes=created_history.get("notes"),
        createdAt=created_history["createdAt"]
    )


@router.get("/{pet_id}/medical-history", response_model=List[MedicalHistoryResponse])
async def get_medical_history(
    pet_id: str,
    current_user: UserInDB = Depends(get_current_user)
) -> List[MedicalHistoryResponse]:
    """
    Get medical history for pet
    
    Args:
        pet_id: Pet ID
        current_user: Current authenticated user
    
    Returns:
        List[MedicalHistoryResponse]: List of medical history entries
    
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
    
    # Get pet
    pet = await db.pets.find_one({"_id": ObjectId(pet_id)})
    
    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet not found"
        )
    
    # Verify pet belongs to current user
    if pet["userId"] != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access medical history for this pet"
        )
    
    # Get medical history, sorted by date (newest first)
    cursor = db.medical_history.find({"petId": pet_id}).sort("date", -1)
    history = await cursor.to_list(length=None)
    
    return [
        MedicalHistoryResponse(
            id=str(entry["_id"]),
            petId=entry["petId"],
            type=entry["type"],
            date=entry["date"],
            description=entry["description"],
            photos=entry.get("photos", []),
            notes=entry.get("notes"),
            createdAt=entry["createdAt"]
        )
        for entry in history
    ]