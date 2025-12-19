import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, Plus, X, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { usePets } from '@/contexts/PetContext';
import { DOG_BREEDS } from '@/data/mockData';
import { toast } from 'sonner';

// Top 50 common medical conditions in dogs
const DOG_MEDICAL_CONDITIONS = [
  'Allergies',
  'Arthritis',
  'Hip Dysplasia',
  'Elbow Dysplasia',
  'Diabetes',
  'Obesity',
  'Dental Disease',
  'Ear Infections',
  'Skin Infections',
  'Hot Spots',
  'Hypothyroidism',
  'Hyperthyroidism',
  'Cancer',
  'Lymphoma',
  'Mast Cell Tumors',
  'Heart Disease',
  'Congestive Heart Failure',
  'Mitral Valve Disease',
  'Kidney Disease',
  'Chronic Kidney Disease',
  'Liver Disease',
  'Pancreatitis',
  'Inflammatory Bowel Disease',
  'Gastritis',
  'Bloat (GDV)',
  'Epilepsy',
  'Seizures',
  'Cataracts',
  'Glaucoma',
  'Cherry Eye',
  'Progressive Retinal Atrophy',
  'Patellar Luxation',
  'Cruciate Ligament Injury',
  'Intervertebral Disc Disease',
  'Degenerative Myelopathy',
  'Cushing\'s Disease',
  'Addison\'s Disease',
  'Urinary Tract Infections',
  'Bladder Stones',
  'Kennel Cough',
  'Pneumonia',
  'Bronchitis',
  'Collapsing Trachea',
  'Mange',
  'Ringworm',
  'Lyme Disease',
  'Heartworm',
  'Intestinal Parasites',
  'Anxiety',
  'Separation Anxiety',
];

// Top 50 common dog allergies
const DOG_ALLERGIES = [
  'Chicken',
  'Beef',
  'Dairy Products',
  'Wheat',
  'Egg',
  'Soy',
  'Corn',
  'Lamb',
  'Pork',
  'Fish',
  'Rabbit',
  'Rice',
  'Barley',
  'Oats',
  'Peanuts',
  'Tree Nuts',
  'Shellfish',
  'Yeast',
  'Artificial Preservatives',
  'Artificial Colors',
  'Dust Mites',
  'Pollen',
  'Grass',
  'Mold Spores',
  'Ragweed',
  'Tree Pollen',
  'Flea Saliva',
  'Flea Bites',
  'Mosquito Bites',
  'Wool',
  'Cotton',
  'Synthetic Fabrics',
  'Latex',
  'Rubber',
  'Plastic',
  'Perfumes',
  'Cleaning Products',
  'Cigarette Smoke',
  'Feathers',
  'Dander (Other Animals)',
  'Cat Dander',
  'Medications (Antibiotics)',
  'Medications (NSAIDs)',
  'Topical Medications',
  'Shampoos',
  'Conditioners',
  'Flea/Tick Treatments',
  'Vaccines',
  'Anesthesia',
  'Environmental Chemicals',
];

const EditPetProfile: React.FC = () => {
  const navigate = useNavigate();
  const { petId } = useParams<{ petId: string }>();
  const { pets, updatePet, isLoading } = usePets();
  
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    gender: '' as 'male' | 'female' | '',
    weight: '',
    lifestyle: '' as 'indoor' | 'outdoor' | 'mixed' | '',
    photo: '',
  });
  
  const [conditions, setConditions] = useState<string[]>([]);
  const [isConditionsOpen, setIsConditionsOpen] = useState(false);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [isAllergiesOpen, setIsAllergiesOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load pet data
  useEffect(() => {
    if (petId) {
      const pet = pets.find(p => p.id === petId);
      if (pet) {
        setFormData({
          name: pet.name,
          breed: pet.breed,
          age: pet.age.toString(),
          gender: pet.gender || '',
          weight: pet.weight?.toString() || '',
          lifestyle: pet.lifestyle || '',
          photo: pet.photo || '',
        });
        setConditions(pet.conditions || []);
        setAllergies(pet.allergies || []);
      } else {
        toast.error('Pet not found');
        navigate('/pet-profile');
      }
    }
  }, [petId, pets, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Pet name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.breed) {
      newErrors.breed = 'Breed selection is required';
    }
    
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else {
      const ageNum = parseFloat(formData.age);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 30) {
        newErrors.age = 'Age must be between 0 and 30 years';
      }
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    
    if (formData.weight) {
      const weightNum = parseFloat(formData.weight);
      if (isNaN(weightNum) || weightNum <= 0 || weightNum > 150) {
        newErrors.weight = 'Weight must be between 0 and 150 kg';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, photo: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCondition = (condition: string) => {
    setConditions(prev =>
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  const toggleAllergy = (allergy: string) => {
    setAllergies(prev =>
      prev.includes(allergy)
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (!petId) {
      toast.error('Pet ID not found');
      return;
    }

    try {
      // Only include gender if it's actually set to a valid value
      const updateData: any = {
        name: formData.name.trim(),
        breed: formData.breed,
        age: parseFloat(formData.age),
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        lifestyle: formData.lifestyle || undefined,
        photo: formData.photo || undefined,
        conditions: conditions.length > 0 ? conditions : undefined,
        allergies: allergies.length > 0 ? allergies : undefined,
      };
      
      // Only add gender if it's a valid value (not empty string)
      if (formData.gender && (formData.gender === 'male' || formData.gender === 'female')) {
        updateData.gender = formData.gender;
      }
      
      console.log('=== EDIT PET PROFILE - SAVE CHANGES CLICKED ===');
      console.log('Pet ID:', petId);
      console.log('Form Data State:', formData);
      console.log('Form Data Gender:', formData.gender);
      console.log('Update Data being sent to PetContext:', updateData);
      console.log('Gender value in updateData:', updateData.gender);
      console.log('Gender type:', typeof updateData.gender);
      console.log('===============================================');
      
      await updatePet(petId, updateData);
      
      toast.success('Pet profile updated successfully!');
      navigate('/pet-profile');
    } catch (error) {
      console.error('Error updating pet:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update pet profile');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/pet-profile')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Edit Pet Profile</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Update Pet Information</CardTitle>
            <CardDescription>
              Edit your pet's details. Fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload */}
              <div className="flex justify-center">
                <div className="relative">
                  {formData.photo ? (
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[#FF385C]">
                      <img src={formData.photo} alt="Pet" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, photo: '' }))}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF385C] transition-colors">
                      <Camera className="w-8 h-8 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500">Add Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Pet Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Max, Bella"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              {/* Breed */}
              <div className="space-y-2">
                <Label htmlFor="breed">Breed *</Label>
                <Select
                  value={formData.breed}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, breed: value }))}
                >
                  <SelectTrigger className={errors.breed ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select breed" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOG_BREEDS.map((breed) => (
                      <SelectItem key={breed} value={breed}>
                        {breed}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.breed && <p className="text-sm text-red-500">{errors.breed}</p>}
              </div>

              {/* Age and Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age (years) *</Label>
                  <Input
                    id="age"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 3.5"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    className={errors.age ? 'border-red-500' : ''}
                  />
                  {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Gender *</Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value as 'male' | 'female' }))}
                    className={errors.gender ? 'border border-red-500 rounded-md p-2' : ''}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="edit-male" />
                      <Label htmlFor="edit-male" className="cursor-pointer font-normal">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="edit-female" />
                      <Label htmlFor="edit-female" className="cursor-pointer font-normal">Female</Label>
                    </div>
                  </RadioGroup>
                  {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
                </div>
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg) - Optional</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 25.5"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  className={errors.weight ? 'border-red-500' : ''}
                />
                {errors.weight && <p className="text-sm text-red-500">{errors.weight}</p>}
              </div>

              {/* Lifestyle */}
              <div className="space-y-2">
                <Label htmlFor="lifestyle">Lifestyle - Optional</Label>
                <Select
                  value={formData.lifestyle}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, lifestyle: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lifestyle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indoor">Indoor</SelectItem>
                    <SelectItem value="outdoor">Outdoor</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Medical Conditions */}
              <div className="space-y-2">
                <Label>Medical Conditions - Optional</Label>
                <Collapsible open={isConditionsOpen} onOpenChange={setIsConditionsOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span className="text-sm">
                        {conditions.length > 0
                          ? `${conditions.length} condition${conditions.length > 1 ? 's' : ''} selected`
                          : 'Select medical conditions'}
                      </span>
                      {isConditionsOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <ScrollArea className="h-64 w-full rounded-md border p-4">
                      <div className="grid grid-cols-1 gap-3">
                        {DOG_MEDICAL_CONDITIONS.map((condition) => (
                          <div key={condition} className="flex items-center space-x-2">
                            <Checkbox
                              id={`condition-${condition}`}
                              checked={conditions.includes(condition)}
                              onCheckedChange={() => toggleCondition(condition)}
                            />
                            <label
                              htmlFor={`condition-${condition}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {condition}
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CollapsibleContent>
                </Collapsible>
                {conditions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <p className="text-sm text-gray-600 w-full">Selected:</p>
                    {conditions.map((condition) => (
                      <Badge key={condition} variant="secondary" className="gap-1">
                        {condition}
                        <button
                          type="button"
                          onClick={() => toggleCondition(condition)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Allergies */}
              <div className="space-y-2">
                <Label>Known Allergies - Optional</Label>
                <Collapsible open={isAllergiesOpen} onOpenChange={setIsAllergiesOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span className="text-sm">
                        {allergies.length > 0
                          ? `${allergies.length} allerg${allergies.length > 1 ? 'ies' : 'y'} selected`
                          : 'Select known allergies'}
                      </span>
                      {isAllergiesOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <ScrollArea className="h-64 w-full rounded-md border p-4">
                      <div className="grid grid-cols-1 gap-3">
                        {DOG_ALLERGIES.map((allergy) => (
                          <div key={allergy} className="flex items-center space-x-2">
                            <Checkbox
                              id={`allergy-${allergy}`}
                              checked={allergies.includes(allergy)}
                              onCheckedChange={() => toggleAllergy(allergy)}
                            />
                            <label
                              htmlFor={`allergy-${allergy}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {allergy}
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CollapsibleContent>
                </Collapsible>
                {allergies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <p className="text-sm text-gray-600 w-full">Selected:</p>
                    {allergies.map((allergy) => (
                      <Badge key={allergy} variant="destructive" className="gap-1">
                        {allergy}
                        <button
                          type="button"
                          onClick={() => toggleAllergy(allergy)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/pet-profile')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#FF385C] hover:bg-[#E31C5F]"
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditPetProfile;