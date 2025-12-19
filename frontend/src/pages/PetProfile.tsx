import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Camera, Plus, X, PawPrint, Edit, Trash2, Stethoscope, LogOut, User, Home, UserCircle, ChevronDown, ChevronUp, Clock, AlertCircle, CheckCircle, Info, History, Sparkles, MapPin, Download, Check } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePets } from '@/contexts/PetContext';
import { useAuth } from '@/contexts/AuthContext';
import { DOG_BREEDS } from '@/data/mockData';
import { toast } from 'sonner';
import { Pet } from '@/types';
import { symptomCheckApi, recommendationsApi, api, type SymptomCheckResponse } from '@/lib/api';
import { ChatHistoryViewer } from '@/components/ChatHistoryViewer';

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

const PetProfile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { addPet, pets, deletePet, isLoading } = usePets();

  // Helper function to generate personalized recommendations as a caring note
  const generateRecommendations = (pet: Pet): string => {
    const currentMonth = new Date().getMonth(); // 0-11
    const currentYear = new Date().getFullYear();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const isWinter = currentMonth >= 11 || currentMonth <= 1;
    const isSummer = currentMonth >= 3 && currentMonth <= 5;
    const isMonsoon = currentMonth >= 6 && currentMonth <= 9;
    
    const pronoun = pet.gender === 'female' ? 'she' : 'he';
    const possessive = pet.gender === 'female' ? 'her' : 'his';
    
    // Get season name
    let season = 'winter';
    if (isSummer) season = 'summer';
    else if (isMonsoon) season = 'monsoon';
    else if (!isWinter) season = 'spring';

    // Build key features list
    const keyFeatures: string[] = [];
    
    // Age feature
    if (pet.age < 1) {
      keyFeatures.push('a growing puppy');
    } else if (pet.age >= 7) {
      keyFeatures.push(`a ${pet.age}-year-old senior ${pet.breed}`);
    } else {
      keyFeatures.push(`a ${pet.age}-year-old ${pet.breed}`);
    }

    // Medical conditions feature
    if (pet.conditions && pet.conditions.length > 0) {
      const hasAllergies = pet.conditions.some(c => c.toLowerCase().includes('allerg'));
      const hasSkin = pet.conditions.some(c => c.toLowerCase().includes('skin'));
      const hasJoint = pet.conditions.some(c => c.toLowerCase().includes('arthritis') || c.toLowerCase().includes('joint'));
      
      if (hasAllergies || hasSkin) {
        keyFeatures.push('skin sensitivities');
      }
      if (hasJoint) {
        keyFeatures.push('joint issues');
      }
    }

    // Build narrative
    const narrative: string[] = [];
    
    // Opening
    narrative.push(`Considering ${pet.name} is ${keyFeatures.join(' with ')}, and because the current climate is ${season} (${monthNames[currentMonth]} ${currentYear}), you should take care of ${possessive} health by:`);

    // Age-based care
    if (pet.age < 1) {
      narrative.push(`Since ${pronoun}'s still growing, ensure ${pronoun} gets ${possessive} ***complete vaccination schedule*** and ***deworming every 2-3 months***. Feed ${possessive} ***high-quality puppy food 3-4 times daily*** for proper development.`);
    } else if (pet.age >= 7) {
      narrative.push(`As a senior dog, schedule ***bi-annual vet checkups*** to monitor ${possessive} health. Consider ***joint supplements*** to support ${possessive} mobility and comfort as ${pronoun} ages.`);
    }

    // Breed-specific care
    if (pet.breed.toLowerCase().includes('retriever') || pet.breed.toLowerCase().includes('labrador')) {
      narrative.push(`Being a high-energy breed, provide ${possessive} with ***60-90 minutes of daily exercise*** to prevent obesity and keep ${possessive} happy.`);
    } else if (pet.breed.toLowerCase().includes('beagle')) {
      narrative.push(`Those adorable floppy ears need extra attention - ***check and clean ${possessive} ears weekly*** to prevent infections. Engage ${possessive} with ***scent games and puzzle toys*** for mental stimulation.`);
    } else if (pet.breed.toLowerCase().includes('german shepherd')) {
      narrative.push(`Monitor ${possessive} ***joint health closely*** as ${pronoun} is breed-prone to dysplasia. Provide ${possessive} with ***daily mental challenges*** - ${pronoun}'s a highly intelligent breed!`);
    }

    // Season-based care
    if (isWinter) {
      narrative.push(`During this cold weather, ***bathe ${possessive} once every 3-4 weeks*** to maintain ${possessive} natural oils.`);
      if (pet.breed.toLowerCase().includes('short')) {
        narrative.push(`Consider a ***sweater for outdoor walks*** in early morning or evening.`);
      }
    } else if (isSummer) {
      narrative.push(`In this summer heat, ensure ${pronoun} has ***constant access to fresh water and shade***. ***Avoid walks between 11 AM - 4 PM*** to prevent heatstroke, and ***bathe ${possessive} every 1-2 weeks*** to keep ${possessive} cool.`);
    } else if (isMonsoon) {
      narrative.push(`During monsoon season, ***dry ${possessive} thoroughly after walks*** to prevent fungal infections, and use ***vet-approved tick & flea prevention*** - it's peak season for parasites!`);
    }

    // Medical condition care
    if (pet.conditions && pet.conditions.length > 0) {
      if (pet.conditions.some(c => c.toLowerCase().includes('allerg') || c.toLowerCase().includes('skin'))) {
        narrative.push(`For ${possessive} skin sensitivities, ***keep ${possessive} environment clean*** and vacuum regularly to reduce allergens. Use ***gentle, medicated shampoo*** as prescribed by your vet.`);
      }
      if (pet.conditions.some(c => c.toLowerCase().includes('arthritis') || c.toLowerCase().includes('joint'))) {
        narrative.push(`For ${possessive} joint comfort, provide ***soft, orthopedic bedding*** and consider ***low-impact exercises like swimming***.`);
      }
    }

    // Food allergy care
    if (pet.allergies && pet.allergies.length > 0) {
      const foodAllergies = pet.allergies.filter(a =>
        ['chicken', 'beef', 'dairy', 'wheat', 'egg', 'soy', 'corn'].some(f => a.toLowerCase().includes(f))
      );
      if (foodAllergies.length > 0) {
        narrative.push(`⚠️ **IMPORTANT**: ***Strictly avoid ${foodAllergies.slice(0, 2).join(' and ')}*** in ${possessive} diet due to known allergies. Consider a ***hypoallergenic or limited ingredient diet***.`);
      }
    }

    // General care
    narrative.push(`Keep ${possessive} ***vaccinations up to date*** (Rabies, Distemper, Parvovirus) and ***deworm ${possessive} every 3 months*** with vet-approved medication.`);

    return narrative.join(' ');
  };
  
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
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [symptomCheckHistory, setSymptomCheckHistory] = useState<SymptomCheckResponse[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedSymptomCheck, setSelectedSymptomCheck] = useState<SymptomCheckResponse | null>(null);
  const [showHistoryViewer, setShowHistoryViewer] = useState(false);
  const [defaultTab, setDefaultTab] = useState<'profile' | 'history' | 'summary-history'>('profile');
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [summaryDialogPet, setSummaryDialogPet] = useState<Pet | null>(null);
  const [petSummary, setPetSummary] = useState<string>('');
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [selectedHistoryItems, setSelectedHistoryItems] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [summaryHistory, setSummaryHistory] = useState<any[]>([]);
  const [loadingSummaryHistory, setLoadingSummaryHistory] = useState(false);
  const [selectedSummaryForView, setSelectedSummaryForView] = useState<any>(null);
  const [showSummaryViewDialog, setShowSummaryViewDialog] = useState(false);
  const [selectedSummaryItems, setSelectedSummaryItems] = useState<Set<string>>(new Set());
  const [isDeletingSummaries, setIsDeletingSummaries] = useState(false);

  // Handle navigation from symptom checker with pet to open
  useEffect(() => {
    const openPet = location.state?.openPet;
    if (openPet && pets.length > 0) {
      // Find the pet in the current pets list
      const pet = pets.find(p => p.id === openPet.id);
      if (pet) {
        // Open the pet dialog with Health History tab
        setDefaultTab('history');
        handlePetClick(pet);
        // Clear the state to prevent reopening on subsequent renders
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, pets]);

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

  const resetForm = () => {
    setFormData({
      name: '',
      breed: '',
      age: '',
      gender: '',
      weight: '',
      lifestyle: '',
      photo: '',
    });
    setConditions([]);
    setAllergies([]);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    if (pets.length >= 10) {
      toast.error('Maximum 10 pet profiles allowed');
      return;
    }

    try {
      console.log('Conditions before creating pet:', conditions);
      console.log('Allergies before creating pet:', allergies);
      
      const petData = {
        name: formData.name.trim(),
        breed: formData.breed,
        age: parseFloat(formData.age),
        gender: formData.gender as 'male' | 'female',
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        lifestyle: formData.lifestyle || undefined,
        photo: formData.photo || undefined,
        conditions: conditions.length > 0 ? conditions : [],
        allergies: allergies.length > 0 ? allergies : [],
      };
      
      console.log('Creating pet with data:', petData);
      
      await addPet(petData);
      
      toast.success('Pet profile created successfully!');
      resetForm();
    } catch (error) {
      console.error('Error creating pet:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create pet profile');
    }
  };

  const handlePetClick = async (pet: Pet) => {
    setSelectedPet(pet);
    setDefaultTab('profile'); // Always default to profile tab when clicking from pet list
    setShowDetailDialog(true);
    
    // Load symptom check history for this pet
    setLoadingHistory(true);
    try {
      const history = await symptomCheckApi.getPetSymptomChecks(pet.id);
      setSymptomCheckHistory(history);
    } catch (error) {
      console.error('Failed to load symptom check history:', error);
      setSymptomCheckHistory([]);
    } finally {
      setLoadingHistory(false);
    }
    
    // Load summary history for this pet and use the latest summary for recommendations
    try {
      const response = await recommendationsApi.getPetSummaryHistory(pet.id);
      setSummaryHistory(response.summaries);
      
      // Use the latest summary (first in the array) for recommendations
      if (response.summaries && response.summaries.length > 0) {
        setPetSummary(response.summaries[0].summary);
      } else {
        // If no summaries exist, clear the pet summary to show default care notes
        setPetSummary('');
      }
    } catch (error) {
      console.error('Failed to load summary history:', error);
      setSummaryHistory([]);
      setPetSummary('');
    }
  };
  
  const loadSummaryHistory = async (petId: string) => {
    setLoadingSummaryHistory(true);
    try {
      const response = await recommendationsApi.getPetSummaryHistory(petId);
      setSummaryHistory(response.summaries);
      
      // Update the pet summary with the latest summary for recommendations
      if (response.summaries && response.summaries.length > 0) {
        setPetSummary(response.summaries[0].summary);
      } else {
        // If no summaries exist, clear to show default care notes
        setPetSummary('');
      }
      
      // Clear selection when reloading
      setSelectedSummaryItems(new Set());
    } catch (error) {
      console.error('Failed to load summary history:', error);
      setSummaryHistory([]);
      setPetSummary('');
    } finally {
      setLoadingSummaryHistory(false);
    }
  };
  
  const handleDeleteSummary = async (summaryId: string, petId: string) => {
    if (!window.confirm('Are you sure you want to delete this health summary?')) {
      return;
    }
    
    try {
      await recommendationsApi.deletePetSummary(summaryId);
      toast.success('Health summary deleted successfully');
      // Reload summary history
      loadSummaryHistory(petId);
    } catch (error) {
      console.error('Failed to delete summary:', error);
      toast.error('Failed to delete health summary');
    }
  };
  
  const handleViewSummary = (summary: any) => {
    setSelectedSummaryForView(summary);
    setShowSummaryViewDialog(true);
  };

  const handleDeletePet = async (petId: string, petName: string) => {
    if (window.confirm(`Are you sure you want to delete ${petName}'s profile?`)) {
      try {
        await deletePet(petId);
        toast.success(`${petName}'s profile deleted successfully`);
        setShowDetailDialog(false);
      } catch (error) {
        toast.error('Failed to delete pet profile');
      }
    }
  };

  const handleSymptomChecker = (pet: Pet, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    // Navigate to symptom checker with pet context
    navigate('/symptom-checker', { state: { pet } });
  };

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const generatePetSummary = async (pet: Pet, forceRefresh: boolean = false) => {
    setGeneratingSummary(true);
    // Always keep the dialog open when generating
    setShowSummaryDialog(true);
    
    try {
      // Call the backend API to generate AI-powered summary
      // Pass force_refresh parameter to bypass cache
      const url = `/api/v1/recommendations/pet-summary/${pet.id}${forceRefresh ? '?force_refresh=true' : ''}`;
      const response = await api.post<{
        petId: string;
        petName: string;
        summary: string;
        generatedAt: string;
        historyPeriod: string;
        checksAnalyzed: number;
        source: string;
        cached: boolean;
      }>(url, {});
      
      // Set the summary from the API response
      setPetSummary(response.summary);
      
      // Reload summary history to show the new summary in the Summaries tab
      // This happens for both cached and new summaries
      await loadSummaryHistory(pet.id);
      
      // Show appropriate toast based on whether it's cached or newly generated
      if (forceRefresh) {
        toast.success(`Fresh summary generated for ${response.petName}`, {
          description: `Analyzed ${response.checksAnalyzed} health conversation(s)`
        });
      } else if (response.cached) {
        toast.info(`Showing cached summary for ${response.petName}`, {
          description: 'No new chat history since last generation'
        });
      } else {
        toast.success(`New summary generated for ${response.petName}`, {
          description: `Analyzed ${response.checksAnalyzed} health conversation(s)`
        });
      }
    } catch (error) {
      console.error('Failed to generate pet summary:', error);
      toast.error('Failed to generate pet summary', {
        description: 'Please try again later'
      });
      setPetSummary(`# Error\n\nFailed to generate AI-powered summary for ${pet.name}. Please try again.`);
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleGenerateSummary = async (pet: Pet, e: React.MouseEvent) => {
    e.stopPropagation();
    setSummaryDialogPet(pet); // Store the pet for the summary dialog
    await generatePetSummary(pet);
  };

  const handleDownloadPDF = async () => {
    if (!summaryDialogPet || !petSummary) {
      toast.error('No summary available to download');
      return;
    }

    try {
      toast.info('Generating PDF...', { description: 'This may take a few seconds' });

      // Create a temporary container for the PDF content
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '800px';
      tempContainer.style.padding = '40px';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.fontFamily = 'Arial, sans-serif';
      
      // Add header with pet info
      const header = document.createElement('div');
      header.style.marginBottom = '20px';
      header.style.borderBottom = '2px solid #FF385C';
      header.style.paddingBottom = '15px';
      header.innerHTML = `
        <h1 style="color: #FF385C; font-size: 24px; margin: 0 0 10px 0;">Pet Health Summary</h1>
        <div style="font-size: 14px; color: #666;">
          <p style="margin: 5px 0;"><strong>Pet Name:</strong> ${summaryDialogPet.name}</p>
          <p style="margin: 5px 0;"><strong>Breed:</strong> ${summaryDialogPet.breed}</p>
          <p style="margin: 5px 0;"><strong>Age:</strong> ${summaryDialogPet.age} ${summaryDialogPet.age === 1 ? 'year' : 'years'}</p>
          <p style="margin: 5px 0;"><strong>Gender:</strong> ${summaryDialogPet.gender}</p>
          <p style="margin: 5px 0;"><strong>Generated:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
      `;
      tempContainer.appendChild(header);

      // Add summary content
      const content = document.createElement('div');
      content.style.fontSize = '12px';
      content.style.lineHeight = '1.6';
      content.style.color = '#333';
      content.innerHTML = petSummary
        .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^# (.*$)/gm, '<h1 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px 0; color: #333;">$1</h1>')
        .replace(/^## (.*$)/gm, '<h2 style="font-size: 16px; font-weight: 600; margin: 15px 0 8px 0; color: #444;">$1</h2>')
        .replace(/^### (.*$)/gm, '<h3 style="font-size: 14px; font-weight: 500; margin: 12px 0 6px 0; color: #555;">$1</h3>')
        .replace(/((?:^\d+\. .*$\n?)+)/gm, (match) => {
          const items = match.trim().split('\n').map(line =>
            line.replace(/^\d+\. (.*)$/, '<li style="margin-bottom: 8px;">$1</li>')
          ).join('');
          return `<ol style="margin: 10px 0; padding-left: 20px;">${items}</ol>`;
        })
        .replace(/((?:^- .*$\n?)+)/gm, (match) => {
          const items = match.trim().split('\n').map(line =>
            line.replace(/^- (.*)$/, '<li style="margin-bottom: 8px;">$1</li>')
          ).join('');
          return `<ul style="margin: 10px 0; padding-left: 20px;">${items}</ul>`;
        })
        .replace(/\n\n/g, '<br/><br/>')
        .replace(/^---$/gm, '<hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;"/>');
      
      tempContainer.appendChild(content);
      document.body.appendChild(tempContainer);

      // Generate canvas from the content
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      const fileName = `${summaryDialogPet.name}_Health_Summary_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF', {
        description: 'Please try again'
      });
    }
  };

  const toggleHistorySelection = (checkId: string) => {
    setSelectedHistoryItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(checkId)) {
        newSet.delete(checkId);
      } else {
        newSet.add(checkId);
      }
      return newSet;
    });
  };

  const handleDeleteSelectedHistory = async () => {
    if (selectedHistoryItems.size === 0) {
      toast.error('Please select at least one item to delete');
      return;
    }

    const confirmMessage = selectedHistoryItems.size === 1
      ? 'Are you sure you want to delete this health check?'
      : `Are you sure you want to delete ${selectedHistoryItems.size} health checks?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);
    try {
      // Delete all selected items
      const deletePromises = Array.from(selectedHistoryItems).map(checkId =>
        symptomCheckApi.deleteSymptomCheck(checkId)
      );
      
      await Promise.all(deletePromises);
      
      // Refresh the history
      if (selectedPet) {
        const history = await symptomCheckApi.getPetSymptomChecks(selectedPet.id);
        setSymptomCheckHistory(history);
      }
      
      // Clear selection
      setSelectedHistoryItems(new Set());
      
      toast.success(`Successfully deleted ${selectedHistoryItems.size} health check${selectedHistoryItems.size > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Failed to delete history items:', error);
      toast.error('Failed to delete some items. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleResolved = async (checkId: string, currentResolved: boolean) => {
    try {
      await api.patch(`/api/v1/symptom-checks/${checkId}/resolve?resolved=${!currentResolved}`, {});
      
      // Refresh the history
      if (selectedPet) {
        const history = await symptomCheckApi.getPetSymptomChecks(selectedPet.id);
        setSymptomCheckHistory(history);
      }
      
      toast.success(
        !currentResolved
          ? 'Concern marked as resolved'
          : 'Concern marked as active'
      );
    } catch (error) {
      console.error('Failed to update resolved status:', error);
      toast.error('Failed to update status. Please try again.');
    }
  };

  const toggleSummarySelection = (summaryId: string) => {
    setSelectedSummaryItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(summaryId)) {
        newSet.delete(summaryId);
      } else {
        newSet.add(summaryId);
      }
      return newSet;
    });
  };

  const handleDeleteSelectedSummaries = async () => {
    if (selectedSummaryItems.size === 0) {
      toast.error('Please select at least one summary to delete');
      return;
    }

    const confirmMessage = selectedSummaryItems.size === 1
      ? 'Are you sure you want to delete this health summary?'
      : `Are you sure you want to delete ${selectedSummaryItems.size} health summaries?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsDeletingSummaries(true);
    try {
      // Delete all selected items
      const deletePromises = Array.from(selectedSummaryItems).map(summaryId =>
        recommendationsApi.deletePetSummary(summaryId)
      );
      
      await Promise.all(deletePromises);
      
      // Refresh the summary history
      if (selectedPet) {
        await loadSummaryHistory(selectedPet.id);
      }
      
      // Clear selection
      setSelectedSummaryItems(new Set());
      
      toast.success(`Successfully deleted ${selectedSummaryItems.size} health summar${selectedSummaryItems.size > 1 ? 'ies' : 'y'}`);
    } catch (error) {
      console.error('Failed to delete summary items:', error);
      toast.error('Failed to delete some summaries. Please try again.');
    } finally {
      setIsDeletingSummaries(false);
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold">Pet Profiles</h1>
            </div>
            
            {/* Profile Dropdown */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 hover:bg-gray-100"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[#FF385C] text-white">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    {user.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate('/')}
                    className="cursor-pointer"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    <span>Home</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate('/profile')}
                    className="cursor-pointer"
                  >
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate('/pet-profile')}
                    className="cursor-pointer"
                  >
                    <PawPrint className="mr-2 h-4 w-4" />
                    <span>Pet Profiles</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Pet Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Pet Profile</CardTitle>
              <CardDescription>
                Add a new pet to your family. Fields marked with * are required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Photo Upload */}
                <div className="flex justify-center">
                  <div className="relative">
                    {formData.photo ? (
                      <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-[#FF385C]">
                        <img src={formData.photo} alt="Pet" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, photo: '' }))}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF385C] transition-colors">
                        <Camera className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500">Photo</span>
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
                      placeholder="3.5"
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
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male" className="cursor-pointer font-normal">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female" className="cursor-pointer font-normal">Female</Label>
                      </div>
                    </RadioGroup>
                    {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
                  </div>
                </div>

                {/* Weight */}
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="25.5"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    className={errors.weight ? 'border-red-500' : ''}
                  />
                </div>

                {/* Lifestyle */}
                <div className="space-y-2">
                  <Label htmlFor="lifestyle">Lifestyle</Label>
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
                  <Label>Medical Conditions</Label>
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
                  <Label>Known Allergies</Label>
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

                <Button type="submit" className="w-full bg-[#FF385C] hover:bg-[#E31C5F]" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Pet Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Pet Cards List */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Pets ({pets.length}/10)</CardTitle>
                <CardDescription>
                  Click on a pet card to view full details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <PawPrint className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No pets added yet</p>
                    <p className="text-sm">Create your first pet profile!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pets.map((pet) => (
                      <Card
                        key={pet.id}
                        className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-[#FF385C] relative"
                        onClick={() => handlePetClick(pet)}
                      >
                        <CardContent className="p-4">
                          {/* Action Icon - Only Summary */}
                          <div className="absolute top-2 right-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-full bg-purple-500 hover:bg-purple-600 text-white"
                              onClick={(e) => handleGenerateSummary(pet, e)}
                              title="Generate Pet Summary"
                            >
                              <Sparkles className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                              {pet.photo ? (
                                <AvatarImage src={pet.photo} alt={pet.name} />
                              ) : (
                                <AvatarFallback className="bg-[#FF385C] text-white text-lg">
                                  {getInitials(pet.name)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{pet.name}</h3>
                              <p className="text-sm text-gray-600">{pet.breed}</p>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {pet.age} {pet.age === 1 ? 'year' : 'years'}
                                </Badge>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {pet.gender}
                                </Badge>
                                {pet.weight && (
                                  <Badge variant="outline" className="text-xs">
                                    {pet.weight} kg
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Pet Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-4">
          {selectedPet && (
            <>
              <DialogHeader className="pb-2">
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <Avatar className="h-10 w-10">
                    {selectedPet.photo ? (
                      <AvatarImage src={selectedPet.photo} alt={selectedPet.name} />
                    ) : (
                      <AvatarFallback className="bg-[#FF385C] text-white text-sm">
                        {getInitials(selectedPet.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {selectedPet.name}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Complete profile information for {selectedPet.name}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue={defaultTab} className="mt-2" onValueChange={(value) => setDefaultTab(value as 'profile' | 'history' | 'summary-history')}>
               <TabsList className="grid w-full grid-cols-3 h-8">
                 <TabsTrigger value="profile" className="text-xs">Profile</TabsTrigger>
                 <TabsTrigger value="history" className="text-xs">
                   <History className="w-3 h-3 mr-1" />
                   Checks ({symptomCheckHistory.length})
                 </TabsTrigger>
                 <TabsTrigger value="summary-history" className="text-xs">
                   <Sparkles className="w-3 h-3 mr-1" />
                   Summaries ({summaryHistory.length})
                 </TabsTrigger>
               </TabsList>

                <TabsContent value="profile" className="space-y-2 mt-2">
                  {/* Personalized Care Note - Show recommendations from Pet Health Summary */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md p-2 border border-blue-200">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Info className="w-3 h-3 text-white" />
                      </div>
                      <h3 className="font-semibold text-xs text-gray-900">Care Recommendations for {selectedPet.name}</h3>
                    </div>
                    {petSummary ? (
                      <div className="text-[10px] leading-snug text-gray-700">
                        <style>{`
                          .care-notes ol {
                            display: block !important;
                            counter-reset: item !important;
                            padding-left: 0 !important;
                            margin: 0.5rem 0 !important;
                          }
                          .care-notes ol li {
                            display: block !important;
                            margin-bottom: 0.5rem !important;
                            padding-left: 1.5rem !important;
                            position: relative !important;
                            font-size: 10px !important;
                            line-height: 1.4 !important;
                          }
                          .care-notes ol li:before {
                            content: counter(item) ". " !important;
                            counter-increment: item !important;
                            position: absolute !important;
                            left: 0 !important;
                            font-weight: 600 !important;
                            color: #374151 !important;
                          }
                        `}</style>
                        <div
                          className="care-notes"
                          dangerouslySetInnerHTML={{
                            __html: (() => {
                              // Extract only the Recommendations section
                              const recommendationsMatch = petSummary.match(/## Recommendations\s*([\s\S]*?)(?=##|---|\n\n$|$)/);
                              if (recommendationsMatch) {
                                const recommendations = recommendationsMatch[1].trim();
                                // Process the recommendations
                                return recommendations
                                  // Handle numbered lists
                                  .replace(/((?:^\d+\. .*$\n?)+)/gm, (match) => {
                                    const items = match.trim().split('\n').map(line =>
                                      line.replace(/^\d+\. (.*)$/, '<li>$1</li>')
                                    ).join('');
                                    return `<ol>${items}</ol>`;
                                  })
                                  // Handle dash lists
                                  .replace(/((?:^- .*$\n?)+)/gm, (match) => {
                                    const items = match.trim().split('\n').map(line =>
                                      line.replace(/^- (.*)$/, '<li>$1</li>')
                                    ).join('');
                                    return `<ol>${items}</ol>`;
                                  })
                                  // Handle inline asterisk lists
                                  .replace(/(\*\s+[^*]+?)(?=\s*\*|$)/g, (match) => {
                                    return `<li>${match.replace(/^\*\s*/, '').trim()}</li>`;
                                  })
                                  // Wrap consecutive li tags in single ol
                                  .replace(/(<li>[\s\S]*?<\/li>(?:\s*<li>[\s\S]*?<\/li>)*)/g, (match) => {
                                    if (!match.includes('<ol>')) {
                                      return `<ol>${match}</ol>`;
                                    }
                                    return match;
                                  });
                              }
                              // Fallback to default care notes if no recommendations found
                              return generateRecommendations(selectedPet);
                            })()
                          }}
                        />
                      </div>
                    ) : (
                      <p className="text-[10px] leading-snug text-gray-700">
                        {generateRecommendations(selectedPet)}
                      </p>
                    )}
                  </div>

                  {/* First Row: Breed, Age, Gender, Weight */}
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <Label className="text-[10px] text-gray-600">Breed</Label>
                      <p className="font-medium text-xs">{selectedPet.breed}</p>
                    </div>
                    <div>
                      <Label className="text-[10px] text-gray-600">Age</Label>
                      <p className="font-medium text-xs">{selectedPet.age} {selectedPet.age === 1 ? 'yr' : 'yrs'}</p>
                    </div>
                    <div>
                      <Label className="text-[10px] text-gray-600">Gender</Label>
                      <p className="font-medium text-xs capitalize">{selectedPet.gender}</p>
                    </div>
                    <div>
                      <Label className="text-[10px] text-gray-600">Weight</Label>
                      <p className="font-medium text-xs">{selectedPet.weight ? `${selectedPet.weight} kg` : 'N/A'}</p>
                    </div>
                  </div>

                  {/* Second Row: Lifestyle, Medical Conditions, Known Allergies */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-[10px] text-gray-600">Lifestyle</Label>
                      <p className="font-medium text-xs capitalize">{selectedPet.lifestyle || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-[10px] text-gray-600">Medical Conditions</Label>
                      {selectedPet.conditions && selectedPet.conditions.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {selectedPet.conditions.map((condition) => (
                            <Badge key={condition} variant="secondary" className="text-[10px] py-0 px-1.5">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="font-medium text-xs">None</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-[10px] text-gray-600">Known Allergies</Label>
                      {selectedPet.allergies && selectedPet.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {selectedPet.allergies.map((allergy) => (
                            <Badge key={allergy} variant="destructive" className="text-[10px] py-0 px-1.5">
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="font-medium text-xs">None</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDetailDialog(false);
                        navigate(`/pet-profile/edit/${selectedPet.id}`);
                      }}
                      className="flex-1 h-8 text-xs"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDetailDialog(false);
                        handleSymptomChecker(selectedPet, e);
                      }}
                      className="flex-1 h-8 text-xs border-[#FF385C] text-[#FF385C] hover:bg-[#FF385C] hover:text-white"
                    >
                      <Stethoscope className="w-3 h-3 mr-1" />
                      Check Health
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeletePet(selectedPet.id, selectedPet.name)}
                      className="flex-1 h-8 text-xs"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowDetailDialog(false)}
                      className="flex-1 h-8 text-xs"
                    >
                      Close
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                  {loadingHistory ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Loading health history...</p>
                    </div>
                  ) : symptomCheckHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Stethoscope className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No symptom checks yet</p>
                      <p className="text-sm">Start a symptom check to build your history</p>
                      <Button
                        onClick={(e) => {
                          setShowDetailDialog(false);
                          handleSymptomChecker(selectedPet, e);
                        }}
                        className="mt-4 bg-[#FF385C] hover:bg-[#E31C5F]"
                      >
                        <Stethoscope className="w-4 h-4 mr-2" />
                        Start Health Check
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Delete Controls */}
                      {selectedHistoryItems.size > 0 && (
                        <div className="flex items-center justify-between mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
                          <span className="text-sm text-red-700">
                            {selectedHistoryItems.size} item{selectedHistoryItems.size > 1 ? 's' : ''} selected
                          </span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedHistoryItems(new Set())}
                              disabled={isDeleting}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={handleDeleteSelectedHistory}
                              disabled={isDeleting}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              {isDeleting ? 'Deleting...' : 'Delete Selected'}
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      <ScrollArea className="h-96">
                        <div className="space-y-3">
                          {symptomCheckHistory.map((check) => {
                          const getRiskColor = (level: string) => {
                            switch (level) {
                              case 'Emergency': return 'bg-red-500';
                              case 'Urgent': return 'bg-orange-500';
                              case 'Monitor': return 'bg-yellow-500';
                              case 'Low Risk': return 'bg-green-500';
                              default: return 'bg-gray-500';
                            }
                          };

                          const getRiskIcon = (level: string) => {
                            switch (level) {
                              case 'Emergency': return AlertCircle;
                              case 'Urgent': return Clock;
                              case 'Monitor': return Info;
                              case 'Low Risk': return CheckCircle;
                              default: return Info;
                            }
                          };

                          const RiskIcon = getRiskIcon(check.riskLevel);
                          const date = new Date(check.timestamp);

                          return (
                            <Card
                              key={check.id}
                              className={`cursor-pointer hover:shadow-md transition-all ${
                                selectedHistoryItems.has(check.id) ? 'ring-2 ring-red-500' : ''
                              }`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  {/* Checkbox for selection */}
                                  <div className="flex items-center pt-1">
                                    <Checkbox
                                      checked={selectedHistoryItems.has(check.id)}
                                      onCheckedChange={() => toggleHistorySelection(check.id)}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                  
                                  <div
                                    className={`w-10 h-10 rounded-full ${getRiskColor(check.riskLevel)} flex items-center justify-center flex-shrink-0`}
                                    onClick={() => {
                                      setSelectedSymptomCheck(check);
                                      setShowHistoryViewer(true);
                                    }}
                                  >
                                    <RiskIcon className="w-5 h-5 text-white" />
                                  </div>
                                  <div
                                    className="flex-1 min-w-0"
                                    onClick={() => {
                                      setSelectedSymptomCheck(check);
                                      setShowHistoryViewer(true);
                                    }}
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant="outline" className="text-xs">
                                        {check.category}
                                      </Badge>
                                      {check.healthSubcategory && (
                                        <Badge variant="secondary" className="text-xs">
                                          {check.healthSubcategory}
                                        </Badge>
                                      )}
                                      {check.resolved && (
                                        <Badge variant="default" className="text-xs bg-green-500">
                                          <Check className="w-3 h-3 mr-1" />
                                          Resolved
                                        </Badge>
                                      )}
                                    </div>
                                    <h4 className={`font-semibold text-sm ${check.resolved ? 'line-through text-gray-400' : ''}`}>
                                      {check.riskLevel}
                                    </h4>
                                    <p className={`text-sm line-clamp-2 mt-1 ${check.resolved ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {check.summary}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                      {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      {check.resolved && check.resolvedAt && (
                                        <span className="ml-2 text-green-600">
                                          • Resolved {new Date(check.resolvedAt).toLocaleDateString()}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                  
                                  {/* Resolved Toggle */}
                                  <div className="flex items-center pt-1">
                                    <Button
                                      size="sm"
                                      variant={check.resolved ? "outline" : "default"}
                                      className={`h-8 text-xs ${check.resolved ? 'border-green-500 text-green-600 hover:bg-green-50' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleResolved(check.id, check.resolved || false);
                                      }}
                                      title={check.resolved ? "Mark as active" : "Mark as resolved"}
                                    >
                                      <Check className="w-3 h-3 mr-1" />
                                      {check.resolved ? 'Active' : 'Resolve'}
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                          })}
                        </div>
                      </ScrollArea>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="summary-history" className="mt-4">
                  {loadingSummaryHistory ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Loading summary history...</p>
                    </div>
                  ) : summaryHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No health summaries yet</p>
                      <p className="text-sm">Generate your first health summary!</p>
                      <Button
                        onClick={(e) => {
                          if (selectedPet) {
                            handleGenerateSummary(selectedPet, e);
                          }
                        }}
                        className="mt-4 bg-purple-500 hover:bg-purple-600"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Health Summary
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Delete Controls */}
                      {selectedSummaryItems.size > 0 && (
                        <div className="flex items-center justify-between mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
                          <span className="text-sm text-red-700">
                            {selectedSummaryItems.size} summar{selectedSummaryItems.size > 1 ? 'ies' : 'y'} selected
                          </span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedSummaryItems(new Set())}
                              disabled={isDeletingSummaries}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={handleDeleteSelectedSummaries}
                              disabled={isDeletingSummaries}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              {isDeletingSummaries ? 'Deleting...' : 'Delete Selected'}
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      <ScrollArea className="h-96">
                        <div className="space-y-3">
                          {summaryHistory.map((summary) => {
                            const date = new Date(summary.generatedAt);
                            const season = summary.season || 'Unknown';
                            const hasLocation = summary.hasLocationData;
                            
                            return (
                              <Card
                                key={summary.id}
                                className={`cursor-pointer hover:shadow-md transition-all ${
                                  selectedSummaryItems.has(summary.id) ? 'ring-2 ring-red-500' : ''
                                }`}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-3">
                                    {/* Checkbox for selection */}
                                    <div className="flex items-center pt-1">
                                      <Checkbox
                                        checked={selectedSummaryItems.has(summary.id)}
                                        onCheckedChange={() => toggleSummarySelection(summary.id)}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </div>
                                    
                                    <div
                                      className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0"
                                      onClick={() => handleViewSummary(summary)}
                                    >
                                      <Sparkles className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div
                                      className="flex-1 min-w-0"
                                      onClick={() => handleViewSummary(summary)}
                                    >
                                      <div className="flex items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <Badge variant="outline" className="text-xs">
                                            {season} Season
                                          </Badge>
                                          {hasLocation && (
                                            <Badge variant="secondary" className="text-xs">
                                              <MapPin className="w-3 h-3 mr-1" />
                                              Location-based
                                            </Badge>
                                          )}
                                          <Badge variant="outline" className="text-xs">
                                            {summary.checksAnalyzed} check{summary.checksAnalyzed !== 1 ? 's' : ''}
                                          </Badge>
                                        </div>
                                      </div>
                                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                        {summary.summary.substring(0, 150)}...
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        Generated: {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Chat History Viewer */}
      <ChatHistoryViewer
        open={showHistoryViewer}
        onOpenChange={setShowHistoryViewer}
        symptomCheck={selectedSymptomCheck}
      />

      {/* Pet Summary Dialog */}
      <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Pet Health Summary
            </DialogTitle>
            <DialogDescription>
              Comprehensive analysis based on profile and health history
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 max-h-[calc(90vh-200px)] pr-4 overflow-y-auto">
            {generatingSummary ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                <p className="text-gray-600">Analyzing pet profile and health history...</p>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none pb-4">
                <style>{`
                  .markdown-content ol {
                    display: block !important;
                    counter-reset: item !important;
                    padding-left: 0 !important;
                    margin: 1rem 0 !important;
                  }
                  .markdown-content ol li {
                    display: block !important;
                    margin-bottom: 0.75rem !important;
                    padding-left: 2rem !important;
                    position: relative !important;
                  }
                  .markdown-content ol li:before {
                    content: counter(item) ". " !important;
                    counter-increment: item !important;
                    position: absolute !important;
                    left: 0 !important;
                    font-weight: 600 !important;
                    color: #374151 !important;
                  }
                `}</style>
                <div
                  className="markdown-content"
                  dangerouslySetInnerHTML={{
                    __html: petSummary
                      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
                      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-3 mb-2">$1</h2>')
                      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mt-2 mb-1">$1</h3>')
                      // Handle numbered lists first
                      .replace(/((?:^\d+\. .*$\n?)+)/gm, (match) => {
                        const items = match.trim().split('\n').map(line =>
                          line.replace(/^\d+\. (.*)$/, '<li>$1</li>')
                        ).join('');
                        return `<ol>${items}</ol>`;
                      })
                      // Handle dash lists
                      .replace(/((?:^- .*$\n?)+)/gm, (match) => {
                        const items = match.trim().split('\n').map(line =>
                          line.replace(/^- (.*)$/, '<li>$1</li>')
                        ).join('');
                        return `<ol>${items}</ol>`;
                      })
                      // Handle inline asterisk lists (e.g., "* item1 * item2")
                      .replace(/(\*\s+[^*]+?)(?=\s*\*|$)/g, (match) => {
                        return `<li>${match.replace(/^\*\s*/, '').trim()}</li>`;
                      })
                      // Wrap ALL consecutive li tags in a SINGLE ol (greedy match)
                      .replace(/(<li>[\s\S]*?<\/li>(?:\s*<li>[\s\S]*?<\/li>)*)/g, (match) => {
                        // Only wrap if not already wrapped
                        if (!match.includes('<ol>')) {
                          return `<ol>${match}</ol>`;
                        }
                        return match;
                      })
                      .replace(/\n\n/g, '<br/><br/>')
                      .replace(/^---$/gm, '<hr class="my-4"/>')
                  }}
                />
              </div>
            )}
          </ScrollArea>
          
          <div className="flex justify-between gap-2 pt-4 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-purple-500 hover:bg-purple-600 text-white"
                onClick={() => {
                  console.log('New Summary button clicked');
                  console.log('Summary dialog pet:', summaryDialogPet);
                  console.log('Generating summary:', generatingSummary);
                  if (summaryDialogPet) {
                    console.log('Calling generatePetSummary with force refresh');
                    generatePetSummary(summaryDialogPet, true);
                  } else {
                    console.error('No pet selected for summary dialog!');
                  }
                }}
                disabled={generatingSummary}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {generatingSummary ? 'Generating...' : 'New Summary'}
              </Button>
              <Button
                variant="outline"
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={handleDownloadPDF}
                disabled={generatingSummary || !petSummary}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowSummaryDialog(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>

      {/* Summary View Dialog */}
      <Dialog open={showSummaryViewDialog} onOpenChange={setShowSummaryViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {selectedSummaryForView && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Health Summary - {new Date(selectedSummaryForView.generatedAt).toLocaleDateString()}
                </DialogTitle>
                <DialogDescription>
                  {selectedSummaryForView.season} Season • {selectedSummaryForView.checksAnalyzed} health check{selectedSummaryForView.checksAnalyzed !== 1 ? 's' : ''} analyzed
                  {selectedSummaryForView.hasLocationData && ' • Location-based recommendations'}
                </DialogDescription>
              </DialogHeader>
              
              <ScrollArea className="flex-1 max-h-[calc(90vh-200px)] pr-4 overflow-y-auto">
                <div className="prose prose-sm max-w-none pb-4">
                  <style>{`
                    .markdown-content ol {
                      display: block !important;
                      counter-reset: item !important;
                      padding-left: 0 !important;
                      margin: 1rem 0 !important;
                    }
                    .markdown-content ol li {
                      display: block !important;
                      margin-bottom: 0.75rem !important;
                      padding-left: 2rem !important;
                      position: relative !important;
                    }
                    .markdown-content ol li:before {
                      content: counter(item) ". " !important;
                      counter-increment: item !important;
                      position: absolute !important;
                      left: 0 !important;
                      font-weight: 600 !important;
                      color: #374151 !important;
                    }
                  `}</style>
                  <div
                    className="markdown-content"
                    dangerouslySetInnerHTML={{
                      __html: selectedSummaryForView.summary
                        .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
                        .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-3 mb-2">$1</h2>')
                        .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mt-2 mb-1">$1</h3>')
                        .replace(/((?:^\d+\. .*$\n?)+)/gm, (match) => {
                          const items = match.trim().split('\n').map(line =>
                            line.replace(/^\d+\. (.*)$/, '<li>$1</li>')
                          ).join('');
                          return `<ol>${items}</ol>`;
                        })
                        .replace(/((?:^- .*$\n?)+)/gm, (match) => {
                          const items = match.trim().split('\n').map(line =>
                            line.replace(/^- (.*)$/, '<li>$1</li>')
                          ).join('');
                          return `<ol>${items}</ol>`;
                        })
                        .replace(/(\*\s+[^*]+?)(?=\s*\*|$)/g, (match) => {
                          return `<li>${match.replace(/^\*\s*/, '').trim()}</li>`;
                        })
                        .replace(/(<li>[\s\S]*?<\/li>(?:\s*<li>[\s\S]*?<\/li>)*)/g, (match) => {
                          if (!match.includes('<ol>')) {
                            return `<ol>${match}</ol>`;
                          }
                          return match;
                        })
                        .replace(/\n\n/g, '<br/><br/>')
                        .replace(/^---$/gm, '<hr class="my-4"/>')
                    }}
                  />
                </div>
              </ScrollArea>
              
              <div className="flex justify-between gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => {
                    if (!selectedSummaryForView) return;
                    
                    // Create a temporary pet object for the download function
                    const tempPet = selectedPet || summaryDialogPet;
                    if (!tempPet) {
                      toast.error('Pet information not available');
                      return;
                    }
                    
                    // Temporarily set the summary and pet for download
                    const originalSummary = petSummary;
                    const originalPet = summaryDialogPet;
                    
                    setPetSummary(selectedSummaryForView.summary);
                    setSummaryDialogPet(tempPet);
                    
                    // Trigger download
                    setTimeout(() => {
                      handleDownloadPDF();
                      // Restore original values
                      setPetSummary(originalSummary);
                      setSummaryDialogPet(originalPet);
                    }, 100);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSummaryViewDialog(false)}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PetProfile;