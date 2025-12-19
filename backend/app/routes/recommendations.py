"""
Health recommendations and alerts routes
"""
from fastapi import APIRouter, HTTPException, status, Query, Depends
from typing import List, Dict, Any, Optional
from datetime import datetime
from bson import ObjectId

from app.data.breed_tips import get_breed_tips, get_all_breeds
from app.models.user import UserInDB
from app.utils.dependencies import get_current_user
from app.database import get_database
from app.services.ai_service import ai_service


router = APIRouter(prefix="/api/v1/recommendations", tags=["Recommendations"])


@router.get("/breed/{breed}")
async def get_breed_recommendations(breed: str) -> Dict[str, Any]:
    """
    Get breed-specific health tips and recommendations
    
    Args:
        breed: Dog breed name
    
    Returns:
        Dict with breed-specific health information including:
        - Common health issues
        - Care tips
        - Diet recommendations
    """
    tips = get_breed_tips(breed)
    return tips


@router.get("/breeds")
async def list_available_breeds() -> Dict[str, List[str]]:
    """
    Get list of all breeds with specific health tips
    
    Returns:
        Dict with list of breed names
    """
    breeds = get_all_breeds()
    return {"breeds": breeds}


@router.get("/seasonal")
async def get_seasonal_alerts(
    city: Optional[str] = Query(None, description="City name"),
    latitude: Optional[float] = Query(None, ge=-90, le=90, description="Latitude"),
    longitude: Optional[float] = Query(None, ge=-180, le=180, description="Longitude")
) -> Dict[str, Any]:
    """
    Get seasonal health alerts based on location and current date
    
    Query Parameters:
        - city: City name (optional)
        - latitude: Latitude (optional)
        - longitude: Longitude (optional)
    
    Returns:
        Dict with seasonal alerts and recommendations
    """
    # Determine current season based on month (India has 3 main seasons)
    current_month = datetime.now().month
    
    # Summer: March to June
    # Monsoon: July to September
    # Winter: October to February
    
    if 3 <= current_month <= 6:
        season = "Summer"
        alerts = [
            {
                "title": "Heatstroke Warning",
                "severity": "high",
                "description": "Temperatures are high. Take precautions to prevent heatstroke.",
                "recommendations": [
                    "Avoid walks during peak heat (11 AM - 4 PM)",
                    "Ensure fresh water is always available",
                    "Never leave pets in parked vehicles",
                    "Provide shaded areas for outdoor pets",
                    "Watch for signs of overheating: excessive panting, drooling, lethargy"
                ]
            },
            {
                "title": "Paw Pad Burns",
                "severity": "medium",
                "description": "Hot pavements can burn your pet's paws.",
                "recommendations": [
                    "Test pavement with your hand before walks",
                    "Walk on grass when possible",
                    "Consider protective paw boots",
                    "Walk during cooler hours (early morning/evening)"
                ]
            },
            {
                "title": "Dehydration Risk",
                "severity": "high",
                "description": "Pets need extra hydration in summer.",
                "recommendations": [
                    "Refill water bowls multiple times daily",
                    "Add ice cubes to water",
                    "Carry water on walks",
                    "Offer wet food for additional hydration"
                ]
            }
        ]
    elif 7 <= current_month <= 9:
        season = "Monsoon"
        alerts = [
            {
                "title": "Tick and Flea Alert",
                "severity": "high",
                "description": "Monsoon season increases tick and flea activity.",
                "recommendations": [
                    "Use veterinary-approved tick/flea prevention",
                    "Check pet thoroughly after outdoor activities",
                    "Keep living areas clean and dry",
                    "Regular grooming to spot parasites early",
                    "Consult vet if you find ticks"
                ]
            },
            {
                "title": "Fungal Infections",
                "severity": "medium",
                "description": "Humidity increases risk of skin infections.",
                "recommendations": [
                    "Dry pet thoroughly after getting wet",
                    "Keep bedding clean and dry",
                    "Check for skin irritation regularly",
                    "Ensure good ventilation in living areas",
                    "Consult vet if you notice skin issues"
                ]
            },
            {
                "title": "Leptospirosis Risk",
                "severity": "high",
                "description": "Waterborne disease risk increases during monsoon.",
                "recommendations": [
                    "Ensure leptospirosis vaccination is up to date",
                    "Avoid puddles and stagnant water",
                    "Don't let pets drink from unknown water sources",
                    "Watch for symptoms: fever, vomiting, lethargy"
                ]
            }
        ]
    else:  # Winter: October to February
        season = "Winter"
        alerts = [
            {
                "title": "Cold Weather Care",
                "severity": "medium",
                "description": "Some pets need extra warmth in winter.",
                "recommendations": [
                    "Provide warm bedding away from drafts",
                    "Consider sweaters for small/short-haired breeds",
                    "Limit outdoor time in very cold weather",
                    "Ensure indoor temperature is comfortable",
                    "Watch for signs of cold: shivering, lethargy"
                ]
            },
            {
                "title": "Dry Skin Alert",
                "severity": "low",
                "description": "Winter air can cause dry, itchy skin.",
                "recommendations": [
                    "Use pet-safe moisturizing shampoo",
                    "Add omega-3 supplements to diet",
                    "Use a humidifier indoors",
                    "Brush regularly to distribute natural oils",
                    "Avoid over-bathing"
                ]
            },
            {
                "title": "Joint Stiffness",
                "severity": "medium",
                "description": "Cold weather can worsen arthritis symptoms.",
                "recommendations": [
                    "Provide warm, cushioned bedding",
                    "Gentle exercise to maintain mobility",
                    "Consider joint supplements",
                    "Massage stiff joints gently",
                    "Consult vet about pain management"
                ]
            }
        ]
    
    return {
        "season": season,
        "location": city or "Based on current date",
        "alerts": alerts,
        "generalTips": [
            "Keep vaccinations up to date",
            "Regular vet check-ups",
            "Maintain good hygiene",
            "Monitor for unusual behavior",
            "Keep emergency vet contact handy"
        ]
    }


@router.get("/pet/{pet_id}")
async def get_personalized_recommendations(
    pet_id: str,
    current_user: UserInDB = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get personalized health recommendations for a specific pet
    
    Combines breed-specific tips, seasonal alerts, and pet-specific factors
    
    Args:
        pet_id: Pet ID
        current_user: Current authenticated user
    
    Returns:
        Dict with personalized recommendations
    
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
    
    # Get breed-specific tips
    breed_tips = get_breed_tips(pet["breed"])
    
    # Get seasonal alerts (using user's location if available)
    city = None
    if current_user.location:
        city = current_user.location.city
    
    seasonal_data = await get_seasonal_alerts(city=city)
    
    # Generate age-specific recommendations
    age_recommendations = []
    pet_age = pet.get("age", 0)
    
    if pet_age < 1:
        age_recommendations = [
            "Puppy vaccinations are crucial - follow vet schedule",
            "Socialization is important at this age",
            "Puppy-proof your home",
            "Start basic training early",
            "Feed puppy-specific food"
        ]
    elif pet_age < 7:
        age_recommendations = [
            "Maintain regular exercise routine",
            "Annual vet check-ups recommended",
            "Keep vaccinations current",
            "Monitor weight and adjust diet as needed",
            "Regular dental care important"
        ]
    else:
        age_recommendations = [
            "Senior pets need bi-annual vet check-ups",
            "Watch for signs of arthritis or mobility issues",
            "Consider senior-specific diet",
            "Gentle exercise appropriate for age",
            "Monitor for age-related health issues"
        ]
    
    # Condition-specific recommendations
    condition_recommendations = []
    if pet.get("conditions"):
        for condition in pet["conditions"]:
            if "hip" in condition.lower() or "joint" in condition.lower():
                condition_recommendations.append({
                    "condition": condition,
                    "tips": [
                        "Maintain healthy weight to reduce joint stress",
                        "Low-impact exercise like swimming",
                        "Joint supplements (glucosamine, chondroitin)",
                        "Orthopedic bedding",
                        "Regular vet monitoring"
                    ]
                })
            elif "allerg" in condition.lower():
                condition_recommendations.append({
                    "condition": condition,
                    "tips": [
                        "Identify and avoid allergen triggers",
                        "Hypoallergenic diet if food allergies",
                        "Regular bathing with medicated shampoo",
                        "Keep living areas clean",
                        "Follow vet's treatment plan"
                    ]
                })
    
    # Allergy-specific diet recommendations
    diet_modifications = []
    if pet.get("allergies"):
        diet_modifications = [
            f"Avoid {allergy}" for allergy in pet["allergies"]
        ]
        diet_modifications.append("Consider limited ingredient diet")
        diet_modifications.append("Consult vet about hypoallergenic options")
    
    return {
        "petName": pet["name"],
        "breed": pet["breed"],
        "age": pet_age,
        "breedSpecific": breed_tips,
        "seasonal": seasonal_data,
        "ageSpecific": {
            "category": "Puppy" if pet_age < 1 else "Adult" if pet_age < 7 else "Senior",
            "recommendations": age_recommendations
        },
        "conditionSpecific": condition_recommendations,
        "dietModifications": diet_modifications,
        "generalWellness": [
            "Regular exercise appropriate for age and breed",
            "Balanced, high-quality diet",
            "Fresh water always available",
            "Regular grooming and hygiene",
            "Mental stimulation through play and training",
            "Lots of love and attention!"
        ]
    }


@router.get("/vets/by-pincode")
async def get_vets_by_pincode(
    pincode: str = Query(..., description="Indian postal code (6 digits)", regex="^[1-9][0-9]{5}$"),
    limit: int = Query(10, ge=1, le=50, description="Number of clinics to return (1-50)")
) -> Dict[str, Any]:
    """
    Get AI-powered veterinary clinic recommendations based on Indian pin code
    
    Uses Gemini AI to provide a curated list of reputable veterinary clinics
    near the specified pin code with detailed information about services, hours, and contact details.
    
    Query Parameters:
        - pincode: Indian postal code (6 digits, required)
        - limit: Number of clinics to return (default: 10, max: 50)
    
    Returns:
        Dict with list of veterinary clinics and metadata
    """
    try:
        # Get recommendations from Gemini AI
        clinics = await ai_service.get_vet_recommendations_by_pincode(pincode, limit)
        
        return {
            "pincode": pincode,
            "limit": limit,
            "count": len(clinics),
            "clinics": clinics,
            "source": "AI-powered recommendations using Google Gemini",
            "disclaimer": "These recommendations are AI-generated. Please verify clinic details before visiting. Always call ahead to confirm availability and services."
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get vet recommendations: {str(e)}"
        )


@router.get("/vets/by-city")
async def get_vets_by_city(
    city: str = Query(..., description="City name in India"),
    limit: int = Query(10, ge=1, le=50, description="Number of clinics to return (1-50)")
) -> Dict[str, Any]:
    """
    Get AI-powered veterinary clinic recommendations based on city name
    
    Uses Gemini AI to provide a curated list of reputable veterinary clinics
    in the specified city with detailed information about services, hours, and contact details.
    
    Query Parameters:
        - city: City name in India (required)
        - limit: Number of clinics to return (default: 10, max: 50)
    
    Returns:
        Dict with list of veterinary clinics and metadata
    """
    try:
        # Create a prompt for Gemini AI to get vet recommendations by city
        prompt = f"""You are a veterinary clinic directory assistant for India. Provide a list of {limit} reputable veterinary clinics and animal hospitals in {city}, India.

For each clinic, provide the following information in JSON format:
- name: Full clinic name
- address: Complete street address
- phone: Contact phone number (with +91 country code)
- services: Array of services offered (e.g., ["General Checkup", "Vaccination", "Surgery", "Emergency Care"])
- specialties: Array of specialties (e.g., ["Small Animal Medicine", "Surgery", "Dental Care"])
- hours: Operating hours (e.g., "Mon-Sat: 9:00 AM - 8:00 PM, Sun: Closed")
- emergency: Boolean indicating if 24/7 emergency services available
- rating: Rating out of 5.0 (realistic ratings between 3.8-4.9)
- notes: Brief note about the clinic (1-2 sentences)
- distance: Approximate distance from city center (e.g., "2.5 km from center")

Return ONLY a valid JSON array of clinic objects, nothing else. No markdown, no explanations, just the JSON array.

Example format:
```json
[
  {{
    "name": "Example Vet Clinic",
    "address": "123 Main Street, {city}, State, PIN",
    "phone": "+91-XXXXXXXXXX",
    "services": ["General Checkup", "Vaccination"],
    "specialties": ["Small Animal Medicine"],
    "hours": "Mon-Sat: 9:00 AM - 7:00 PM",
    "emergency": false,
    "rating": 4.5,
    "notes": "Well-established clinic with experienced vets.",
    "distance": "1.5 km from center"
  }}
]
```

Provide {limit} clinics for {city}, India."""

        # Call Gemini AI
        response = ai_service.model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]  # Remove ```json
        if response_text.startswith("```"):
            response_text = response_text[3:]  # Remove ```
        if response_text.endswith("```"):
            response_text = response_text[:-3]  # Remove trailing ```
        response_text = response_text.strip()
        
        # Parse JSON response
        import json
        clinics = json.loads(response_text)
        
        return {
            "city": city,
            "limit": limit,
            "count": len(clinics),
            "clinics": clinics,
            "source": "AI-powered recommendations using Google Gemini",
            "disclaimer": "These recommendations are AI-generated. Please verify clinic details before visiting. Always call ahead to confirm availability and services."
        }
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        print(f"Response text: {response_text}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse AI response: {str(e)}"
        )
    except Exception as e:
        print(f"Error getting vet recommendations by city: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get vet recommendations: {str(e)}"
        )


@router.post("/vets/ask")
async def ask_about_vets(
    question: str = Query(..., description="Question about veterinary clinics"),
    pincode: Optional[str] = Query(None, description="Pin code for context (optional)"),
    clinics_context: str = Query(..., description="JSON string of clinic information")
) -> Dict[str, Any]:
    """
    Use Gemini AI to answer questions about veterinary clinics
    
    This endpoint uses Gemini AI to provide detailed, contextual answers about
    veterinary clinics based on the user's question and the available clinic information.
    
    Query Parameters:
        - question: User's question about the clinics
        - pincode: Pin code for geographical context (optional, 6-digit Indian PIN code)
        - clinics_context: JSON string containing clinic information
    
    Returns:
        Dict with AI-generated answer
    """
    try:
        # Validate pincode format if provided and not empty
        if pincode and pincode.strip():
            import re
            if not re.match(r"^[1-9][0-9]{5}$", pincode):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid PIN code format. Must be a 6-digit Indian PIN code."
                )
        else:
            pincode = None  # Treat empty string as None
        
        # Create a detailed prompt for Gemini
        location_context = f"near pin code {pincode}" if pincode else "in their area"
        prompt = f"""You are a helpful veterinary clinic advisor for India. A pet owner {location_context} is asking about veterinary clinics.

Available Veterinary Clinics:
{clinics_context}

User's Question: "{question}"

Please provide a helpful, detailed answer to their question. Consider:
- The specific clinics available and their features
- Services, specialties, and ratings
- Distance and accessibility
- Emergency services availability
- Any specific needs mentioned in the question

Provide a conversational, informative response that directly answers their question. If they're asking for recommendations, explain your reasoning based on the clinic details provided.

Keep your response concise but informative (2-4 paragraphs maximum)."""

        # Call Gemini AI
        response = ai_service.model.generate_content(prompt)
        answer = response.text.strip()
        
        return {
            "question": question,
            "answer": answer,
            "pincode": pincode,
            "source": "AI-powered response using Google Gemini"
        }
    except Exception as e:
        print(f"Error answering vet question: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to answer question: {str(e)}"
        )


@router.post("/symptom-followup")
async def symptom_followup_question(
    question: str = Query(..., description="Follow-up question about symptoms or pet health"),
    conversation_context: str = Query(..., description="Previous conversation context")
) -> Dict[str, Any]:
    """
    Use Gemini AI to answer follow-up questions in the symptom checker chat
    
    This endpoint enables conversational interaction after the initial symptom analysis,
    allowing users to ask clarifying questions, get more details, or discuss related concerns.
    
    Query Parameters:
        - question: User's follow-up question
        - conversation_context: Previous messages for context
    
    Returns:
        Dict with AI-generated conversational response
    """
    try:
        # Create a conversational prompt for Gemini
        prompt = f"""You are an experienced veterinarian having a conversation with a concerned pet owner. They've already described their pet's symptoms and received an initial assessment. Now they have a follow-up question.

Previous Conversation:
{conversation_context}

Pet Owner's Follow-up Question: "{question}"

Please provide a helpful, conversational response as if you're continuing the discussion in your clinic. Consider:
- The context of the previous conversation
- Any symptoms or concerns already mentioned
- Provide clear, actionable advice
- Be empathetic and professional
- If the question requires seeing the pet in person, say so clearly
- If it's an emergency, emphasize urgency

Keep your response conversational and informative (2-4 paragraphs). Write as if speaking directly to the pet owner."""

        # Call Gemini AI
        response = ai_service.model.generate_content(prompt)
        answer = response.text.strip()
        
        # Add disclaimer to every response
        answer_with_disclaimer = f"{answer}\n\n---\n\n⚕️ **DISCLAIMER:** This is an AI-generated assessment for informational purposes only. It does not replace professional veterinary advice, diagnosis, or treatment. Always consult with a licensed veterinarian for medical concerns. In case of emergency, seek immediate veterinary care."
        
        return {
            "question": question,
            "answer": answer_with_disclaimer,
            "source": "AI-powered response using Google Gemini"
        }
    except Exception as e:
        print(f"Error answering follow-up question: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to answer follow-up question: {str(e)}"
        )


@router.post("/pet-summary/{pet_id}")
async def generate_pet_health_summary(
    pet_id: str,
    force_refresh: bool = Query(False, description="Force regeneration even if cached summary exists"),
    current_user: UserInDB = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Generate a comprehensive AI-powered health summary for a pet
    
    Uses Gemini AI to analyze the pet's profile and health history.
    Caches the summary and only regenerates if new chat history is available.
    
    Path Parameters:
        - pet_id: Pet ID
    
    Query Parameters:
        - force_refresh: Force regeneration even if cached summary exists
    
    Returns:
        Dict with AI-generated health summary
    
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
    
    try:
        # Get ALL symptom check history for this pet (not limited by time)
        symptom_checks = await db.symptom_checks.find({
            "petId": pet_id
        }).sort("timestamp", -1).to_list(length=100)
        
        # Separate active and resolved issues
        active_checks = [check for check in symptom_checks if not check.get('resolved', False)]
        resolved_checks = [check for check in symptom_checks if check.get('resolved', False)]
        
        # Determine current season based on system date (India seasons)
        current_month = datetime.now().month
        current_date = datetime.now()
        
        if 3 <= current_month <= 6:
            season = "Summer"
            season_description = "hot and dry weather"
        elif 7 <= current_month <= 9:
            season = "Monsoon"
            season_description = "rainy season with high humidity"
        else:  # October to February
            season = "Winter"
            season_description = "cooler temperatures"
        
        # Get user's location information first (needed for cache validation)
        user_location_info = ""
        pincode = None
        city = None
        state = None
        
        if current_user.address:
            pincode = current_user.address.zip_code
            city = current_user.address.city
            state = current_user.address.state
            user_location_info = f"\n\nOwner's Location:\n- City: {city}, {state}\n- PIN Code: {pincode}"
        elif current_user.location:
            city = current_user.location.city
            state = current_user.location.state
            user_location_info = f"\n\nOwner's Location:\n- City: {city}, {state}"
        
        # Add season information
        user_location_info += f"\n- Current Season: {season} ({season_description})"
        user_location_info += f"\n- Date: {current_date.strftime('%B %d, %Y')}"
        
        has_location_data = bool(city or pincode)
        
        # Check for existing cached summary
        cached_summary = await db.pet_health_summaries.find_one({
            "petId": pet_id
        })
        
        # Determine if we need to regenerate
        needs_regeneration = force_refresh or cached_summary is None
        
        if cached_summary and not force_refresh:
            # Check if season has changed since last generation
            cached_season = cached_summary.get("season")
            if cached_season != season:
                needs_regeneration = True
            
            # Check if location data availability has changed
            if not needs_regeneration:
                cached_had_location = cached_summary.get("hasLocationData", False)
                if has_location_data != cached_had_location:
                    needs_regeneration = True
            
            # Check if the number of symptom checks has changed (additions or deletions)
            if not needs_regeneration:
                cached_check_count = cached_summary.get("checksAnalyzed", 0)
                current_check_count = len(symptom_checks)
                
                if cached_check_count != current_check_count:
                    needs_regeneration = True
                else:
                    # If count is same, check if there are new symptom checks since last summary generation
                    last_summary_time = cached_summary.get("generatedAt")
                    if last_summary_time:
                        # Convert to datetime if it's a string
                        if isinstance(last_summary_time, str):
                            last_summary_time = datetime.fromisoformat(last_summary_time.replace('Z', '+00:00'))
                        
                        # Check if any symptom checks are newer than the cached summary
                        for check in symptom_checks:
                            check_time = check.get("timestamp")
                            if check_time:
                                if isinstance(check_time, str):
                                    check_time = datetime.fromisoformat(check_time.replace('Z', '+00:00'))
                                
                                if check_time > last_summary_time:
                                    needs_regeneration = True
                                    break
        
        # Return cached summary if no regeneration needed
        if not needs_regeneration and cached_summary:
            return {
                "petId": pet_id,
                "petName": pet['name'],
                "summary": cached_summary["summary"],
                "generatedAt": cached_summary["generatedAt"],
                "historyPeriod": cached_summary.get("historyPeriod", "All available history"),
                "checksAnalyzed": cached_summary.get("checksAnalyzed", len(symptom_checks)),
                "source": "Cached summary (no new chat history)",
                "cached": True
            }
        
        # Use Gemini AI to get climate information for the location
        climate_info = ""
        if city or pincode:
            try:
                location_str = f"{city}, {state}" if city else f"PIN code {pincode}"
                climate_prompt = f"""Provide a brief climate analysis for {location_str}, India during {season} season ({current_date.strftime('%B %Y')}). Include:
1. Typical weather conditions for this season in this location
2. Temperature range (in Celsius)
3. Humidity levels
4. Specific weather-related pet health concerns for this location and season

Keep the response concise (3-4 sentences maximum). Focus on information relevant to pet health."""

                climate_response = ai_service.model.generate_content(climate_prompt)
                climate_info = f"\n\nLocal Climate Context ({location_str}, {season}):\n{climate_response.text.strip()}"
            except Exception as e:
                print(f"Failed to get climate info: {e}")
                # Continue without climate info if API fails
        
        # Prepare pet profile information
        pet_info = f"""Pet Profile:
- Name: {pet['name']}
- Breed: {pet['breed']}
- Age: {pet.get('age', 'Unknown')} years
- Gender: {pet.get('gender', 'Unknown')}
- Weight: {pet.get('weight', 'Not specified')} kg
- Lifestyle: {pet.get('lifestyle', 'Not specified')}"""
        
        if pet.get('conditions'):
            pet_info += f"\n- Medical Conditions: {', '.join(pet['conditions'])}"
        else:
            pet_info += "\n- Medical Conditions: None"
            
        if pet.get('allergies'):
            pet_info += f"\n- Allergies: {', '.join(pet['allergies'])}"
        else:
            pet_info += "\n- Allergies: None"
        
        # Add location and climate information
        pet_info += user_location_info
        pet_info += climate_info
        
        # Prepare detailed health history with chat conversations, separating active and resolved issues
        history_summary = ""
        
        # Add active health concerns
        if active_checks and len(active_checks) > 0:
            history_summary = f"\n\nACTIVE HEALTH CONCERNS ({len(active_checks)} ongoing):\n"
            for idx, check in enumerate(active_checks[:5], 1):  # Limit to 5 most recent active
                # Handle timestamp - could be datetime object or ISO string
                timestamp = check.get('timestamp')
                if timestamp:
                    if isinstance(timestamp, str):
                        try:
                            check_date = datetime.fromisoformat(timestamp.replace('Z', '+00:00')).strftime('%B %d, %Y')
                        except:
                            check_date = "Unknown date"
                    else:
                        check_date = timestamp.strftime('%B %d, %Y')
                else:
                    check_date = "Unknown date"
                    
                history_summary += f"\n--- Active Concern #{idx} ({check_date}) ---"
                history_summary += f"\nCategory: {check.get('category', 'Unknown')}"
                if check.get('healthSubcategory'):
                    history_summary += f" - {check['healthSubcategory']}"
                history_summary += f"\nRisk Level: {check.get('riskLevel', 'Unknown')}"
                history_summary += f"\nAssessment: {check.get('summary', 'No summary available')}"
                
                # Include chat conversation if available
                if check.get('messages') and len(check['messages']) > 0:
                    history_summary += f"\n\nChat Details:"
                    # Get user messages (symptoms described by owner)
                    user_messages = [msg for msg in check['messages'] if msg.get('type') == 'user']
                    if user_messages:
                        history_summary += f"\nOwner's Concerns:"
                        for msg in user_messages[:5]:  # Up to 5 user messages
                            content = msg.get('content', '')
                            if content and len(content) > 10:  # Skip very short messages
                                history_summary += f"\n  • {content[:300]}"
                
                history_summary += "\n"
        
        # Add resolved past issues
        if resolved_checks and len(resolved_checks) > 0:
            history_summary += f"\n\nRESOLVED PAST ISSUES ({len(resolved_checks)} addressed):\n"
            history_summary += "**Note:** These issues have been resolved but are included for historical context.\n"
            for idx, check in enumerate(resolved_checks[:5], 1):  # Limit to 5 most recent resolved
                # Handle timestamp - could be datetime object or ISO string
                timestamp = check.get('timestamp')
                resolved_at = check.get('resolvedAt')
                
                if timestamp:
                    if isinstance(timestamp, str):
                        try:
                            check_date = datetime.fromisoformat(timestamp.replace('Z', '+00:00')).strftime('%B %d, %Y')
                        except:
                            check_date = "Unknown date"
                    else:
                        check_date = timestamp.strftime('%B %d, %Y')
                else:
                    check_date = "Unknown date"
                
                resolved_date = ""
                if resolved_at:
                    if isinstance(resolved_at, str):
                        try:
                            resolved_date = f" - Resolved: {datetime.fromisoformat(resolved_at.replace('Z', '+00:00')).strftime('%B %d, %Y')}"
                        except:
                            resolved_date = " - Resolved"
                    else:
                        resolved_date = f" - Resolved: {resolved_at.strftime('%B %d, %Y')}"
                    
                history_summary += f"\n--- Past Issue #{idx} ({check_date}{resolved_date}) (Now Resolved) ---"
                history_summary += f"\nCategory: {check.get('category', 'Unknown')}"
                if check.get('healthSubcategory'):
                    history_summary += f" - {check['healthSubcategory']}"
                history_summary += f"\nWas: {check.get('riskLevel', 'Unknown')} (Now Resolved)"
                history_summary += f"\nPast Assessment: {check.get('summary', 'No summary available')}"
                
                # Include chat conversation if available
                if check.get('messages') and len(check['messages']) > 0:
                    # Get user messages (symptoms described by owner)
                    user_messages = [msg for msg in check['messages'] if msg.get('type') == 'user']
                    if user_messages:
                        history_summary += f"\nPast Concerns (Now Addressed):"
                        for msg in user_messages[:3]:  # Up to 3 user messages for resolved issues
                            content = msg.get('content', '')
                            if content and len(content) > 10:  # Skip very short messages
                                history_summary += f"\n  • {content[:200]}"
                
                history_summary += "\n"
        
        # If no checks at all
        if not active_checks and not resolved_checks:
            history_summary = "\n\nHealth History: No health check conversations recorded yet."
        
        # Create comprehensive prompt for Gemini with location-based context
        location_context = ""
        has_climate_data = bool(climate_info)
        
        if city or pincode:
            location_str = f"{city}, {state}" if city else f"PIN code {pincode}"
            location_context = f"\n\n**IMPORTANT:** The pet owner is located in {location_str}. It is currently {season} season ({season_description}). Consider the local climate, current seasonal conditions, and region-specific health concerns when making recommendations. Tailor your advice to be relevant for this specific location and season in India."
        else:
            # Even without location, include season information
            location_context = f"\n\n**IMPORTANT:** It is currently {season} season in India ({season_description}). Consider seasonal health concerns and provide season-appropriate recommendations."
        
        # Determine what data sources are being used
        total_checks = len(symptom_checks)
        active_count = len(active_checks)
        resolved_count = len(resolved_checks)
        
        if active_count > 0 and resolved_count > 0:
            checks_text = f"{active_count} active concern(s) and {resolved_count} resolved issue(s)"
        elif active_count > 0:
            checks_text = f"{active_count} active concern(s)"
        elif resolved_count > 0:
            checks_text = f"{resolved_count} resolved issue(s)"
        else:
            checks_text = "no health conversations"
        
        based_on_text = f"Pet profile, {checks_text}, and {season} season context"
        if has_climate_data:
            based_on_text = f"Pet profile, {checks_text}, local climate, and {season} season analysis"
        
        # Create comprehensive prompt for Gemini
        prompt = f"""You are an experienced veterinarian creating a personalized health summary for a beloved pet. Analyze the following information and generate a clear, concise, and personal summary.

{pet_info}
{history_summary}
{location_context}

**IMPORTANT CONTEXT INTERPRETATION:**
- "ACTIVE HEALTH CONCERNS" are ongoing issues that need attention
- "RESOLVED PAST ISSUES" are problems that have been addressed but provide historical context
- When making recommendations, focus on active concerns and prevention
- Acknowledge resolved issues briefly to show awareness of the pet's health journey
- Do not treat resolved issues as current problems requiring immediate action

Create a health summary with this EXACT structure and formatting:

# 🐾 Health Summary for {pet['name']}

**Based on:** {based_on_text}

## Current Health Overview
[Write 2-3 sentences about {pet['name']}'s current health status. Be personal and direct - use "your" when referring to the owner. Mention key facts like age, breed, and any notable conditions. MUST mention how the current {season} season might affect the pet's health. Don't repeat information unnecessarily.]

## Key Observations
[Write 2-3 sentences highlighting the most important patterns or findings from the health history. If there are recurring issues, mention them. If the pet is healthy, acknowledge that. MUST consider current {season} season factors and how they relate to the pet's health. Be specific and avoid generic statements.]

## Recommendations

CRITICAL: Format recommendations as a NUMBERED list with each on a new line. MUST include at least 1-2 season-specific recommendations for {season} season:

1. First specific actionable recommendation here (consider local climate if applicable)
2. Second specific actionable recommendation here
3. Third specific actionable recommendation here
4. Fourth specific actionable recommendation here
5. Fifth specific actionable recommendation here

Each recommendation must:
- Start with a number followed by period and space (e.g., "1. ")
- Be on its own line
- Be specific and actionable (what to DO, not just monitor)
- Be concise (one sentence)
- MUST consider current {season} season and provide season-appropriate advice
- If location data available, also consider local climate

Example format for {season} season:
1. Schedule a dental cleaning within the next month
2. During {season} season, [specific seasonal recommendation based on weather]
3. Switch to senior dog food formulated for joint health
4. [Another season-specific recommendation]

---

**Important:** Keep the ENTIRE summary under 300 words. Be direct, personal, and actionable. Avoid:
- Repeating the same information multiple times
- Generic advice that applies to all pets
- Verbose explanations - get straight to the point
- Medical jargon - use simple language

Write as if you're speaking directly to {pet['name']}'s owner in a caring but efficient manner, with awareness of their local environment."""
        
        # Call Gemini AI to generate new summary
        response = ai_service.model.generate_content(prompt)
        summary = response.text.strip()
        
        generated_at = datetime.utcnow()
        
        # Save the new summary to history (always insert, never update)
        summary_history_doc = {
            "petId": pet_id,
            "petName": pet['name'],
            "summary": summary,
            "generatedAt": generated_at,
            "historyPeriod": "All available history",
            "checksAnalyzed": len(symptom_checks),
            "hasLocationData": has_location_data,
            "season": season,
            "createdAt": generated_at
        }
        
        # Insert into history collection
        await db.pet_health_summary_history.insert_one(summary_history_doc)
        
        # Also update the current/cached summary for quick access
        summary_doc = {
            "petId": pet_id,
            "petName": pet['name'],
            "summary": summary,
            "generatedAt": generated_at,
            "historyPeriod": "All available history",
            "checksAnalyzed": len(symptom_checks),
            "hasLocationData": has_location_data,
            "season": season,
            "updatedAt": generated_at
        }
        
        # Upsert the current summary (update if exists, insert if not)
        await db.pet_health_summaries.update_one(
            {"petId": pet_id},
            {"$set": summary_doc},
            upsert=True
        )
        
        return {
            "petId": pet_id,
            "petName": pet['name'],
            "summary": summary,
            "generatedAt": generated_at.isoformat(),
            "historyPeriod": "All available history",
            "checksAnalyzed": len(symptom_checks),
            "source": "AI-powered analysis using Google Gemini",
            "cached": False
        }
        
    except Exception as e:
        print(f"Error generating pet summary: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate pet summary: {str(e)}"
        )


@router.get("/pet-summary-history/{pet_id}")
async def get_pet_health_summary_history(
    pet_id: str,
    current_user: UserInDB = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get all historical health summaries for a pet
    
    Path Parameters:
        - pet_id: Pet ID
    
    Returns:
        Dict with list of historical summaries
    
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
    
    # Get pet to verify ownership
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
    
    try:
        # Get all summary history for this pet, sorted by generation date (newest first)
        summaries = await db.pet_health_summary_history.find({
            "petId": pet_id
        }).sort("generatedAt", -1).to_list(length=100)
        
        # Convert ObjectId to string for JSON serialization
        for summary in summaries:
            summary["id"] = str(summary.pop("_id"))
            if isinstance(summary.get("generatedAt"), datetime):
                summary["generatedAt"] = summary["generatedAt"].isoformat()
            if isinstance(summary.get("createdAt"), datetime):
                summary["createdAt"] = summary["createdAt"].isoformat()
        
        return {
            "petId": pet_id,
            "petName": pet["name"],
            "count": len(summaries),
            "summaries": summaries
        }
        
    except Exception as e:
        print(f"Error fetching summary history: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch summary history: {str(e)}"
        )


@router.delete("/pet-summary-history/{summary_id}")
async def delete_pet_health_summary(
    summary_id: str,
    current_user: UserInDB = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Delete a specific health summary from history
    
    Path Parameters:
        - summary_id: Summary ID to delete
    
    Returns:
        Dict with success message
    
    Raises:
        HTTPException: If summary not found or doesn't belong to user's pet
    """
    db = get_database()
    
    # Validate ObjectId
    if not ObjectId.is_valid(summary_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid summary ID"
        )
    
    try:
        # Get the summary to verify ownership
        summary = await db.pet_health_summary_history.find_one({"_id": ObjectId(summary_id)})
        
        if not summary:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Summary not found"
            )
        
        # Get the pet to verify ownership
        pet = await db.pets.find_one({"_id": ObjectId(summary["petId"])})
        
        if not pet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pet not found"
            )
        
        # Verify pet belongs to current user
        if pet["userId"] != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this summary"
            )
        
        # Delete the summary
        result = await db.pet_health_summary_history.delete_one({"_id": ObjectId(summary_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Summary not found"
            )
        
        return {
            "message": "Summary deleted successfully",
            "summaryId": summary_id,
            "petId": summary["petId"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting summary: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete summary: {str(e)}"
        )