export interface Address {
  street?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  contactNumber?: string;
  emergencyContact?: string;
  address?: Address;
  location: {
    latitude: number;
    longitude: number;
    city: string;
    state: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  termsAccepted: boolean;
  ageConfirmed: boolean;
}

export interface Pet {
  id: string;
  userId: string;
  name: string;
  breed: string;
  age: number; // in years
  gender: 'male' | 'female';
  weight?: number; // in kg
  photo?: string;
  lifestyle?: 'indoor' | 'outdoor' | 'mixed';
  conditions?: string[]; // Medical conditions
  allergies?: string[]; // Known allergies
  createdAt: string;
}

export interface MedicalHistoryEntry {
  id: string;
  petId: string;
  type: 'vaccination' | 'illness' | 'surgery' | 'checkup' | 'other';
  date: string;
  description: string;
  photos: string[];
  notes?: string;
}

export type SymptomCategory = 'Nutrition' | 'Exercise' | 'Grooming' | 'Health' | 'Seasonal';

export type HealthSubcategory = 
  | 'Digestive Issues'
  | 'Skin & Coat'
  | 'Respiratory'
  | 'Behavioral'
  | 'Eyes & Ears'
  | 'Dental'
  | 'Musculoskeletal'
  | 'Urinary'
  | 'Emergency';

export interface DetailedRecommendation {
  title: string;
  points: string[];
}

export interface SymptomCheck {
  id: string;
  petId: string;
  userId: string;
  timestamp: string;
  category: SymptomCategory;
  healthSubcategory?: HealthSubcategory;
  symptoms: string;
  images: string[];
  video?: string;
  riskLevel: 'Emergency' | 'Urgent' | 'Monitor' | 'Low Risk';
  summary: string;
  detailedSections: DetailedRecommendation[];
  immediateActions: string[];
  reasoning: string;
  feedback?: 'up' | 'down';
  feedbackReason?: string;
}

export interface VetProvider {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  operatingHours: string;
  rating: number;
  is24x7: boolean;
  distance?: number; // in km
}

export interface HealthAlert {
  id: string;
  type: 'seasonal' | 'breed-specific' | 'weather';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  relevantBreeds?: string[];
  relevantSeasons?: string[];
}