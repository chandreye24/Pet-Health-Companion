import React, { createContext, useContext, useState, useEffect } from 'react';
import { Pet, MedicalHistoryEntry } from '@/types';
import { useAuth } from './AuthContext';
import { petApi, PetResponse, MedicalHistoryResponse } from '@/lib/api';
import { toast } from 'sonner';

interface PetContextType {
  pets: Pet[];
  selectedPet: Pet | null;
  medicalHistory: Record<string, MedicalHistoryEntry[]>;
  addPet: (pet: Omit<Pet, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updatePet: (id: string, updates: Partial<Pet>) => Promise<void>;
  deletePet: (id: string) => Promise<void>;
  selectPet: (id: string) => void;
  addMedicalHistory: (petId: string, entry: Omit<MedicalHistoryEntry, 'id' | 'petId'>) => Promise<void>;
  getMedicalHistory: (petId: string) => MedicalHistoryEntry[];
  loadPets: () => Promise<void>;
  isLoading: boolean;
}

const PetContext = createContext<PetContextType | undefined>(undefined);

// Helper function to convert API response to Pet type
const convertPetResponse = (response: PetResponse): Pet => ({
  id: response.id,
  userId: response.userId,
  name: response.name,
  breed: response.breed,
  age: response.age,
  gender: response.gender,
  weight: response.weight,
  lifestyle: response.lifestyle,
  photo: response.photo,
  conditions: response.conditions,
  allergies: response.allergies,
  createdAt: response.createdAt,
});

// Helper function to convert medical history response
const convertMedicalHistoryResponse = (response: MedicalHistoryResponse): MedicalHistoryEntry => ({
  id: response.id,
  petId: response.petId,
  type: response.type,
  date: response.date,
  description: response.description,
  photos: response.photos,
  notes: response.notes,
});

export const PetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<Record<string, MedicalHistoryEntry[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load pets from API when user logs in
  const loadPets = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await petApi.getAllPets();
      const loadedPets = response.map(convertPetResponse);
      setPets(loadedPets);
      
      if (loadedPets.length > 0 && !selectedPet) {
        setSelectedPet(loadedPets[0]);
      }
    } catch (error) {
      console.error('Failed to load pets:', error);
      toast.error('Failed to load pet profiles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadPets();
    } else {
      setPets([]);
      setSelectedPet(null);
      setMedicalHistory({});
    }
  }, [user]);

  const addPet = async (petData: Omit<Pet, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) {
      throw new Error('User must be logged in to add a pet');
    }
    
    if (pets.length >= 10) {
      throw new Error('Maximum 10 pet profiles allowed');
    }

    try {
      const petPayload = {
        name: petData.name,
        breed: petData.breed,
        age: petData.age,
        gender: petData.gender,
        weight: petData.weight,
        lifestyle: petData.lifestyle,
        photo: petData.photo,
        conditions: petData.conditions,
        allergies: petData.allergies,
      };
      
      console.log('PetContext - Sending pet data to API:', petPayload);
      
      const response = await petApi.createPet(petPayload);

      const newPet = convertPetResponse(response);
      const updatedPets = [...pets, newPet];
      setPets(updatedPets);
      
      if (!selectedPet) {
        setSelectedPet(newPet);
      }
    } catch (error) {
      console.error('Failed to add pet:', error);
      throw error;
    }
  };

  const updatePet = async (id: string, updates: Partial<Pet>) => {
    try {
      // Filter out undefined values to only send fields that are actually being updated
      const apiPayload: any = {};
      if (updates.name !== undefined) apiPayload.name = updates.name;
      if (updates.breed !== undefined) apiPayload.breed = updates.breed;
      if (updates.age !== undefined) apiPayload.age = updates.age;
      if (updates.gender !== undefined) apiPayload.gender = updates.gender;
      if (updates.weight !== undefined) apiPayload.weight = updates.weight;
      if (updates.lifestyle !== undefined) apiPayload.lifestyle = updates.lifestyle;
      if (updates.photo !== undefined) apiPayload.photo = updates.photo;
      if (updates.conditions !== undefined) apiPayload.conditions = updates.conditions;
      if (updates.allergies !== undefined) apiPayload.allergies = updates.allergies;
      
      console.log('=== PET CONTEXT - updatePet ===');
      console.log('Received updates from EditPetProfile:', updates);
      console.log('API Payload being sent to petApi.updatePet:', apiPayload);
      console.log('Gender in payload:', apiPayload.gender);
      console.log('===============================');
      
      const response = await petApi.updatePet(id, apiPayload);
      
      console.log('=== PET CONTEXT - Response from API ===');
      console.log('Response:', response);
      console.log('Gender in response:', response.gender);
      console.log('========================================');

      const updatedPet = convertPetResponse(response);
      const updatedPets = pets.map(pet =>
        pet.id === id ? updatedPet : pet
      );
      setPets(updatedPets);
      
      if (selectedPet?.id === id) {
        setSelectedPet(updatedPet);
      }
    } catch (error) {
      console.error('Failed to update pet:', error);
      toast.error('Failed to update pet profile');
      throw error;
    }
  };

  const deletePet = async (id: string) => {
    try {
      await petApi.deletePet(id);
      
      const updatedPets = pets.filter(pet => pet.id !== id);
      setPets(updatedPets);
      
      if (selectedPet?.id === id) {
        setSelectedPet(updatedPets[0] || null);
      }

      // Remove medical history for deleted pet
      const updatedHistory = { ...medicalHistory };
      delete updatedHistory[id];
      setMedicalHistory(updatedHistory);
    } catch (error) {
      console.error('Failed to delete pet:', error);
      toast.error('Failed to delete pet profile');
      throw error;
    }
  };

  const selectPet = (id: string) => {
    const pet = pets.find(p => p.id === id);
    if (pet) {
      setSelectedPet(pet);
    }
  };

  const addMedicalHistory = async (petId: string, entry: Omit<MedicalHistoryEntry, 'id' | 'petId'>) => {
    try {
      const response = await petApi.addMedicalHistory(petId, {
        type: entry.type,
        date: entry.date,
        description: entry.description,
        photos: entry.photos,
        notes: entry.notes,
      });

      const newEntry = convertMedicalHistoryResponse(response);

      const updatedHistory = {
        ...medicalHistory,
        [petId]: [...(medicalHistory[petId] || []), newEntry],
      };
      
      setMedicalHistory(updatedHistory);
    } catch (error) {
      console.error('Failed to add medical history:', error);
      toast.error('Failed to add medical history');
      throw error;
    }
  };

  const getMedicalHistory = (petId: string): MedicalHistoryEntry[] => {
    return medicalHistory[petId] || [];
  };

  return (
    <PetContext.Provider
      value={{
        pets,
        selectedPet,
        medicalHistory,
        addPet,
        updatePet,
        deletePet,
        selectPet,
        addMedicalHistory,
        getMedicalHistory,
        loadPets,
        isLoading,
      }}
    >
      {children}
    </PetContext.Provider>
  );
};

export const usePets = () => {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error('usePets must be used within PetProvider');
  }
  return context;
};