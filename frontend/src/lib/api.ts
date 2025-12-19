/**
 * API utility functions for backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ApiError {
  detail: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('pet_health_token');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          detail: `HTTP error! status: ${response.status}`,
        }));
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);

// Auth API functions
export interface SignupData {
  email: string;
  name: string;
  termsAccepted: boolean;
  ageConfirmed: boolean;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    contactNumber?: string;
    emergencyContact?: string;
    address?: {
      street?: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    location: {
      address: string;
      latitude: number;
      longitude: number;
    } | null;
    termsAccepted: boolean;
    ageConfirmed: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

// Helper function to convert backend location to frontend format
export const convertLocation = (backendLocation: { address: string; latitude: number; longitude: number } | null) => {
  if (!backendLocation) return null;
  
  // Parse city and state from address (simple implementation)
  const addressParts = backendLocation.address.split(',').map(s => s.trim());
  const city = addressParts[0] || '';
  const state = addressParts[addressParts.length - 1] || '';
  
  return {
    latitude: backendLocation.latitude,
    longitude: backendLocation.longitude,
    city,
    state,
  };
};

export interface LoginData {
  email: string;
}

export const authApi = {
  signup: (data: SignupData) =>
    api.post<AuthResponse>('/api/v1/auth/signup', data),

  login: (data: LoginData) =>
    api.post<AuthResponse>('/api/v1/auth/login', data),

  logout: () =>
    api.post<{ message: string }>('/api/v1/auth/logout'),

  getCurrentUser: () =>
    api.get<AuthResponse['user']>('/api/v1/auth/me'),

  updateProfile: (data: {
    name?: string;
    contactNumber?: string;
    emergencyContact?: string;
    address?: {
      street?: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    location?: { address: string; latitude: number; longitude: number };
  }) => {
    // Convert camelCase to snake_case for backend
    const backendData: any = {};
    if (data.name !== undefined) backendData.name = data.name;
    if (data.contactNumber !== undefined) backendData.contact_number = data.contactNumber;
    if (data.emergencyContact !== undefined) backendData.emergency_contact = data.emergencyContact;
    if (data.address !== undefined) backendData.address = data.address;
    if (data.location !== undefined) backendData.location = data.location;
    
    console.log('Frontend sending to backend:', backendData);
    
    return api.patch<AuthResponse['user']>('/api/v1/auth/me', backendData);
  },
};

// Pet API functions
export interface PetData {
  name: string;
  breed: string;
  age: number;
  gender: 'male' | 'female';
  weight?: number;
  lifestyle?: 'indoor' | 'outdoor' | 'mixed';
  photo?: string;
  conditions?: string[];
  allergies?: string[];
}

export interface PetResponse {
  id: string;
  userId: string;
  name: string;
  breed: string;
  age: number;
  gender: 'male' | 'female';
  weight?: number;
  lifestyle?: 'indoor' | 'outdoor' | 'mixed';
  photo?: string;
  conditions: string[];
  allergies: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MedicalHistoryData {
  type: 'vaccination' | 'checkup' | 'illness' | 'surgery' | 'other';
  date: string;
  description: string;
  photos?: string[];
  notes?: string;
}

export interface MedicalHistoryResponse {
  id: string;
  petId: string;
  type: 'vaccination' | 'checkup' | 'illness' | 'surgery' | 'other';
  date: string;
  description: string;
  photos: string[];
  notes?: string;
  createdAt: string;
}

export const petApi = {
  // Create a new pet
  createPet: (data: PetData) => {
    console.log('API Layer - Received pet data:', data);
    console.log('API Layer - Sending to backend:', data);
    return api.post<PetResponse>('/api/v1/pets/', data);
  },

  // Get all pets for current user
  getAllPets: () =>
    api.get<PetResponse[]>('/api/v1/pets/'),

  // Get specific pet
  getPet: (petId: string) =>
    api.get<PetResponse>(`/api/v1/pets/${petId}`),

  // Update pet
  updatePet: (petId: string, data: Partial<PetData>) => {
    console.log('=== API LAYER - petApi.updatePet ===');
    console.log('Pet ID:', petId);
    console.log('Data received from PetContext:', data);
    console.log('Gender in data:', data.gender);
    console.log('Sending PATCH request to:', `/api/v1/pets/${petId}`);
    console.log('Request body:', JSON.stringify(data, null, 2));
    console.log('====================================');
    return api.patch<PetResponse>(`/api/v1/pets/${petId}`, data);
  },

  // Delete pet
  deletePet: (petId: string) =>
    api.delete<{ message: string }>(`/api/v1/pets/${petId}`),

  // Add medical history
  addMedicalHistory: (petId: string, data: MedicalHistoryData) =>
    api.post<MedicalHistoryResponse>(`/api/v1/pets/${petId}/medical-history`, data),

  // Get medical history
  getMedicalHistory: (petId: string) =>
    api.get<MedicalHistoryResponse[]>(`/api/v1/pets/${petId}/medical-history`),
};

// Symptom Check API functions
export interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: string;
  image?: string;
  options?: Array<{ label: string; value: string; icon?: string }>;
}

export interface SymptomCheckResponse {
  id: string;
  userId?: string;
  petId?: string;
  category: string;
  healthSubcategory?: string;
  symptoms: string;
  riskLevel: string;
  summary: string;
  detailedSections: Array<{
    title: string;
    points: string[];
  }>;
  immediateActions: string[];
  reasoning: string;
  messages?: ChatMessage[];
  feedback?: 'up' | 'down';
  feedbackReason?: string;
  timestamp: string;
  disclaimer: string;
  resolved?: boolean;
  resolvedAt?: string;
}

export interface SymptomCheckCreate {
  petId?: string;
  category: string;
  healthSubcategory?: string;
  symptoms: string;
  images?: string[];
  video?: string;
}

export const symptomCheckApi = {
  // Submit symptom check for analysis
  submitSymptomCheck: (data: SymptomCheckCreate) => {
    console.log('=== FRONTEND API - submitSymptomCheck ===');
    console.log('Data being sent to backend:', data);
    console.log('API URL:', `${API_BASE_URL}/api/v1/symptom-checks`);
    console.log('=========================================');
    return api.post<SymptomCheckResponse>('/api/v1/symptom-checks', data);
  },

  // Get all symptom checks for current user
  getAllSymptomChecks: () =>
    api.get<SymptomCheckResponse[]>('/api/v1/symptom-checks'),

  // Get symptom checks for a specific pet
  getPetSymptomChecks: (petId: string) =>
    api.get<SymptomCheckResponse[]>(`/api/v1/symptom-checks/pet/${petId}`),

  // Get specific symptom check
  getSymptomCheck: (checkId: string) =>
    api.get<SymptomCheckResponse>(`/api/v1/symptom-checks/${checkId}`),

  // Update chat messages for a symptom check
  updateChatMessages: (checkId: string, messages: ChatMessage[]) =>
    api.patch<{ message: string }>(`/api/v1/symptom-checks/${checkId}/messages`, messages),

  // Submit feedback on symptom check
  submitFeedback: (checkId: string, feedback: 'up' | 'down', feedbackReason?: string) =>
    api.post<{ message: string }>(`/api/v1/symptom-checks/${checkId}/feedback`, {
      feedback,
      feedbackReason,
    }),

  // Delete symptom check
  deleteSymptomCheck: (checkId: string) =>
    api.delete<{ message: string }>(`/api/v1/symptom-checks/${checkId}`),
};

// Provider API functions
export interface ProviderResponse {
  id: string;
  name: string;
  type: 'veterinary_clinic' | 'emergency_clinic' | 'specialist' | 'pharmacy';
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email?: string;
  website?: string;
  latitude: number;
  longitude: number;
  distance?: number;
  rating?: number;
  reviewCount?: number;
  services: string[];
  hours: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  emergencyServices: boolean;
  is24Hours: boolean;
}

export const providerApi = {
  // Search providers near user location
  searchProviders: (params: {
    latitude: number;
    longitude: number;
    radius?: number;
    type?: string;
    emergencyOnly?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    queryParams.append('latitude', params.latitude.toString());
    queryParams.append('longitude', params.longitude.toString());
    if (params.radius) queryParams.append('radius', params.radius.toString());
    if (params.type) queryParams.append('type', params.type);
    if (params.emergencyOnly) queryParams.append('emergency_only', 'true');
    
    return api.get<ProviderResponse[]>(`/api/v1/providers/search?${queryParams.toString()}`);
  },

  // Get provider by ID
  getProvider: (providerId: string) =>
    api.get<ProviderResponse>(`/api/v1/providers/${providerId}`),
};

// Recommendations API functions
export interface VetRecommendation {
  name: string;
  address: string;
  phone: string;
  services: string[];
  specialties: string[];
  hours: string;
  emergency: boolean;
  rating: number;
  notes: string;
  distance?: string;
}

export interface VetRecommendationsResponse {
  pincode: string;
  limit: number;
  count: number;
  clinics: VetRecommendation[];
  source: string;
  disclaimer: string;
}

export const recommendationsApi = {
  // Get AI-powered vet recommendations by pin code
  getVetsByPincode: (pincode: string, limit: number = 10) => {
    const queryParams = new URLSearchParams();
    queryParams.append('pincode', pincode);
    queryParams.append('limit', limit.toString());
    return api.get<VetRecommendationsResponse>(`/api/v1/recommendations/vets/by-pincode?${queryParams.toString()}`);
  },
  
  // Get AI-powered vet recommendations by city name
  getVetsByCity: (city: string, limit: number = 10) => {
    const queryParams = new URLSearchParams();
    queryParams.append('city', city);
    queryParams.append('limit', limit.toString());
    return api.get<VetRecommendationsResponse>(`/api/v1/recommendations/vets/by-city?${queryParams.toString()}`);
  },
  
  // Ask questions about veterinary clinics using Gemini AI
  askAboutVets: (question: string, pincode: string, clinicsContext: string) => {
    const queryParams = new URLSearchParams();
    queryParams.append('question', question);
    queryParams.append('pincode', pincode);
    queryParams.append('clinics_context', clinicsContext);
    return api.post<{ question: string; answer: string; pincode: string; source: string }>(
      `/api/v1/recommendations/vets/ask?${queryParams.toString()}`,
      {}
    );
  },
  
  // Ask follow-up questions in symptom checker using Gemini AI
  askSymptomFollowup: (question: string, conversationContext: string) => {
    const queryParams = new URLSearchParams();
    queryParams.append('question', question);
    queryParams.append('conversation_context', conversationContext);
    return api.post<{ question: string; answer: string; source: string }>(
      `/api/v1/recommendations/symptom-followup?${queryParams.toString()}`,
      {}
    );
  },
  
  // Generate AI-powered pet health summary
  generatePetSummary: (petId: string) => {
    return api.post<{
      petId: string;
      petName: string;
      summary: string;
      generatedAt: string;
      historyPeriod: string;
      checksAnalyzed: number;
      source: string;
      cached: boolean;
    }>(`/api/v1/recommendations/pet-summary/${petId}`, {});
  },
  
  // Get pet health summary history
  getPetSummaryHistory: (petId: string) => {
    return api.get<{
      petId: string;
      petName: string;
      count: number;
      summaries: Array<{
        id: string;
        petId: string;
        petName: string;
        summary: string;
        generatedAt: string;
        historyPeriod: string;
        checksAnalyzed: number;
        hasLocationData: boolean;
        season: string;
        createdAt: string;
      }>;
    }>(`/api/v1/recommendations/pet-summary-history/${petId}`);
  },
  
  // Delete a pet health summary from history
  deletePetSummary: (summaryId: string) => {
    return api.delete<{
      message: string;
      summaryId: string;
      petId: string;
    }>(`/api/v1/recommendations/pet-summary-history/${summaryId}`);
  },
};