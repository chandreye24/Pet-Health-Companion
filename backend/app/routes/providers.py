"""
Veterinary provider search and recommendation routes
"""
from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from bson import ObjectId

from app.models.provider import ProviderResponse
from app.database import get_database
from app.utils.geo import haversine_distance


router = APIRouter(prefix="/api/v1/providers", tags=["Providers"])


@router.get("", response_model=List[ProviderResponse])
async def search_providers(
    city: Optional[str] = Query(None, description="City name"),
    latitude: Optional[float] = Query(None, ge=-90, le=90, description="User latitude"),
    longitude: Optional[float] = Query(None, ge=-180, le=180, description="User longitude"),
    radius: Optional[float] = Query(15, ge=1, le=50, description="Search radius in km"),
    is_24x7: Optional[bool] = Query(None, alias="is24x7", description="Filter for 24x7 clinics"),
    open_now: Optional[bool] = Query(None, alias="openNow", description="Filter for currently open clinics"),
    sort_by: Optional[str] = Query("distance", regex="^(distance|rating)$", alias="sortBy", description="Sort by distance or rating")
) -> List[ProviderResponse]:
    """
    Search for veterinary providers
    
    Query Parameters:
        - city: City name (required if lat/long not provided)
        - latitude: User latitude (required if city not provided)
        - longitude: User longitude (required if city not provided)
        - radius: Search radius in km (default: 15, max: 50)
        - is24x7: Filter for 24x7 clinics
        - openNow: Filter for currently open clinics (not implemented yet)
        - sortBy: Sort by 'distance' or 'rating' (default: distance)
    
    Returns:
        List[ProviderResponse]: List of matching providers
    
    Raises:
        HTTPException: If neither city nor coordinates provided
    """
    db = get_database()
    
    # Validate input
    if not city and (latitude is None or longitude is None):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either city or latitude/longitude is required"
        )
    
    # Build query
    query = {}
    
    # Filter by city if provided
    if city:
        query["city"] = {"$regex": city, "$options": "i"}  # Case-insensitive search
    
    # Filter by 24x7 if requested
    if is_24x7 is not None:
        query["is24x7"] = is_24x7
    
    # Get providers from database
    cursor = db.providers.find(query)
    providers = await cursor.to_list(length=None)
    
    # Calculate distances if coordinates provided
    provider_responses = []
    for provider in providers:
        distance = None
        if latitude is not None and longitude is not None:
            distance = haversine_distance(
                latitude,
                longitude,
                provider["latitude"],
                provider["longitude"]
            )
            
            # Filter by radius if coordinates provided
            if distance > radius:
                continue
        
        provider_responses.append(
            ProviderResponse(
                id=str(provider["_id"]),
                name=provider["name"],
                phone=provider["phone"],
                address=provider["address"],
                city=provider["city"],
                state=provider["state"],
                latitude=provider["latitude"],
                longitude=provider["longitude"],
                operatingHours=provider["operatingHours"],
                rating=provider["rating"],
                is24x7=provider["is24x7"],
                services=provider.get("services", []),
                distance=distance
            )
        )
    
    # Sort results
    if sort_by == "distance" and latitude is not None and longitude is not None:
        provider_responses.sort(key=lambda p: p.distance if p.distance is not None else float('inf'))
    elif sort_by == "rating":
        provider_responses.sort(key=lambda p: p.rating, reverse=True)
    
    return provider_responses


@router.get("/{provider_id}", response_model=ProviderResponse)
async def get_provider(
    provider_id: str,
    latitude: Optional[float] = Query(None, ge=-90, le=90, description="User latitude for distance calculation"),
    longitude: Optional[float] = Query(None, ge=-180, le=180, description="User longitude for distance calculation")
) -> ProviderResponse:
    """
    Get specific provider details
    
    Args:
        provider_id: Provider ID
        latitude: Optional user latitude for distance calculation
        longitude: Optional user longitude for distance calculation
    
    Returns:
        ProviderResponse: Provider details
    
    Raises:
        HTTPException: If provider not found
    """
    db = get_database()
    
    # Validate ObjectId
    if not ObjectId.is_valid(provider_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid provider ID"
        )
    
    # Get provider
    provider = await db.providers.find_one({"_id": ObjectId(provider_id)})
    
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider not found"
        )
    
    # Calculate distance if coordinates provided
    distance = None
    if latitude is not None and longitude is not None:
        distance = haversine_distance(
            latitude,
            longitude,
            provider["latitude"],
            provider["longitude"]
        )
    
    return ProviderResponse(
        id=str(provider["_id"]),
        name=provider["name"],
        phone=provider["phone"],
        address=provider["address"],
        city=provider["city"],
        state=provider["state"],
        latitude=provider["latitude"],
        longitude=provider["longitude"],
        operatingHours=provider["operatingHours"],
        rating=provider["rating"],
        is24x7=provider["is24x7"],
        services=provider.get("services", []),
        distance=distance
    )


@router.get("/emergency/nearest", response_model=List[ProviderResponse])
async def get_nearest_emergency_providers(
    latitude: float = Query(..., ge=-90, le=90, description="User latitude"),
    longitude: float = Query(..., ge=-180, le=180, description="User longitude"),
    radius: float = Query(15, ge=1, le=50, description="Search radius in km")
) -> List[ProviderResponse]:
    """
    Get nearest emergency (24x7) providers
    
    This endpoint is optimized for emergency situations and automatically
    filters for 24x7 clinics sorted by distance.
    
    Args:
        latitude: User latitude
        longitude: User longitude
        radius: Search radius in km (default: 15)
    
    Returns:
        List[ProviderResponse]: List of nearest 24x7 providers
    """
    db = get_database()
    
    # Get all 24x7 providers
    cursor = db.providers.find({"is24x7": True})
    providers = await cursor.to_list(length=None)
    
    # Calculate distances and filter by radius
    provider_responses = []
    for provider in providers:
        distance = haversine_distance(
            latitude,
            longitude,
            provider["latitude"],
            provider["longitude"]
        )
        
        # Only include providers within radius
        if distance <= radius:
            provider_responses.append(
                ProviderResponse(
                    id=str(provider["_id"]),
                    name=provider["name"],
                    phone=provider["phone"],
                    address=provider["address"],
                    city=provider["city"],
                    state=provider["state"],
                    latitude=provider["latitude"],
                    longitude=provider["longitude"],
                    operatingHours=provider["operatingHours"],
                    rating=provider["rating"],
                    is24x7=provider["is24x7"],
                    services=provider.get("services", []),
                    distance=distance
                )
            )
    
    # Sort by distance (nearest first)
    provider_responses.sort(key=lambda p: p.distance if p.distance is not None else float('inf'))
    
    return provider_responses