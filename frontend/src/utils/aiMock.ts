import { SymptomCheck, Pet, SymptomCategory, HealthSubcategory, DetailedRecommendation } from '@/types';

const EMERGENCY_KEYWORDS = [
  'breathing', 'seizure', 'collapse', 'unconscious', 'bleeding heavily',
  'poisoning', 'choking', 'not breathing', 'blue gums', 'severe injury',
  'bloat', 'heatstroke', 'unable to stand', 'severe pain', 'respiratory rate',
  'fever', 'can\'t breathe', 'gasping', 'convulsing', 'unresponsive',
];

const URGENT_KEYWORDS = [
  'vomiting', 'diarrhea', 'lethargy', 'not eating', 'limping',
  'swollen', 'fever', 'coughing', 'wheezing', 'blood in stool',
  'excessive drinking', 'weight loss', 'aggression', 'disoriented',
  'won\'t eat', 'refusing food', 'very tired', 'weak',
];

const MONITOR_KEYWORDS = [
  'scratching', 'mild cough', 'sneezing', 'slight limp', 'reduced appetite',
  'drinking more', 'restless', 'mild swelling', 'dry nose', 'bad breath',
  'itching', 'minor cut', 'small bump',
];

export const analyzeSymptoms = (
  symptoms: string,
  images: string[],
  category: SymptomCategory,
  healthSubcategory?: HealthSubcategory,
<<<<<<< HEAD
  video?: string,
  petContext?: { name: string; breed: string; age: number; conditions: string[]; allergies: string[]; history?: any[] }
): Omit<SymptomCheck, 'id' | 'petId' | 'userId' | 'timestamp'> => {
  const lowerSymptoms = symptoms.toLowerCase();
  
  // Enhance analysis with pet context if available
  let contextualInfo = '';
  let historyInsight = '';
  
  if (petContext) {
    contextualInfo = ` (${petContext.name}, ${petContext.breed}, ${petContext.age} years old`;
    if (petContext.conditions.length > 0) {
      contextualInfo += `, known conditions: ${petContext.conditions.join(', ')}`;
    }
    if (petContext.allergies.length > 0) {
      contextualInfo += `, allergies: ${petContext.allergies.join(', ')}`;
    }
    contextualInfo += ')';
    
    // Analyze history for patterns
    if (petContext.history && petContext.history.length > 0) {
      const recentChecks = petContext.history.slice(0, 3); // Last 3 checks
      const hasRecurringIssues = recentChecks.some(check =>
        check.category === category ||
        (check.healthSubcategory && check.healthSubcategory === healthSubcategory)
      );
      
      if (hasRecurringIssues) {
        historyInsight = `\n\n⚠️ **Important**: ${petContext.name} has had similar health concerns in the past. This recurring pattern suggests the need for a thorough veterinary evaluation to identify and address the underlying cause.`;
      }
    }
  }
  
=======
  video?: string
): Omit<SymptomCheck, 'id' | 'petId' | 'userId' | 'timestamp'> => {
  const lowerSymptoms = symptoms.toLowerCase();
  
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
  // Check for emergency keywords
  const hasEmergency = EMERGENCY_KEYWORDS.some(keyword => 
    lowerSymptoms.includes(keyword)
  );
  
  if (hasEmergency) {
    return {
      category,
      healthSubcategory,
      symptoms,
      images,
      video,
      riskLevel: 'Emergency',
      summary: 'This sounds like an emergency situation that warrants immediate veterinary care. Based on the symptoms described, your pet needs urgent medical attention.',
      detailedSections: [
        {
          title: 'Concerning Signs',
          points: [
            'Symptoms indicate potential life-threatening condition',
            'Rapid deterioration is possible without immediate intervention',
            'Multiple critical symptoms present simultaneously',
            'Time-sensitive situation requiring urgent care',
          ],
        },
        {
          title: 'Why This Can\'t Wait',
          points: [
            'Emergency symptoms can progress to organ failure within hours',
            'Young or senior pets have less physiological reserve',
            'Delay in treatment significantly reduces positive outcomes',
            'Some conditions require immediate stabilization to prevent death',
            'Emergency care provides life-saving interventions unavailable at home',
          ],
        },
        {
          title: 'What Emergency Care Can Provide',
          points: [
            'Oxygen therapy and respiratory support if needed',
            'IV fluids and emergency medications',
            'Continuous monitoring throughout the night',
            'Immediate diagnostic testing (bloodwork, X-rays, ultrasound)',
            'Surgical intervention if required',
            'ICU-level care with trained emergency staff',
          ],
        },
      ],
      immediateActions: [
        '🚨 Take your pet to the nearest 24/7 emergency veterinary clinic NOW',
        '📞 Call ahead to let them know you\'re coming',
        '🚗 Keep your pet calm and comfortable during transport',
        '⏱️ Do not wait - every minute counts in an emergency',
        '💊 Bring any medications your pet is currently taking',
      ],
<<<<<<< HEAD
      reasoning: 'I understand emergency vet visits are expensive and stressful, but waiting with these symptoms carries significant risk. The symptoms you\'ve described indicate a medical emergency that requires immediate professional care. Please take your pet to the emergency vet now. If there\'s any question, call the emergency vet and describe the symptoms - they can help assess urgency, but based on what you\'ve described, immediate care is needed.' + historyInsight,
=======
      reasoning: 'I understand emergency vet visits are expensive and stressful, but waiting with these symptoms carries significant risk. The symptoms you\'ve described indicate a medical emergency that requires immediate professional care. Please take your pet to the emergency vet now. If there\'s any question, call the emergency vet and describe the symptoms - they can help assess urgency, but based on what you\'ve described, immediate care is needed.',
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
    };
  }
  
  // Check for urgent keywords
  const hasUrgent = URGENT_KEYWORDS.some(keyword => 
    lowerSymptoms.includes(keyword)
  );
  
  if (hasUrgent) {
    return {
      category,
      healthSubcategory,
      symptoms,
      images,
      video,
      riskLevel: 'Urgent',
      summary: 'Your pet\'s symptoms require veterinary attention within the next 12-24 hours. While not immediately life-threatening, these signs shouldn\'t be ignored.',
      detailedSections: [
        {
          title: 'Symptoms Observed',
          points: [
            'Multiple concerning symptoms present',
            'Symptoms affecting normal daily activities',
            'Potential for condition to worsen without treatment',
            'May indicate underlying health issue requiring diagnosis',
          ],
        },
        {
          title: 'Why Veterinary Care Is Needed',
          points: [
            'Professional diagnosis needed to identify root cause',
            'Early treatment prevents condition from worsening',
            'Some conditions require prescription medications',
            'Diagnostic tests may be necessary (bloodwork, imaging)',
            'Monitoring by a professional ensures proper recovery',
          ],
        },
        {
          title: 'What to Do Before Your Vet Visit',
          points: [
            'Monitor symptoms closely and note any changes',
            'Keep a log of when symptoms occur and their severity',
            'Ensure your pet has access to fresh water',
            'Limit strenuous activity until evaluated',
            'Take photos or videos of symptoms to show the vet',
            'Prepare a list of questions for your veterinarian',
          ],
        },
        {
          title: 'When to Escalate to Emergency',
          points: [
            'If symptoms suddenly worsen or new symptoms appear',
            'If your pet stops eating or drinking completely',
            'If breathing becomes labored or rapid',
            'If your pet becomes unresponsive or extremely lethargic',
            'If you notice blood in vomit, stool, or urine',
          ],
        },
      ],
      immediateActions: [
        '📅 Schedule a veterinary appointment within 24 hours',
        '👀 Monitor symptoms closely for any worsening',
        '💧 Keep your pet hydrated - offer water frequently',
        '📝 Document all symptoms with times and severity',
        '🏠 Keep your pet comfortable and limit stress',
      ],
<<<<<<< HEAD
      reasoning: 'These symptoms indicate a condition that requires professional veterinary attention soon. While not immediately life-threatening, prompt care is recommended to prevent the condition from worsening and to ensure your pet receives appropriate treatment. Early intervention often leads to better outcomes and can prevent more serious complications.' + historyInsight,
=======
      reasoning: 'These symptoms indicate a condition that requires professional veterinary attention soon. While not immediately life-threatening, prompt care is recommended to prevent the condition from worsening and to ensure your pet receives appropriate treatment. Early intervention often leads to better outcomes and can prevent more serious complications.',
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
    };
  }
  
  // Check for monitor keywords
  const hasMonitor = MONITOR_KEYWORDS.some(keyword => 
    lowerSymptoms.includes(keyword)
  );
  
  if (hasMonitor) {
    return {
      category,
      healthSubcategory,
      symptoms,
      images,
      video,
      riskLevel: 'Monitor',
      summary: 'The symptoms you\'ve described suggest a minor issue that may resolve on its own with proper home care. However, continued monitoring is important.',
      detailedSections: [
        {
          title: 'Current Assessment',
          points: [
            'Symptoms appear mild and non-life-threatening',
            'May be related to minor irritation or temporary condition',
            'Often resolves with basic home care and time',
            'No immediate red flags requiring emergency care',
          ],
        },
        {
          title: 'Home Care Recommendations',
          points: [
            'Ensure your pet has access to fresh, clean water at all times',
            'Maintain normal feeding schedule unless symptoms worsen',
            'Provide a quiet, comfortable resting area',
            'Avoid strenuous exercise until symptoms improve',
            'Keep the affected area clean if applicable',
          ],
        },
        {
          title: 'Monitoring Guidelines',
          points: [
            'Observe symptoms for 24-48 hours',
            'Note if symptoms improve, stay the same, or worsen',
            'Watch for any new symptoms developing',
            'Keep a simple log of symptom progression',
            'Take photos if there are visible changes',
          ],
        },
        {
          title: 'When to Seek Veterinary Care',
          points: [
            'If symptoms persist beyond 48 hours without improvement',
            'If symptoms worsen or new symptoms appear',
            'If your pet stops eating or drinking',
            'If behavior changes significantly (lethargy, aggression)',
            'If you notice any signs of pain or distress',
          ],
        },
      ],
      immediateActions: [
        '👁️ Monitor symptoms for 24-48 hours',
        '💧 Ensure access to fresh water',
        '📊 Keep a simple symptom log',
        '🏠 Provide comfortable rest area',
        '📞 Contact vet if symptoms worsen or persist',
      ],
<<<<<<< HEAD
      reasoning: 'Based on the symptoms described, this appears to be a minor issue that may resolve with basic home care and monitoring. However, it\'s important to watch for any changes. If symptoms persist beyond 48 hours, worsen, or if you notice any concerning changes in your pet\'s behavior or condition, please consult with your veterinarian. Trust your instincts - if something feels wrong, it\'s always better to err on the side of caution.' + historyInsight,
=======
      reasoning: 'Based on the symptoms described, this appears to be a minor issue that may resolve with basic home care and monitoring. However, it\'s important to watch for any changes. If symptoms persist beyond 48 hours, worsen, or if you notice any concerning changes in your pet\'s behavior or condition, please consult with your veterinarian. Trust your instincts - if something feels wrong, it\'s always better to err on the side of caution.',
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
    };
  }
  
  // Default to low risk
  return {
    category,
    healthSubcategory,
    symptoms,
    images,
    video,
    riskLevel: 'Low Risk',
    summary: 'Based on the information provided, no immediate concerns were identified. Your pet appears to be in good health, but regular monitoring is always recommended.',
    detailedSections: [
      {
        title: 'Current Status',
        points: [
          'No concerning symptoms detected at this time',
          'Described situation appears within normal range',
          'No immediate health risks identified',
          'Continue with regular care routine',
        ],
      },
      {
        title: 'General Health Maintenance',
        points: [
          'Maintain regular feeding schedule with quality food',
          'Ensure daily exercise appropriate for breed and age',
          'Provide fresh water at all times',
          'Keep up with regular grooming needs',
          'Maintain dental hygiene with appropriate chews or brushing',
        ],
      },
      {
        title: 'Preventive Care',
        points: [
          'Schedule annual veterinary checkups (bi-annual for seniors)',
          'Keep vaccinations up to date',
          'Maintain regular parasite prevention (fleas, ticks, heartworm)',
          'Monitor weight and body condition regularly',
          'Watch for any changes in behavior, appetite, or energy levels',
        ],
      },
      {
        title: 'When to Be Concerned',
        points: [
          'Any sudden changes in behavior or appetite',
          'Vomiting or diarrhea lasting more than 24 hours',
          'Difficulty breathing or excessive panting',
          'Limping or signs of pain',
          'Any unusual lumps or bumps',
          'Changes in drinking or urination habits',
        ],
      },
    ],
    immediateActions: [
      '✅ Continue normal care routine',
      '📅 Maintain regular vet checkup schedule',
      '👀 Monitor for any changes in behavior or health',
      '🍖 Ensure proper nutrition and exercise',
      '💊 Keep preventive medications up to date',
    ],
<<<<<<< HEAD
    reasoning: 'Your pet appears to be doing well based on the information provided. Continue with regular care and monitoring. Remember that you know your pet best - if you notice any changes in behavior, appetite, energy level, or anything that seems unusual, don\'t hesitate to consult with your veterinarian. Regular preventive care and early detection are key to maintaining your pet\'s long-term health and wellbeing.' + historyInsight,
=======
    reasoning: 'Your pet appears to be doing well based on the information provided. Continue with regular care and monitoring. Remember that you know your pet best - if you notice any changes in behavior, appetite, energy level, or anything that seems unusual, don\'t hesitate to consult with your veterinarian. Regular preventive care and early detection are key to maintaining your pet\'s long-term health and wellbeing.',
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
  };
};

export const generateHealthRecommendations = (
  pet: Pet,
  location: string,
  weather: string
): string[] => {
  const recommendations: string[] = [];
  const { breed, age, weight, lifestyle, conditions, allergies } = pet;
  
  // Age-based recommendations
  if (age < 1) {
    recommendations.push('🐕 Puppy stage: Ensure complete vaccination schedule');
    recommendations.push('🎓 Socialization is crucial at this age - expose to various environments');
    recommendations.push('🍖 Feed puppy-specific food 3-4 times daily');
    recommendations.push('🦷 Start dental care early with puppy-safe chew toys');
  } else if (age > 7) {
    recommendations.push('👴 Senior dog: Consider bi-annual vet checkups');
    recommendations.push('🦴 Monitor for joint issues - consider glucosamine supplements');
    recommendations.push('🍽️ Switch to senior dog food with adjusted protein levels');
    recommendations.push('💊 Regular blood work to catch age-related issues early');
  } else {
    recommendations.push('💪 Adult dog: Annual vet checkups recommended');
    recommendations.push('🏃 Maintain regular exercise routine for optimal health');
  }
  
  // Weight-based recommendations
  if (weight) {
    if (weight > 30) {
      recommendations.push('⚖️ Large breed: Watch for hip dysplasia and joint stress');
      recommendations.push('🍖 Feed measured portions to prevent obesity');
    } else if (weight < 10) {
      recommendations.push('🐾 Small breed: Prone to dental issues - regular teeth cleaning');
      recommendations.push('🌡️ More susceptible to temperature changes - monitor closely');
    }
  }
  
  // Lifestyle-based recommendations
  if (lifestyle === 'outdoor') {
    recommendations.push('🌳 Outdoor lifestyle: Regular tick/flea prevention essential');
    recommendations.push('🛡️ Ensure vaccinations are up-to-date for outdoor exposure');
  } else if (lifestyle === 'indoor') {
    recommendations.push('🏠 Indoor lifestyle: Ensure adequate exercise to prevent obesity');
    recommendations.push('🎾 Mental stimulation important - use puzzle toys');
  }
  
  // Condition-based recommendations
  if (conditions && conditions.length > 0) {
    recommendations.push(`⚕️ Managing ${conditions.join(', ')}: Follow vet's treatment plan strictly`);
    recommendations.push('📋 Keep detailed health logs for vet consultations');
  }
  
  // Allergy-based recommendations
  if (allergies && allergies.length > 0) {
    recommendations.push(`⚠️ Known allergies to ${allergies.join(', ')}: Avoid these triggers`);
    recommendations.push('🔍 Read food labels carefully to prevent allergic reactions');
  }
  
  // Weather-based recommendations
  if (weather.toLowerCase().includes('hot') || weather.toLowerCase().includes('summer')) {
    recommendations.push('☀️ Hot weather: Ensure adequate hydration and shade');
    recommendations.push('🚫 Avoid walks during peak heat hours (11 AM - 4 PM)');
    recommendations.push('💧 Provide multiple water bowls around the house');
    if (breed.toLowerCase().includes('pug') || breed.toLowerCase().includes('bulldog')) {
      recommendations.push('🌡️ Brachycephalic breed: Extra caution in heat - risk of heatstroke');
    }
  } else if (weather.toLowerCase().includes('cold') || weather.toLowerCase().includes('winter')) {
    recommendations.push('❄️ Cold weather: Consider a sweater for short-haired breeds');
    recommendations.push('🐾 Protect paws from cold surfaces and ice');
    recommendations.push('🏠 Provide warm bedding away from drafts');
  } else if (weather.toLowerCase().includes('rain') || weather.toLowerCase().includes('monsoon')) {
    recommendations.push('🌧️ Monsoon season: Use tick and flea prevention');
    recommendations.push('🛁 Dry your pet thoroughly after walks');
    recommendations.push('🦠 Watch for skin infections due to humidity');
  }
  
  // Location-based recommendations
  if (location.toLowerCase().includes('mumbai') || location.toLowerCase().includes('chennai') || location.toLowerCase().includes('coastal')) {
    recommendations.push('🌊 Coastal climate: Watch for skin infections due to humidity');
    recommendations.push('🧴 Regular grooming to prevent fungal issues');
  } else if (location.toLowerCase().includes('delhi') || location.toLowerCase().includes('north')) {
    recommendations.push('🌡️ Extreme temperatures: Adjust care for seasonal changes');
    recommendations.push('💨 Air quality concerns: Limit outdoor time on high pollution days');
  } else if (location.toLowerCase().includes('bangalore') || location.toLowerCase().includes('pune')) {
    recommendations.push('🌤️ Moderate climate: Ideal for most breeds');
    recommendations.push('🏞️ Take advantage of pleasant weather for outdoor activities');
  }
  
  // Breed-specific recommendations
  const breedLower = breed.toLowerCase();
  if (breedLower.includes('labrador') || breedLower.includes('golden retriever')) {
    recommendations.push('🦴 Prone to hip dysplasia - maintain healthy weight');
    recommendations.push('🏊 Loves water - swimming is excellent low-impact exercise');
  } else if (breedLower.includes('german shepherd')) {
    recommendations.push('🦴 Monitor for hip and elbow dysplasia');
    recommendations.push('🧠 Highly intelligent - needs mental stimulation');
  } else if (breedLower.includes('pug') || breedLower.includes('bulldog')) {
    recommendations.push('😮 Brachycephalic breed - monitor breathing carefully');
    recommendations.push('🧼 Keep facial wrinkles clean and dry daily');
  } else if (breedLower.includes('indian pariah') || breedLower.includes('indie')) {
    recommendations.push('💪 Hardy breed with few genetic issues');
    recommendations.push('🌡️ Excellent heat tolerance - well-adapted to Indian climate');
  } else if (breedLower.includes('beagle')) {
    recommendations.push('👃 Strong scent drive - secure fencing important');
    recommendations.push('👂 Floppy ears - regular ear cleaning to prevent infections');
  }
  
  return recommendations;
};