"""
AI service for symptom analysis using Google Gemini AI
"""
from typing import List, Dict, Any, Optional
import json
import base64
from PIL import Image
import io
import google.generativeai as genai
from app.config import settings
from app.models.symptom_check import RiskLevel


class AIService:
    """Service for AI-powered symptom analysis"""
    
    def __init__(self):
        """Initialize Gemini AI client"""
        # Configure Gemini API with the correct key and model
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    async def analyze_symptoms(
        self,
        symptoms: str,
        category: str,
        subcategory: Optional[str],
        pet_context: Optional[Dict[str, Any]] = None,
        images: Optional[List[str]] = None,
        video: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze pet symptoms using Gemini AI with comprehensive pet context
        
        Args:
            symptoms: Text description of symptoms
            category: Health category
            subcategory: Health subcategory
            pet_context: Comprehensive pet information including profile, history, season, location
            images: List of base64 encoded images (optional)
            video: Base64 encoded video (optional)
        
        Returns:
            Dict with risk assessment and recommendations
        """
        print("\n" + "="*80)
        print("AI SERVICE - ANALYZE SYMPTOMS CALLED")
        print("="*80)
        print(f"Symptoms: '{symptoms}'")
        print(f"Symptoms length: {len(symptoms) if symptoms else 0}")
        print(f"Category: {category}")
        print(f"Subcategory: {subcategory}")
        print(f"Pet Context: {pet_context is not None}")
        if pet_context:
            print(f"  - Pet Name: {pet_context.get('name')}")
            print(f"  - Breed: {pet_context.get('breed')}")
            print(f"  - Age: {pet_context.get('age')}")
            print(f"  - Conditions: {len(pet_context.get('conditions', []))}")
            print(f"  - History: {len(pet_context.get('history', []))} previous checks")
            print(f"  - Season: {pet_context.get('season')}")
            print(f"  - Location: {pet_context.get('location')}")
        print(f"Images count: {len(images) if images else 0}")
        print(f"Video: {bool(video)}")
        print("="*80 + "\n")
        
        # Handle empty symptoms - use media description if available
        if not symptoms or not symptoms.strip():
            if images and len(images) > 0:
                symptoms = f"Please analyze the uploaded image(s) for any visible health concerns in the {category.lower()} category."
            elif video:
                symptoms = f"Please analyze the uploaded video for any visible health concerns in the {category.lower()} category."
            else:
                symptoms = f"General {category.lower()} assessment requested."
        
        # Build comprehensive prompt with pet context
        prompt = self._build_veterinary_prompt(
            symptoms, category, subcategory, pet_context
        )
        
        print("\n" + "="*80)
        print("PROMPT BEING SENT TO GEMINI:")
        print("="*80)
        print(prompt)
        print("="*80 + "\n")
        
        try:
            print("Calling Gemini API...")
            
            # Prepare content for Gemini
            content_parts = []
            
            # Add images if provided (BEFORE the prompt for better context)
            if images and len(images) > 0:
                print(f"Processing {len(images)} image(s) for Gemini...")
                
                for idx, img_data in enumerate(images):
                    try:
                        # Remove data URL prefix if present
                        if ',' in img_data:
                            img_data = img_data.split(',')[1]
                        
                        # Decode base64 image
                        img_bytes = base64.b64decode(img_data)
                        img = Image.open(io.BytesIO(img_bytes))
                        
                        # Convert to RGB if necessary (handle RGBA, grayscale, etc.)
                        if img.mode not in ('RGB', 'L'):
                            print(f"  - Converting image {idx + 1} from {img.mode} to RGB")
                            img = img.convert('RGB')
                        
                        # Add image to content parts
                        content_parts.append(img)
                        print(f"  - Image {idx + 1}: {img.format} {img.size} {img.mode}")
                    except Exception as e:
                        print(f"  - Error processing image {idx + 1}: {type(e).__name__}: {e}")
                        import traceback
                        print(f"  - Traceback: {traceback.format_exc()}")
                        # Continue processing other images even if one fails
                        continue
            
            # Add the prompt after images
            content_parts.append(prompt)
            
            # Add video if provided
            if video:
                print("Processing video for Gemini...")
                try:
                    # Remove data URL prefix if present
                    if ',' in video:
                        video_data = video.split(',')[1]
                    else:
                        video_data = video
                    
                    # Decode base64 video
                    video_bytes = base64.b64decode(video_data)
                    content_parts.append({
                        'mime_type': 'video/mp4',
                        'data': video_bytes
                    })
                    print("  - Video added successfully")
                except Exception as e:
                    print(f"  - Error processing video: {e}")
            
            print(f"Sending {len(content_parts)} content part(s) to Gemini (images: {len([p for p in content_parts if isinstance(p, Image.Image)])}, text: {len([p for p in content_parts if isinstance(p, str)])})...")
            
            # Generate response using Gemini with all content
            # Use safety settings to allow medical content
            from google.generativeai.types import HarmCategory, HarmBlockThreshold
            
            safety_settings = {
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
            }
            
            response = self.model.generate_content(
                content_parts,
                safety_settings=safety_settings
            )
            
            print("\n" + "="*80)
            print("GEMINI API RESPONSE:")
            print("="*80)
            print(response.text)
            print("="*80 + "\n")
            
            # Parse the response
            analysis = self._parse_gemini_response(response.text)
            
            print("\n" + "="*80)
            print("PARSED ANALYSIS:")
            print("="*80)
            print(f"Risk Level: {analysis['riskLevel']}")
            print(f"Summary: {analysis['summary']}")
            print("="*80 + "\n")
            
            return analysis
            
        except Exception as e:
            print("\n" + "="*80)
            print("GEMINI API ERROR:")
            print("="*80)
            print(f"Error type: {type(e).__name__}")
            print(f"Error message: {str(e)}")
            import traceback
            print(f"Traceback:\n{traceback.format_exc()}")
            print("="*80 + "\n")
            print("Falling back to mock response...")
            # Fallback to mock response if API fails
            return await self._mock_ai_response(
                symptoms, category, subcategory, pet_context
            )
    
    def _build_veterinary_prompt(
        self,
        symptoms: str,
        category: str,
        subcategory: Optional[str],
        pet_context: Optional[Dict[str, Any]]
    ) -> str:
        """Build a comprehensive prompt for Gemini AI with full pet context"""
        
        # Build comprehensive pet context if available
        context_text = ""
        if pet_context:
            context_text = "\n\nPET PROFILE:"
            context_text += f"\n- Name: {pet_context.get('name', 'Unknown')}"
            context_text += f"\n- Breed: {pet_context.get('breed', 'Unknown')}"
            context_text += f"\n- Age: {pet_context.get('age', 'Unknown')} years old"
            context_text += f"\n- Gender: {pet_context.get('gender', 'Unknown')}"
            
            if pet_context.get('weight'):
                context_text += f"\n- Weight: {pet_context['weight']} kg"
            if pet_context.get('lifestyle'):
                context_text += f"\n- Lifestyle: {pet_context['lifestyle']}"
            
            # Add medical conditions
            conditions = pet_context.get('conditions', [])
            if conditions:
                context_text += f"\n- Known Medical Conditions: {', '.join(conditions)}"
            else:
                context_text += "\n- Known Medical Conditions: None"
            
            # Add allergies
            allergies = pet_context.get('allergies', [])
            if allergies:
                context_text += f"\n- Known Allergies: {', '.join(allergies)}"
            else:
                context_text += "\n- Known Allergies: None"
            
            # Add season and location context
            if pet_context.get('season'):
                context_text += f"\n- Current Season: {pet_context['season']}"
            
            if pet_context.get('location'):
                loc = pet_context['location']
                if loc.get('city') and loc.get('state'):
                    context_text += f"\n- Location: {loc['city']}, {loc['state']}"
                    if loc.get('pincode'):
                        context_text += f" (PIN: {loc['pincode']})"
            
            # Add ACTIVE health concerns
            history = pet_context.get('history', [])
            if history:
                context_text += f"\n\nACTIVE HEALTH CONCERNS ({len(history)} ongoing):"
                for i, check in enumerate(history[:3], 1):  # Show last 3 active checks
                    date = check.get('date')
                    if date:
                        from datetime import datetime
                        if isinstance(date, str):
                            try:
                                date_str = datetime.fromisoformat(date.replace('Z', '+00:00')).strftime('%b %d, %Y')
                            except:
                                date_str = "Recent"
                        else:
                            date_str = date.strftime('%b %d, %Y')
                    else:
                        date_str = "Recent"
                    
                    context_text += f"\n{i}. {date_str} - {check.get('category', 'Unknown')}"
                    if check.get('subcategory'):
                        context_text += f" ({check['subcategory']})"
                    context_text += f" - Risk: {check.get('riskLevel', 'Unknown')}"
                    if check.get('summary'):
                        context_text += f"\n   Summary: {check['summary'][:150]}..."
            
            # Add RESOLVED past issues
            resolved_history = pet_context.get('resolved_history', [])
            if resolved_history:
                context_text += f"\n\nRESOLVED PAST ISSUES ({len(resolved_history)} addressed):"
                for i, check in enumerate(resolved_history[:3], 1):  # Show last 3 resolved checks
                    date = check.get('date')
                    if date:
                        from datetime import datetime
                        if isinstance(date, str):
                            try:
                                date_str = datetime.fromisoformat(date.replace('Z', '+00:00')).strftime('%b %d, %Y')
                            except:
                                date_str = "Past"
                        else:
                            date_str = date.strftime('%b %d, %Y')
                    else:
                        date_str = "Past"
                    
                    context_text += f"\n{i}. {date_str} - {check.get('category', 'Unknown')}"
                    if check.get('subcategory'):
                        context_text += f" ({check['subcategory']})"
                    context_text += f" - Was: {check.get('riskLevel', 'Unknown')} (Now Resolved)"
                    if check.get('summary'):
                        context_text += f"\n   Note: {check['summary'][:100]}... [Issue has been addressed]"
        
        prompt = f"""You are an experienced veterinarian providing a professional assessment. Analyze the following case and provide a concise, empathetic response.

CASE INFORMATION:
- Category: {category}
- Subcategory: {subcategory or 'General'}{context_text}

SYMPTOMS DESCRIBED:
{symptoms}

INSTRUCTIONS:
Provide a clear, concise response in this EXACT format. Be empathetic but direct. Avoid repetition.

1. First, determine the RISK LEVEL (choose ONE):
   - EMERGENCY: Life-threatening, needs immediate vet care NOW
   - URGENT: Needs vet within 12-24 hours
   - MONITOR: Can monitor at home for 24-48 hours, see vet if worsens
   - LOW RISK: Minor concern, routine vet visit sufficient

2. Provide your response in this EXACT format:

RISK_LEVEL: [EMERGENCY/URGENT/MONITOR/LOW RISK]

CONTEXT USED:
[In 1-2 sentences, briefly mention what context you considered: pet's profile (breed, age, medical conditions), location/climate, season, previous health history if available, and any photos/videos provided. Be specific about what information helped your assessment.]

ASSESSMENT:
[2-3 concise sentences explaining what you observe and why it matters. Be empathetic but direct. If EMERGENCY, start with "⚠️ TAKE YOUR PET TO THE EMERGENCY VET NOW."]

WHAT THIS MEANS:
• [Key medical concern #1 - one line]
• [Key medical concern #2 - one line]
• [Key medical concern #3 - one line if needed]

IMMEDIATE ACTIONS:
1. [First action with specific timeframe]
2. [Second action]
3. [Third action]

Remember:
- Be concise and to the point
- Show empathy through tone, not length
- No repetition between sections
- Use specific timeframes
- If emergency, emphasize urgency clearly once
- Do NOT include a separate SUMMARY line
- Do NOT include "WHAT TO EXPECT AT THE VET" section
- ALWAYS include the CONTEXT USED section to show what information informed your assessment
"""
        
        return prompt
    
    def _parse_gemini_response(self, response_text: str) -> Dict[str, Any]:
        """Parse Gemini's response into structured format"""
        
        lines = response_text.strip().split('\n')
        
        # Extract risk level
        risk_level = "MONITOR"
        for line in lines:
            if line.startswith("RISK_LEVEL:"):
                risk_level = line.split(":", 1)[1].strip().upper()
                break
        
        # Map to RiskLevel enum
        risk_level_map = {
            "EMERGENCY": RiskLevel.EMERGENCY,
            "URGENT": RiskLevel.URGENT,
            "MONITOR": RiskLevel.MONITOR,
            "LOW RISK": RiskLevel.LOW_RISK,
            "LOW_RISK": RiskLevel.LOW_RISK
        }
        risk_enum = risk_level_map.get(risk_level, RiskLevel.MONITOR)
        
        # Extract assessment section for summary
        assessment_text = []
        in_assessment = False
        for line in lines:
            if line.startswith("ASSESSMENT:"):
                in_assessment = True
                continue
            if in_assessment:
                if line.strip() and not any(section in line for section in ["WHAT THIS MEANS:", "IMMEDIATE ACTIONS:", "CONTEXT USED:"]):
                    assessment_text.append(line.strip())
                elif any(section in line for section in ["WHAT THIS MEANS:", "IMMEDIATE ACTIONS:", "CONTEXT USED:"]):
                    break
        
        # Use first sentence of assessment as summary
        summary = " ".join(assessment_text) if assessment_text else "Professional veterinary assessment completed"
        
        # Parse all sections
        detailed_sections = []
        current_section = None
        current_points = []
        
        for line in lines:
            line = line.strip()
            
            # Skip RISK_LEVEL line
            if line.startswith("RISK_LEVEL:"):
                continue
            
            # Check for section headers (including new CONTEXT USED section)
            if line in ["CONTEXT USED:", "ASSESSMENT:", "WHAT THIS MEANS:", "IMMEDIATE ACTIONS:"]:
                # Save previous section if exists
                if current_section and current_points:
                    detailed_sections.append({
                        "title": current_section,
                        "points": current_points
                    })
                
                # Start new section
                current_section = line.rstrip(':')
                current_points = []
            elif current_section and line:
                # Add content to current section
                # Remove numbering from actions
                if current_section == "IMMEDIATE ACTIONS" and line[0].isdigit():
                    line = line.lstrip('0123456789.').strip()
                current_points.append(line)
        
        # Add last section
        if current_section and current_points:
            detailed_sections.append({
                "title": current_section,
                "points": current_points
            })
        
        # Extract immediate actions for separate field
        immediate_actions = []
        for section in detailed_sections:
            if section["title"] == "IMMEDIATE ACTIONS":
                immediate_actions = section["points"]
                break
        
        return {
            "riskLevel": risk_enum,
            "summary": summary,
            "detailedSections": detailed_sections,
            "immediateActions": immediate_actions[:3] if immediate_actions else [
                "Monitor your pet closely",
                "Contact your veterinarian",
                "Document any changes in symptoms"
            ],
            "reasoning": summary[:500] if summary else "Based on the symptoms described, professional veterinary evaluation is recommended."
        }
    
    async def _mock_ai_response(
        self,
        symptoms: str,
        category: str,
        subcategory: Optional[str],
        pet_context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generate mock AI response for development/fallback
        """
        # Determine risk level based on keywords
        risk_level = self._determine_risk_level(symptoms)
        
        # Generate context-aware response WITHOUT pet-specific information
        if risk_level == RiskLevel.EMERGENCY:
            return {
                "riskLevel": risk_level,
                "summary": "EMERGENCY: Your pet needs immediate veterinary attention.",
                "detailedSections": [
                    {
                        "title": "Your Intelligent Pet Health Assistant",
                        "points": [
                            "I need to be direct with you - based on what you've described, this is an emergency situation that requires immediate veterinary care.",
                            "The symptoms you're seeing indicate a potentially life-threatening condition. We cannot wait to see if this improves on its own.",
                            "Time is critical here. The sooner your pet receives professional medical care, the better the outcome will be."
                        ]
                    },
                    {
                        "title": "Why This Can't Wait",
                        "points": [
                            "These symptoms can progress rapidly in pets",
                            "Delaying care could lead to serious complications",
                            "Emergency vets have the equipment and expertise needed right now",
                            "Early intervention significantly improves outcomes"
                        ]
                    }
                ],
                "immediateActions": [
                    "Call emergency vet NOW - let them know you're coming",
                    "Transport pet carefully and calmly",
                    "Bring all medical records and recent medications"
                ],
                "reasoning": "Based on the symptoms described, this requires immediate professional medical attention. The symptoms indicate a potentially life-threatening condition that cannot wait."
            }
        
        elif risk_level == RiskLevel.URGENT:
            return {
                "riskLevel": risk_level,
                "summary": "Your pet needs veterinary care within 12-24 hours.",
                "detailedSections": [
                    {
                        "title": "Your Intelligent Pet Health Assistant",
                        "points": [
                            "From what you've described, I'm concerned enough that I want you to see a veterinarian within the next 12-24 hours.",
                            "While this isn't immediately life-threatening, the symptoms suggest something that needs professional evaluation and treatment soon.",
                            "These symptoms can worsen quickly, and early treatment often leads to better outcomes and less complicated care."
                        ]
                    },
                    {
                        "title": "What to Monitor",
                        "points": [
                            "Watch for any worsening of current symptoms",
                            "Note if new symptoms develop",
                            "Monitor eating, drinking, and bathroom habits",
                            "If symptoms worsen significantly, seek emergency care"
                        ]
                    }
                ],
                "immediateActions": [
                    "Schedule vet appointment for tomorrow or within 24 hours",
                    "Monitor symptoms closely and document changes",
                    "Keep pet comfortable and limit strenuous activity"
                ],
                "reasoning": "The symptoms described suggest a condition that requires professional evaluation. While not immediately life-threatening, prompt veterinary care is important to prevent complications."
            }
        
        elif risk_level == RiskLevel.MONITOR:
            return {
                "riskLevel": risk_level,
                "summary": "Monitor your pet for 24-48 hours. Seek vet care if symptoms persist or worsen.",
                "detailedSections": [
                    {
                        "title": "Your Intelligent Pet Health Assistant",
                        "points": [
                            "Based on what you've told me, this appears to be something we can monitor at home for now.",
                            "That said, I want you to keep a close eye on things. Sometimes what seems minor can develop into something more significant.",
                            "If symptoms persist beyond 48 hours or get worse, that's when we need to have a vet take a look. Trust your instincts - you know your pet best."
                        ]
                    },
                    {
                        "title": "Home Care Guidelines",
                        "points": [
                            "Maintain normal feeding and water schedule",
                            "Provide a comfortable, quiet resting area",
                            "Avoid strenuous exercise or stressful situations",
                            "Keep a symptom diary noting any changes"
                        ]
                    }
                ],
                "immediateActions": [
                    "Monitor closely for next 24-48 hours",
                    "Keep a log of symptoms and any changes",
                    "Contact vet if symptoms worsen or new ones appear"
                ],
                "reasoning": "The symptoms described are concerning but may resolve with monitoring and supportive care. Professional evaluation is recommended if symptoms persist or worsen."
            }
        
        else:  # LOW_RISK
            return {
                "riskLevel": risk_level,
                "summary": "Minor concern. Continue normal care and mention at next vet visit.",
                "detailedSections": [
                    {
                        "title": "Your Intelligent Pet Health Assistant",
                        "points": [
                            "Good news - what you're describing doesn't raise any immediate red flags for me.",
                            "This appears to be a minor issue that typically resolves on its own with normal care.",
                            "That said, it's always worth mentioning to your vet at your next regular checkup, just to keep them in the loop about your pet's health history."
                        ]
                    },
                    {
                        "title": "General Care Tips",
                        "points": [
                            "Continue your normal feeding and exercise routine",
                            "Keep up with regular grooming and hygiene",
                            "Maintain scheduled vaccinations and preventive care",
                            "Stay observant for any changes in behavior or symptoms"
                        ]
                    }
                ],
                "immediateActions": [
                    "Continue normal care routine",
                    "Monitor casually - no need for intensive watching",
                    "Mention to vet at next regular checkup"
                ],
                "reasoning": "The symptoms described appear to be minor and likely not cause for immediate concern. However, it's always good to monitor your pet's health and consult with a veterinarian if you have any concerns."
            }
    
    def _determine_risk_level(self, symptoms: str) -> RiskLevel:
        """
        Determine risk level based on symptom keywords
        """
        symptoms_lower = symptoms.lower()
        
        # Emergency keywords
        emergency_keywords = [
            'bleeding', 'blood', 'seizure', 'unconscious', 'collapse',
            'difficulty breathing', 'choking', 'poisoning', 'toxic',
            'severe pain', 'trauma', 'accident', 'hit by', 'broken bone',
            'not breathing', 'unresponsive', 'convulsion', 'bloat',
            'pale gums', 'blue gums', 'distended abdomen'
        ]
        
        # Urgent keywords
        urgent_keywords = [
            'vomiting', 'diarrhea', 'not eating', 'lethargic', 'fever',
            'limping', 'swelling', 'discharge', 'coughing', 'sneezing',
            'scratching excessively', 'loss of appetite', 'dehydrated',
            'painful', 'whining', 'restless', 'rapid breathing'
        ]
        
        # Monitor keywords
        monitor_keywords = [
            'mild', 'slight', 'occasional', 'sometimes', 'minor',
            'small', 'little', 'bit'
        ]
        
        # Check for emergency
        if any(keyword in symptoms_lower for keyword in emergency_keywords):
            return RiskLevel.EMERGENCY
        
        # Check for urgent
        if any(keyword in symptoms_lower for keyword in urgent_keywords):
            # Check if it's been going on for multiple days
            if any(word in symptoms_lower for word in ['days', 'week', 'weeks', 'persistent', 'continuous']):
                return RiskLevel.URGENT
            return RiskLevel.MONITOR
        
        # Check for monitor keywords
        if any(keyword in symptoms_lower for keyword in monitor_keywords):
            return RiskLevel.LOW_RISK
        
        # Default to monitor
        return RiskLevel.MONITOR
    
    async def get_vet_recommendations_by_pincode(self, pincode: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Use Gemini AI to recommend veterinary clinics based on Indian pin code
        
        Args:
            pincode: Indian postal code (6 digits)
            limit: Number of clinics to return (default: 10)
        
        Returns:
            List of veterinary clinic recommendations with details
        """
        print("\n" + "="*80)
        print("GEMINI VET RECOMMENDATIONS BY PINCODE - STARTING")
        print("="*80)
        print(f"Pin Code: {pincode}")
        print(f"Limit: {limit}")
        print("="*80 + "\n")
        
        prompt = f"""You are a local veterinary directory assistant for India.

Please provide a list of {limit} well-known, reputable veterinary clinics near pin code {pincode} in India. For each clinic, provide:

1. **Name**: Full clinic name
2. **Address**: Complete street address
3. **Phone**: Contact phone number (with country code +91)
4. **Services**: List of main services offered (e.g., General Checkup, Emergency Care, Surgery, Vaccination, etc.)
5. **Specialties**: Any special areas of expertise
6. **Hours**: Typical operating hours (if known)
7. **Emergency**: Whether they offer 24/7 emergency services (true/false)
8. **Rating**: Approximate rating out of 5 (if known)
9. **Notes**: Any additional helpful information

Format your response as a JSON array of clinic objects. Use this exact structure:

```json
[
  {{
    "name": "Clinic Name",
    "address": "Full address with pin code",
    "phone": "+91-XXXXXXXXXX",
    "services": ["Service 1", "Service 2", "Service 3"],
    "specialties": ["Specialty 1", "Specialty 2"],
    "hours": "Mon-Sat: 9:00 AM - 8:00 PM, Sun: 10:00 AM - 6:00 PM",
    "emergency": true,
    "rating": 4.5,
    "notes": "Additional information",
    "distance": "Approximate distance from pin code {pincode} (e.g., '2.5 km')"
  }}
]
```

IMPORTANT:
- Focus on clinics actually near pin code {pincode}
- Include the approximate distance from the pin code
- Provide {limit} clinics, ordered by proximity/relevance
- Provide ONLY the JSON array, no additional text before or after."""

        try:
            print("Calling Gemini API for vet recommendations...")
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            print("\n" + "="*80)
            print("GEMINI RESPONSE RECEIVED")
            print("="*80)
            print(f"Response length: {len(response_text)} characters")
            print("First 500 characters:")
            print(response_text[:500])
            print("="*80 + "\n")
            
            # Extract JSON from response
            # Remove markdown code blocks if present
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            # Parse JSON
            clinics = json.loads(response_text)
            
            print("\n" + "="*80)
            print("PARSED CLINICS")
            print("="*80)
            print(f"Number of clinics: {len(clinics)}")
            for i, clinic in enumerate(clinics, 1):
                print(f"{i}. {clinic.get('name', 'Unknown')} - {clinic.get('distance', 'N/A')}")
            print("="*80 + "\n")
            
            return clinics
            
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON from Gemini response: {e}")
            print(f"Response text: {response_text}")
            # Return fallback clinics
            return self._get_fallback_clinics(pincode, limit)
        except Exception as e:
            print(f"Error getting vet recommendations from Gemini: {e}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            # Return fallback clinics
            return self._get_fallback_clinics(pincode, limit)
    
    def _get_fallback_clinics(self, pincode: str, limit: int) -> List[Dict[str, Any]]:
        """Fallback list of veterinary clinics"""
        fallback_clinics = [
            {
                "name": "City Veterinary Clinic",
                "address": f"Near Pin Code {pincode}, India",
                "phone": "+91-XXXXXXXXXX",
                "services": ["General Checkup", "Vaccination", "Surgery", "Emergency Care"],
                "specialties": ["Small Animals", "General Practice"],
                "hours": "Mon-Sat: 9:00 AM - 8:00 PM, Sun: 10:00 AM - 2:00 PM",
                "emergency": False,
                "rating": 4.0,
                "notes": "Please verify clinic details before visiting",
                "distance": "Contact for exact location"
            },
            {
                "name": "Pet Care Hospital",
                "address": f"Near Pin Code {pincode}, India",
                "phone": "+91-XXXXXXXXXX",
                "services": ["General Checkup", "Vaccination", "Surgery", "Dental Care", "Emergency Care"],
                "specialties": ["Dogs", "Cats", "Emergency Services"],
                "hours": "Mon-Sun: 24 Hours",
                "emergency": True,
                "rating": 4.3,
                "notes": "24/7 emergency services available",
                "distance": "Contact for exact location"
            },
            {
                "name": "Animal Wellness Center",
                "address": f"Near Pin Code {pincode}, India",
                "phone": "+91-XXXXXXXXXX",
                "services": ["General Checkup", "Vaccination", "Grooming", "Dental Care"],
                "specialties": ["Preventive Care", "Wellness Programs"],
                "hours": "Mon-Sat: 10:00 AM - 7:00 PM",
                "emergency": False,
                "rating": 4.2,
                "notes": "Focus on preventive and wellness care",
                "distance": "Contact for exact location"
            }
        ]
        
        # Return up to the requested limit
        return fallback_clinics[:min(limit, len(fallback_clinics))]


# Global AI service instance
ai_service = AIService()