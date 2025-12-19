"""
Breed-specific health tips and recommendations
"""
from typing import Dict, List


BREED_HEALTH_TIPS: Dict[str, Dict[str, any]] = {
    "Labrador Retriever": {
        "commonIssues": [
            "Hip Dysplasia",
            "Elbow Dysplasia",
            "Obesity",
            "Ear Infections"
        ],
        "careTips": [
            "Regular exercise (60-90 minutes daily) to prevent obesity",
            "Monitor food intake carefully - Labs love to eat!",
            "Check and clean ears weekly to prevent infections",
            "Regular hip and joint check-ups after age 5",
            "Swimming is excellent low-impact exercise"
        ],
        "dietRecommendations": [
            "High-quality protein-based diet",
            "Avoid overfeeding - measure portions carefully",
            "Joint supplements (glucosamine) after age 5",
            "Omega-3 fatty acids for coat and joint health"
        ]
    },
    "German Shepherd": {
        "commonIssues": [
            "Hip Dysplasia",
            "Degenerative Myelopathy",
            "Bloat (GDV)",
            "Skin Allergies"
        ],
        "careTips": [
            "Regular exercise but avoid over-exertion in puppies",
            "Feed smaller meals 2-3 times daily to prevent bloat",
            "Regular grooming to manage shedding",
            "Mental stimulation through training and puzzles",
            "Monitor for signs of hip problems"
        ],
        "dietRecommendations": [
            "High-quality protein diet (22-24% protein)",
            "Avoid feeding immediately before/after exercise",
            "Consider elevated food bowls to reduce bloat risk",
            "Joint supplements for hip health"
        ]
    },
    "Golden Retriever": {
        "commonIssues": [
            "Hip Dysplasia",
            "Cancer",
            "Heart Disease",
            "Skin Allergies"
        ],
        "careTips": [
            "Regular exercise (60 minutes daily)",
            "Annual cancer screenings after age 6",
            "Regular grooming and skin checks",
            "Dental care to prevent heart disease",
            "Swimming is excellent exercise"
        ],
        "dietRecommendations": [
            "High-quality diet with omega-3 fatty acids",
            "Antioxidant-rich foods",
            "Weight management crucial",
            "Consider fish-based proteins for skin health"
        ]
    },
    "Beagle": {
        "commonIssues": [
            "Obesity",
            "Ear Infections",
            "Epilepsy",
            "Hip Dysplasia"
        ],
        "careTips": [
            "Strict portion control - Beagles love food!",
            "Regular ear cleaning (weekly)",
            "Secure fencing - strong hunting instinct",
            "Daily exercise (45-60 minutes)",
            "Mental stimulation to prevent boredom"
        ],
        "dietRecommendations": [
            "Measured portions - prone to obesity",
            "High-fiber diet to maintain satiety",
            "Avoid table scraps",
            "Regular feeding schedule"
        ]
    },
    "Pug": {
        "commonIssues": [
            "Breathing Problems",
            "Eye Injuries",
            "Obesity",
            "Hip Dysplasia"
        ],
        "careTips": [
            "Avoid exercise in hot weather",
            "Keep facial wrinkles clean and dry",
            "Regular eye checks",
            "Weight management crucial",
            "Short, frequent walks instead of long runs"
        ],
        "dietRecommendations": [
            "Portion control essential",
            "Low-calorie, high-quality diet",
            "Avoid foods that cause gas",
            "Fresh water always available"
        ]
    },
    "Indian Pariah Dog": {
        "commonIssues": [
            "Tick-borne Diseases",
            "Skin Infections",
            "Dental Issues",
            "Parasites"
        ],
        "careTips": [
            "Regular tick and flea prevention",
            "Annual health check-ups",
            "Dental care important",
            "Moderate exercise needs",
            "Very adaptable to Indian climate"
        ],
        "dietRecommendations": [
            "Balanced diet with local ingredients",
            "Rice and meat-based diet works well",
            "Avoid processed foods",
            "Regular deworming"
        ]
    },
    "Shih Tzu": {
        "commonIssues": [
            "Eye Problems",
            "Dental Issues",
            "Breathing Problems",
            "Skin Allergies"
        ],
        "careTips": [
            "Daily grooming essential",
            "Regular eye cleaning",
            "Dental care crucial",
            "Avoid hot weather exercise",
            "Keep hair trimmed around eyes"
        ],
        "dietRecommendations": [
            "Small, frequent meals",
            "Soft food if dental issues present",
            "High-quality small breed formula",
            "Avoid foods causing allergies"
        ]
    },
    "Rottweiler": {
        "commonIssues": [
            "Hip Dysplasia",
            "Osteosarcoma",
            "Bloat (GDV)",
            "Heart Disease"
        ],
        "careTips": [
            "Regular exercise but controlled in puppies",
            "Feed 2-3 smaller meals to prevent bloat",
            "Regular joint check-ups",
            "Early socialization important",
            "Monitor for signs of lameness"
        ],
        "dietRecommendations": [
            "High-quality large breed formula",
            "Controlled calcium for puppies",
            "Joint supplements after age 5",
            "Avoid exercise around feeding time"
        ]
    },
    "Dachshund": {
        "commonIssues": [
            "Intervertebral Disc Disease",
            "Obesity",
            "Dental Issues",
            "Patellar Luxation"
        ],
        "careTips": [
            "Prevent jumping from heights",
            "Use ramps for furniture/cars",
            "Weight management crucial for back health",
            "Regular dental care",
            "Moderate exercise on flat surfaces"
        ],
        "dietRecommendations": [
            "Weight control essential",
            "High-quality small breed formula",
            "Joint supplements",
            "Avoid overfeeding treats"
        ]
    },
    "Boxer": {
        "commonIssues": [
            "Cancer",
            "Heart Disease",
            "Hip Dysplasia",
            "Bloat (GDV)"
        ],
        "careTips": [
            "Regular cardiac check-ups",
            "Avoid exercise in extreme heat",
            "Feed smaller, frequent meals",
            "Regular cancer screenings",
            "High energy - needs lots of exercise"
        ],
        "dietRecommendations": [
            "High-quality protein diet",
            "Avoid feeding before/after exercise",
            "Heart-healthy diet with taurine",
            "Antioxidant-rich foods"
        ]
    }
}


def get_breed_tips(breed: str) -> Dict[str, any]:
    """
    Get health tips for a specific breed
    
    Args:
        breed: Dog breed name
    
    Returns:
        Dict with breed-specific health information
    """
    # Try exact match first
    if breed in BREED_HEALTH_TIPS:
        return {
            "breed": breed,
            **BREED_HEALTH_TIPS[breed]
        }
    
    # Try case-insensitive match
    for key in BREED_HEALTH_TIPS.keys():
        if key.lower() == breed.lower():
            return {
                "breed": key,
                **BREED_HEALTH_TIPS[key]
            }
    
    # Return generic tips if breed not found
    return {
        "breed": breed,
        "commonIssues": [
            "Varies by breed"
        ],
        "careTips": [
            "Regular veterinary check-ups",
            "Balanced diet appropriate for size and age",
            "Daily exercise based on breed energy level",
            "Regular grooming and dental care",
            "Keep vaccinations up to date"
        ],
        "dietRecommendations": [
            "High-quality dog food appropriate for size",
            "Fresh water always available",
            "Avoid human food and table scraps",
            "Consult vet for specific dietary needs"
        ]
    }


def get_all_breeds() -> List[str]:
    """
    Get list of all breeds with specific tips
    
    Returns:
        List of breed names
    """
    return list(BREED_HEALTH_TIPS.keys())