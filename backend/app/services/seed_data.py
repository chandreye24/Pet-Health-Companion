"""
Seed data service for populating database with initial data
"""
from typing import List, Dict, Any
from app.database import get_database


# Sample provider data for major Indian cities
PROVIDER_DATA: List[Dict[str, Any]] = [
    # Mumbai
    {
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
        "services": ["General Checkup", "Surgery", "Emergency Care", "Vaccination"]
    },
    {
        "name": "24/7 Pet Emergency Hospital",
        "phone": "+919876543211",
        "address": "Andheri East, Near Metro Station",
        "city": "Mumbai",
        "state": "Maharashtra",
        "latitude": 19.1136,
        "longitude": 72.8697,
        "operatingHours": "24/7",
        "rating": 4.8,
        "is24x7": True,
        "services": ["Emergency Care", "Surgery", "ICU", "Diagnostics"]
    },
    {
        "name": "Pawsitive Vet Clinic",
        "phone": "+919876543212",
        "address": "Juhu Beach Road, Juhu",
        "city": "Mumbai",
        "state": "Maharashtra",
        "latitude": 19.0990,
        "longitude": 72.8265,
        "operatingHours": "8:00 AM - 8:00 PM",
        "rating": 4.3,
        "is24x7": False,
        "services": ["General Checkup", "Grooming", "Vaccination", "Dental Care"]
    },
    
    # Delhi
    {
        "name": "Capital Pet Hospital",
        "phone": "+919876543213",
        "address": "Connaught Place, Central Delhi",
        "city": "Delhi",
        "state": "Delhi",
        "latitude": 28.6315,
        "longitude": 77.2167,
        "operatingHours": "9:00 AM - 10:00 PM",
        "rating": 4.6,
        "is24x7": False,
        "services": ["General Checkup", "Surgery", "Vaccination", "Lab Tests"]
    },
    {
        "name": "Delhi Animal Care 24x7",
        "phone": "+919876543214",
        "address": "Saket, South Delhi",
        "city": "Delhi",
        "state": "Delhi",
        "latitude": 28.5244,
        "longitude": 77.2066,
        "operatingHours": "24/7",
        "rating": 4.7,
        "is24x7": True,
        "services": ["Emergency Care", "Surgery", "ICU", "Ambulance"]
    },
    
    # Bangalore
    {
        "name": "Bangalore Pet Clinic",
        "phone": "+919876543215",
        "address": "Indiranagar, Bangalore",
        "city": "Bangalore",
        "state": "Karnataka",
        "latitude": 12.9716,
        "longitude": 77.6412,
        "operatingHours": "8:00 AM - 9:00 PM",
        "rating": 4.4,
        "is24x7": False,
        "services": ["General Checkup", "Vaccination", "Grooming", "Boarding"]
    },
    {
        "name": "Koramangala Vet Hospital",
        "phone": "+919876543216",
        "address": "Koramangala 5th Block",
        "city": "Bangalore",
        "state": "Karnataka",
        "latitude": 12.9352,
        "longitude": 77.6245,
        "operatingHours": "24/7",
        "rating": 4.9,
        "is24x7": True,
        "services": ["Emergency Care", "Surgery", "Diagnostics", "Pharmacy"]
    },
    
    # Hyderabad
    {
        "name": "Hyderabad Pet Care Center",
        "phone": "+919876543217",
        "address": "Banjara Hills, Hyderabad",
        "city": "Hyderabad",
        "state": "Telangana",
        "latitude": 17.4239,
        "longitude": 78.4738,
        "operatingHours": "9:00 AM - 8:00 PM",
        "rating": 4.2,
        "is24x7": False,
        "services": ["General Checkup", "Vaccination", "Surgery", "Dental Care"]
    },
    {
        "name": "Hitech City Animal Hospital",
        "phone": "+919876543218",
        "address": "Hitech City, Madhapur",
        "city": "Hyderabad",
        "state": "Telangana",
        "latitude": 17.4485,
        "longitude": 78.3908,
        "operatingHours": "24/7",
        "rating": 4.6,
        "is24x7": True,
        "services": ["Emergency Care", "Surgery", "ICU", "Lab Tests"]
    },
    
    # Chennai
    {
        "name": "Chennai Veterinary Clinic",
        "phone": "+919876543219",
        "address": "T Nagar, Chennai",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "latitude": 13.0418,
        "longitude": 80.2341,
        "operatingHours": "8:00 AM - 9:00 PM",
        "rating": 4.3,
        "is24x7": False,
        "services": ["General Checkup", "Vaccination", "Surgery", "Grooming"]
    },
    {
        "name": "Anna Nagar Pet Hospital",
        "phone": "+919876543220",
        "address": "Anna Nagar West, Chennai",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "latitude": 13.0878,
        "longitude": 80.2088,
        "operatingHours": "24/7",
        "rating": 4.7,
        "is24x7": True,
        "services": ["Emergency Care", "Surgery", "Diagnostics", "Ambulance"]
    },
    
    # Pune
    {
        "name": "Pune Pet Wellness Center",
        "phone": "+919876543221",
        "address": "Koregaon Park, Pune",
        "city": "Pune",
        "state": "Maharashtra",
        "latitude": 18.5362,
        "longitude": 73.8958,
        "operatingHours": "9:00 AM - 8:00 PM",
        "rating": 4.4,
        "is24x7": False,
        "services": ["General Checkup", "Vaccination", "Grooming", "Nutrition"]
    },
    {
        "name": "Hinjewadi Vet Clinic 24x7",
        "phone": "+919876543222",
        "address": "Hinjewadi Phase 1, Pune",
        "city": "Pune",
        "state": "Maharashtra",
        "latitude": 18.5912,
        "longitude": 73.7389,
        "operatingHours": "24/7",
        "rating": 4.5,
        "is24x7": True,
        "services": ["Emergency Care", "Surgery", "ICU", "Lab Tests"]
    }
]


async def seed_providers() -> int:
    """
    Seed provider data into database
    
    Returns:
        int: Number of providers inserted
    """
    db = get_database()
    
    # Check if providers already exist
    existing_count = await db.providers.count_documents({})
    if existing_count > 0:
        print(f"[INFO] Providers collection already has {existing_count} documents. Skipping seed.")
        return 0
    
    # Insert provider data
    result = await db.providers.insert_many(PROVIDER_DATA)
    inserted_count = len(result.inserted_ids)
    
    print(f"[SUCCESS] Seeded {inserted_count} providers into database")
    return inserted_count


async def clear_providers() -> int:
    """
    Clear all provider data from database
    
    Returns:
        int: Number of providers deleted
    """
    db = get_database()
    result = await db.providers.delete_many({})
    print(f"[INFO] Deleted {result.deleted_count} providers from database")
    return result.deleted_count