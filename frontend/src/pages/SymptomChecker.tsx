import React, { useState, useEffect, useRef } from 'react';
<<<<<<< HEAD
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, Upload, Video, AlertCircle, CheckCircle, Clock, Info, Stethoscope, ThumbsUp, ThumbsDown, User, Bot, Image as ImageIcon, X, LogIn, PawPrint, XCircle, MapPin, Phone, Navigation, ChevronDown, ChevronUp, Loader2, Home, UserCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
=======
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Upload, Video, AlertCircle, CheckCircle, Clock, Info, Stethoscope, ThumbsUp, ThumbsDown, User, Bot, Image as ImageIcon, X, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
<<<<<<< HEAD
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
=======
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
import { analyzeSymptoms } from '@/utils/aiMock';
import { SymptomCategory, HealthSubcategory } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { usePets } from '@/contexts/PetContext';
<<<<<<< HEAD
import { symptomCheckApi, providerApi, recommendationsApi } from '@/lib/api';
=======
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01

const HEALTH_SUBCATEGORIES: HealthSubcategory[] = [
  'Digestive Issues',
  'Skin & Coat',
  'Respiratory',
  'Behavioral',
  'Eyes & Ears',
  'Dental',
  'Musculoskeletal',
  'Urinary',
  'Emergency',
];

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  options?: { label: string; value: string; icon?: string }[];
  timestamp: Date;
  image?: string;
}

interface AnalysisResult {
  riskLevel: string;
  summary: string;
  detailedSections: { title: string; points: string[] }[];
  immediateActions: string[];
  reasoning: string;
}

interface ChatSession {
  messages: Message[];
  collectedData: {
    category?: SymptomCategory;
    subcategory?: HealthSubcategory;
    symptoms?: string;
    images: string[];
    video?: string;
  };
<<<<<<< HEAD
  conversationState: 'greeting' | 'category' | 'subcategory' | 'symptoms' | 'media' | 'analyzing' | 'complete' | 'vet_questions' | 'general_followup';
=======
  conversationState: 'greeting' | 'category' | 'subcategory' | 'symptoms' | 'media' | 'analyzing' | 'complete';
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
  analysisResult: AnalysisResult | null;
  timestamp: string;
}

const SymptomChecker: React.FC = () => {
  const navigate = useNavigate();
<<<<<<< HEAD
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { selectedPet, pets, selectPet } = usePets();
  const [currentPet, setCurrentPet] = useState<any>(null);
  const [showPetSelector, setShowPetSelector] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [initializedFromNav, setInitializedFromNav] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationState, setConversationState] = useState<'greeting' | 'category' | 'subcategory' | 'symptoms' | 'media' | 'analyzing' | 'complete' | 'vet_questions' | 'general_followup'>('category');
=======
  const { isAuthenticated, user } = useAuth();
  const { selectedPet, pets } = usePets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationState, setConversationState] = useState<'greeting' | 'category' | 'subcategory' | 'symptoms' | 'media' | 'analyzing' | 'complete'>('category');
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
  const [collectedData, setCollectedData] = useState<{
    category?: SymptomCategory;
    subcategory?: HealthSubcategory;
    symptoms?: string;
    images: string[];
    video?: string;
  }>({ images: [] });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
<<<<<<< HEAD
  const [currentCheckId, setCurrentCheckId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [showLoginBanner, setShowLoginBanner] = useState(true);
  const [showCloseChatDialog, setShowCloseChatDialog] = useState(false);
  const [nearestClinic, setNearestClinic] = useState<any>(null);
  const [loadingClinic, setLoadingClinic] = useState(false);
  const [nearbyVets, setNearbyVets] = useState<any[]>([]);
  const [loadingVets, setLoadingVets] = useState(false);
  const [showVetList, setShowVetList] = useState(false);
  const [expandedVetId, setExpandedVetId] = useState<string | null>(null);
  const [askedAboutVets, setAskedAboutVets] = useState(false);
  const [userPincode, setUserPincode] = useState<string>('');
  const [currentVetLimit, setCurrentVetLimit] = useState<number>(10);
  const [showPincodeInput, setShowPincodeInput] = useState(false);
  const [followUpInput, setFollowUpInput] = useState('');
  const [isAnsweringFollowUp, setIsAnsweringFollowUp] = useState(false);
  const [showVetSearchModal, setShowVetSearchModal] = useState(false);
  const [vetSearchType, setVetSearchType] = useState<'pincode' | 'city'>('pincode');
  const [modalPincode, setModalPincode] = useState('');
  const [modalCity, setModalCity] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedVetForBooking, setSelectedVetForBooking] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
=======
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [showLoginBanner, setShowLoginBanner] = useState(true);
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const sessionId = useRef<string>('symptom_checker_session');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
<<<<<<< HEAD
    // Don't auto-scroll when vet list is being displayed
    // This allows users to stay at their current scroll position when vets load
    if (!showVetList) {
      scrollToBottom();
    }
  }, [messages, showVetList]);

  // Debug effect to track vet list state
  useEffect(() => {
    console.log('=== VET LIST STATE DEBUG ===');
    console.log('showVetList:', showVetList);
    console.log('nearbyVets.length:', nearbyVets.length);
    console.log('nearbyVets:', nearbyVets);
    console.log('===========================');
  }, [showVetList, nearbyVets]);

  // Handle pet selection from navigation state or show selector
  useEffect(() => {
    const statePet = location.state?.pet;
    const fromLandingPage = location.state?.fromLandingPage;
    
    if (statePet && !initializedFromNav) {
      // IMMEDIATELY mark as initialized to prevent duplicate runs
      setInitializedFromNav(true);
      
      // Clear previous session when coming from pet profile
      localStorage.removeItem(sessionId.current);
      setMessages([]);
      setCollectedData({ images: [] });
      setConversationState('category');
      setAnalysisResult(null);
      setFeedback(null);
      setInputValue('');
      setCurrentCheckId(null);
      
      // Set the new pet and initialize chat
      setCurrentPet(statePet);
      toast.success(`Health check for ${statePet.name}`);
      
      // Load pet's symptom check history and initialize chat with full context
      const initializeWithHistory = async () => {
        const pet = statePet;
        const petName = pet?.name;
        
        let greeting = `Hi! I'm here to help with ${petName}'s health.`;
        
        // Add comprehensive pet profile context
        greeting += `\n\n📋 **${petName}'s Profile:**`;
        greeting += `\n• Breed: ${pet.breed}`;
        greeting += `\n• Age: ${pet.age} year${pet.age !== 1 ? 's' : ''} old`;
        greeting += `\n• Gender: ${pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)}`;
        if (pet.weight) {
          greeting += `\n• Weight: ${pet.weight} kg`;
        }
        if (pet.lifestyle) {
          greeting += `\n• Lifestyle: ${pet.lifestyle.charAt(0).toUpperCase() + pet.lifestyle.slice(1)}`;
        }
        
        // Add medical conditions
        if (pet.conditions && pet.conditions.length > 0) {
          greeting += `\n• Known Medical Conditions: ${pet.conditions.join(', ')}`;
        } else {
          greeting += `\n• Known Medical Conditions: None`;
        }
        
        // Add allergies
        if (pet.allergies && pet.allergies.length > 0) {
          greeting += `\n• Known Allergies: ${pet.allergies.join(', ')}`;
        } else {
          greeting += `\n• Known Allergies: None`;
        }
        
        // Fetch symptom check history for this pet
        try {
          const history = await symptomCheckApi.getPetSymptomChecks(pet.id);
          if (history.length > 0) {
            greeting += `\n\n📜 **Previous Health Checks:** ${history.length} check${history.length > 1 ? 's' : ''} will be included in context`;
            
            // Store history in a way that can be accessed during analysis
            (window as any).__petHealthHistory = history;
          } else {
            greeting += `\n\n📜 **Previous Health Checks:** None recorded yet`;
          }
        } catch (error) {
          console.error('Failed to load symptom check history:', error);
          greeting += `\n\n📜 **Previous Health Checks:** Unable to load history`;
        }
        
        // Add season context
        const currentMonth = new Date().getMonth();
        let season = 'Winter';
        if (currentMonth >= 2 && currentMonth <= 5) {
          season = 'Summer';
        } else if (currentMonth >= 6 && currentMonth <= 8) {
          season = 'Monsoon';
        }
        greeting += `\n\n🌦️ **Current Season:** ${season}`;
        
        greeting += `\n\n**I'll use all this information to provide personalized health recommendations for ${petName}.**`;
        greeting += `\n\nWhat would you like to check today?`;

        addBotMessage(greeting, [
          { label: '🍖 Nutrition', value: 'Nutrition' },
          { label: '🏃 Exercise', value: 'Exercise' },
          { label: '✂️ Grooming', value: 'Grooming' },
          { label: '⚕️ Health', value: 'Health' },
          { label: '🌦️ Seasonal', value: 'Seasonal' },
        ]);
      };
      
      // Initialize immediately (no delay needed)
      initializeWithHistory();
      
      // Clear the navigation state to prevent re-triggering
      window.history.replaceState({}, document.title);
    } else if (fromLandingPage && isAuthenticated && pets.length > 0 && !currentPet) {
      // Coming from landing page with saved pets - show selector only once
      setShowPetSelector(true);
      // Clear the fromLandingPage flag to prevent re-showing
      window.history.replaceState({}, document.title);
    } else if (selectedPet && !currentPet) {
      setCurrentPet(selectedPet);
    } else if (pets.length > 0 && !currentPet) {
      // Show pet selector if user has pets but none selected
      setShowPetSelector(true);
    }
  }, [location.state, selectedPet, pets, isAuthenticated, currentPet]);

  // Clear chat history and initialize fresh session on mount
  useEffect(() => {
    // Don't initialize if we already initialized from navigation state
    if (initializedFromNav) {
      return;
    }
    
    // Don't initialize if we have a pet from navigation state (will be handled by first useEffect)
    if (location.state?.pet || location.state?.fromLandingPage) {
      return;
    }
    
    // Only initialize if we don't have messages yet
    if (messages.length > 0) {
      return;
    }
    
    // Don't initialize if currentPet is set (means we're in the process of initializing from nav)
    if (currentPet) {
      return;
    }
    
    // Wait for pets to load if user is authenticated
    if (isAuthenticated && pets.length === 0) {
      return;
    }
    
    // Always clear previous session and start fresh
    localStorage.removeItem(sessionId.current);
    initializeNewChat();
  }, [initializedFromNav, location.state, messages.length, currentPet, isAuthenticated, pets.length]);
=======
    scrollToBottom();
  }, [messages]);

  // Load existing session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem(sessionId.current);
    if (savedSession) {
      try {
        const session: ChatSession = JSON.parse(savedSession);
        setMessages(session.messages);
        setCollectedData(session.collectedData);
        setConversationState(session.conversationState);
        setAnalysisResult(session.analysisResult);
        toast.info('Previous chat session restored');
      } catch (error) {
        console.error('Failed to restore session:', error);
        initializeNewChat();
      }
    } else {
      initializeNewChat();
    }
  }, []);
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01

  // Save session whenever state changes
  useEffect(() => {
    if (messages.length > 0) {
      const session: ChatSession = {
        messages,
        collectedData,
        conversationState,
        analysisResult,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(sessionId.current, JSON.stringify(session));
    }
  }, [messages, collectedData, conversationState, analysisResult]);

<<<<<<< HEAD
  // Save chat to backend when user closes or navigates away
  const saveChatToBackend = async () => {
    if (currentCheckId && isAuthenticated && messages.length > 0) {
      try {
        await symptomCheckApi.updateChatMessages(currentCheckId, messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString(),
        })));
        console.log('Chat history saved successfully');
      } catch (error) {
        console.error('Failed to save chat history:', error);
      }
    }
  };

  // Handle page unload - save chat before leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Save chat synchronously if possible
      if (currentCheckId && isAuthenticated && messages.length > 0) {
        saveChatToBackend();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Save when component unmounts
      saveChatToBackend();
    };
  }, [currentCheckId, isAuthenticated, messages]);

  // Handle close chat button
  const handleCloseChat = async () => {
    const pet = currentPet || selectedPet;
    
    console.log('=== CLOSE CHAT CLICKED ===');
    console.log('Current Check ID:', currentCheckId);
    console.log('Is Authenticated:', isAuthenticated);
    console.log('Messages Count:', messages.length);
    console.log('Pet:', pet);
    
    // Save chat to backend first
    if (currentCheckId && isAuthenticated && messages.length > 0) {
      try {
        const messagesToSave = messages.map(msg => ({
          id: msg.id,
          type: msg.type,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
          image: msg.image,
          options: msg.options,
        }));
        
        console.log('Attempting to save messages:', messagesToSave);
        console.log('Saving to check ID:', currentCheckId);
        
        const response = await symptomCheckApi.updateChatMessages(currentCheckId, messagesToSave);
        
        console.log('Save response:', response);
        console.log('Chat history saved successfully on close');
        toast.success('Chat saved to symptom check history');
        
        // Automatically generate pet health summary after saving chat
        if (pet && pet.id) {
          try {
            console.log('Generating pet health summary for pet:', pet.id);
            await recommendationsApi.generatePetSummary(pet.id);
            console.log('Pet health summary generated successfully');
            toast.success('Health summary generated and saved');
          } catch (summaryError) {
            console.error('Failed to generate pet health summary:', summaryError);
            // Don't show error toast - summary generation is a background operation
            // The user can still manually generate it later from the pet profile
          }
        }
      } catch (error) {
        console.error('Failed to save chat history on close:', error);
        console.error('Error details:', error);
        toast.error('Failed to save chat history');
      }
    } else {
      console.log('Skipping save - Reason:');
      if (!currentCheckId) console.log('  - No currentCheckId');
      if (!isAuthenticated) console.log('  - Not authenticated');
      if (messages.length === 0) console.log('  - No messages');
      
      if (!isAuthenticated) {
        toast.info('Chat closed (not saved - please login to save symptom check history)');
      } else {
        toast.info('Chat closed');
      }
    }
    
    // Clear local session
    localStorage.removeItem(sessionId.current);
    
    console.log('Navigating after close chat. Authenticated:', isAuthenticated, 'Pet:', pet);
    
    // Navigate based on authentication status
    if (isAuthenticated) {
      // Logged-in users go to pet profile page
      if (pet) {
        navigate('/pet-profile', { state: { openPet: pet } });
      } else {
        navigate('/pet-profile');
      }
    } else {
      // Non-logged-in users go to landing page
      navigate('/');
    }
  };

  const initializeNewChat = async () => {
    const pet = currentPet || selectedPet || (pets.length > 0 ? pets[0] : null);
    const petName = pet?.name;
    
    let greeting = petName
      ? `Hi! I'm here to help with ${petName}'s health.`
      : isAuthenticated
      ? `Hi ${user?.name}! I'm here to help with your pet's health.`
      : `Hi! I'm your AI pet health assistant. I can help assess your pet's symptoms.`;
    
    // Add comprehensive pet context information if available
    if (pet) {
      greeting += `\n\n📋 **${petName}'s Profile:**`;
      greeting += `\n• Breed: ${pet.breed}`;
      greeting += `\n• Age: ${pet.age} year${pet.age !== 1 ? 's' : ''} old`;
      greeting += `\n• Gender: ${pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)}`;
      if (pet.weight) {
        greeting += `\n• Weight: ${pet.weight} kg`;
      }
      if (pet.lifestyle) {
        greeting += `\n• Lifestyle: ${pet.lifestyle.charAt(0).toUpperCase() + pet.lifestyle.slice(1)}`;
      }
      
      // Add medical conditions
      if (pet.conditions && pet.conditions.length > 0) {
        greeting += `\n• Known Medical Conditions: ${pet.conditions.join(', ')}`;
      } else {
        greeting += `\n• Known Medical Conditions: None`;
      }
      
      // Add allergies
      if (pet.allergies && pet.allergies.length > 0) {
        greeting += `\n• Known Allergies: ${pet.allergies.join(', ')}`;
      } else {
        greeting += `\n• Known Allergies: None`;
      }
      
      // Fetch and add symptom check history
      try {
        const history = await symptomCheckApi.getPetSymptomChecks(pet.id);
        if (history.length > 0) {
          greeting += `\n\n📜 **Previous Health Checks:** ${history.length} check${history.length > 1 ? 's' : ''} will be included in context`;
          
          // Store history in a way that can be accessed during analysis
          (window as any).__petHealthHistory = history;
        } else {
          greeting += `\n\n📜 **Previous Health Checks:** None recorded yet`;
        }
      } catch (error) {
        console.error('Failed to load symptom check history:', error);
        greeting += `\n\n📜 **Previous Health Checks:** Unable to load history`;
      }
      
      // Add season context
      const currentMonth = new Date().getMonth();
      let season = 'Winter';
      if (currentMonth >= 2 && currentMonth <= 5) {
        season = 'Summer';
      } else if (currentMonth >= 6 && currentMonth <= 8) {
        season = 'Monsoon';
      }
      greeting += `\n\n🌦️ **Current Season:** ${season}`;
      
      greeting += `\n\n**I'll use all this information to provide personalized health recommendations for ${petName}.**`;
      greeting += `\n\nWhat would you like to check today?`;
    } else {
      greeting += ` What would you like to check today?`;
    }
=======
  const initializeNewChat = () => {
    const petName = selectedPet?.name || (pets.length > 0 ? pets[0].name : null);
    const greeting = petName
      ? `Hi! I'm here to help with ${petName}'s health. What would you like to check today?`
      : isAuthenticated
      ? `Hi ${user?.name}! I'm here to help with your pet's health. What would you like to check today?`
      : `Hi! I'm your AI pet health assistant. I can help assess your pet's symptoms. What would you like to check today?`;
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01

    addBotMessage(greeting, [
      { label: '🍖 Nutrition', value: 'Nutrition' },
      { label: '🏃 Exercise', value: 'Exercise' },
      { label: '✂️ Grooming', value: 'Grooming' },
      { label: '⚕️ Health', value: 'Health' },
      { label: '🌦️ Seasonal', value: 'Seasonal' },
    ]);
  };

  const handleNewChat = () => {
    // Clear all state
    localStorage.removeItem(sessionId.current);
    setMessages([]);
    setCollectedData({ images: [] });
    setConversationState('category');
    setAnalysisResult(null);
    setFeedback(null);
    setInputValue('');
    setShowNewChatDialog(false);
    
    // Show warning if not logged in
    if (!isAuthenticated) {
      toast.warning('Chat history cleared - login to save future sessions');
      setShowLoginBanner(true);
    } else {
      toast.success('Started new chat session');
    }
    
    // Initialize new chat
    setTimeout(() => {
      initializeNewChat();
    }, 100);
  };

  const addBotMessage = (content: string, options?: { label: string; value: string; icon?: string }[]) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'bot',
        content,
        options,
        timestamp: new Date(),
      }]);
      setIsTyping(false);
    }, 500);
  };

  const addUserMessage = (content: string, image?: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      content,
      image,
      timestamp: new Date(),
    }]);
  };

  const handleCategorySelect = (category: SymptomCategory) => {
    addUserMessage(category);
    setCollectedData(prev => ({ ...prev, category }));

    if (category === 'Health') {
      setConversationState('subcategory');
      addBotMessage('What type of health concern is it?', 
        HEALTH_SUBCATEGORIES.map(sub => ({ label: sub, value: sub }))
      );
    } else {
      setConversationState('symptoms');
<<<<<<< HEAD
      const pet = currentPet || selectedPet;
      const petName = pet?.name || 'your pet';
=======
      const petName = selectedPet?.name || 'your pet';
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
      addBotMessage(`Please describe what you're observing about ${petName}'s ${category.toLowerCase()}. You can type details and upload photos/videos below.`);
    }
  };

  const handleSubcategorySelect = (subcategory: HealthSubcategory) => {
    addUserMessage(subcategory);
    setCollectedData(prev => ({ ...prev, subcategory }));
    setConversationState('symptoms');
<<<<<<< HEAD
    const pet = currentPet || selectedPet;
    const petName = pet?.name || 'your pet';
=======
    const petName = selectedPet?.name || 'your pet';
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
    addBotMessage(`Please describe the ${subcategory.toLowerCase()} symptoms you're observing in ${petName}. You can type details and upload photos/videos below.`);
  };

  const handleAnalyze = () => {
    if (inputValue.trim().length < 10 && collectedData.images.length === 0 && !collectedData.video) {
      toast.error('Please provide symptom description (min 10 characters) or upload media');
      return;
    }

<<<<<<< HEAD
    let symptomsToAnalyze = '';
    
    if (inputValue.trim().length >= 10) {
      symptomsToAnalyze = inputValue;
      addUserMessage(inputValue);
      setInputValue('');
    }

    // Update state and perform analysis with the current symptoms value
    setCollectedData(prev => ({ ...prev, symptoms: symptomsToAnalyze }));
    performAnalysis(symptomsToAnalyze);
=======
    if (inputValue.trim().length >= 10) {
      addUserMessage(inputValue);
      setCollectedData(prev => ({ ...prev, symptoms: inputValue }));
      setInputValue('');
    }

    performAnalysis();
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    if (collectedData.images.length + files.length > 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }
    
    Array.from(files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 10MB`);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setCollectedData(prev => ({
          ...prev,
          images: [...prev.images, imageData]
        }));
        
        addUserMessage('📷 Photo uploaded', imageData);
        toast.success('Photo uploaded successfully!');
      };
      reader.onerror = () => {
        toast.error('Failed to read image file');
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video size must be less than 50MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setCollectedData(prev => ({ ...prev, video: e.target?.result as string }));
      addUserMessage('🎥 Video uploaded');
      toast.success('Video uploaded successfully!');
    };
    reader.onerror = () => {
      toast.error('Failed to read video file');
    };
    reader.readAsDataURL(file);

    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setCollectedData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    toast.success('Image removed');
  };

  const removeVideo = () => {
    setCollectedData(prev => ({ ...prev, video: undefined }));
    toast.success('Video removed');
  };

  const generateConversationalResponse = (analysis: AnalysisResult, petName: string): string => {
<<<<<<< HEAD
    const { riskLevel, summary, detailedSections, immediateActions } = analysis;
    
    // Create a concise, structured response with minimal spacing
    let response = '';
    
    // Add all detailed sections from AI response (already concise from backend)
    detailedSections.forEach((section, index) => {
      // Add section title
      response += `**${section.title}**\n`;
      
      // Add section points
      section.points.forEach((point, pointIndex) => {
        if (point.trim().startsWith('•')) {
          // Bullet points - no extra spacing
          response += `${point}\n`;
        } else {
          // Regular text - add line break only after, not before next section
          response += `${point}`;
          // Add line break if not the last point in section
          if (pointIndex < section.points.length - 1) {
            response += `\n`;
          }
        }
      });
      
      // Add single line break between sections
      response += `\n`;
    });
    
    // Add disclaimer with minimal spacing
    response += `\n⚕️ **Note:** This is AI-generated guidance. Always consult a veterinarian for diagnosis and treatment.`;
=======
    const { riskLevel, summary, detailedSections, immediateActions, reasoning } = analysis;
    
    let response = `Alright, I've reviewed ${petName}'s symptoms carefully. ${summary}\n\n`;
    
    if (riskLevel === 'Emergency') {
      response += `I need to be direct with you - this is an emergency situation. ${reasoning}\n\n`;
      response += `Here's what you need to do right now:\n`;
      immediateActions.forEach(action => {
        response += `• ${action}\n`;
      });
      response += `\nPlease don't wait on this. Get ${petName} to an emergency vet immediately. Time really matters here.`;
    } else if (riskLevel === 'Urgent') {
      response += `From what you've described, ${petName} needs to see a vet within the next 12-24 hours. ${reasoning}\n\n`;
      response += `Here's what I recommend:\n`;
      immediateActions.forEach(action => {
        response += `• ${action}\n`;
      });
      
      if (detailedSections.length > 0) {
        response += `\n${detailedSections[0].title}:\n`;
        detailedSections[0].points.slice(0, 3).forEach(point => {
          response += `• ${point}\n`;
        });
      }
      
      response += `\nWhile this isn't immediately life-threatening, it's important not to delay. Early treatment often leads to better outcomes for ${petName}.`;
    } else if (riskLevel === 'Monitor') {
      response += `Based on what you've told me, this appears to be something you can monitor at home for now. ${reasoning}\n\n`;
      response += `Here's my advice:\n`;
      immediateActions.forEach(action => {
        response += `• ${action}\n`;
      });
      
      if (detailedSections.length > 0) {
        response += `\n${detailedSections[0].title}:\n`;
        detailedSections[0].points.slice(0, 3).forEach(point => {
          response += `• ${point}\n`;
        });
      }
      
      response += `\nKeep an eye on ${petName} over the next 24-48 hours. If things get worse or new symptoms appear, don't hesitate to contact your vet.`;
    } else {
      response += `Good news - I don't see any immediate concerns with ${petName}. ${reasoning}\n\n`;
      response += `To keep ${petName} healthy:\n`;
      immediateActions.forEach(action => {
        response += `• ${action}\n`;
      });
      
      if (detailedSections.length > 0) {
        response += `\n${detailedSections[0].title}:\n`;
        detailedSections[0].points.slice(0, 3).forEach(point => {
          response += `• ${point}\n`;
        });
      }
      
      response += `\nYou're doing a great job taking care of ${petName}. Keep up with regular checkups and reach out if anything changes.`;
    }
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
    
    return response;
  };

<<<<<<< HEAD
  // Check if clinic is currently open
  const isClinicOpen = (clinic: any): boolean => {
    // 24/7 clinics are always open
    if (clinic.is24Hours || clinic.emergencyServices) {
      return true;
    }
    
    if (!clinic.hours) return false;
    
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    // Check if hours string contains "24" or "24/7"
    const hoursStr = clinic.hours.monday || clinic.hours[dayOfWeek] || '';
    if (hoursStr.toLowerCase().includes('24') || hoursStr.toLowerCase().includes('24/7')) {
      return true;
    }
    
    const todayHours = clinic.hours[dayOfWeek];
    if (!todayHours || todayHours === 'Closed') return false;
    
    // Parse hours like "08:00-18:00"
    const [open, close] = todayHours.split('-');
    return currentTime >= open && currentTime <= close;
  };

  // Fetch nearest emergency clinic
  const fetchNearestEmergencyClinic = async (userLat: number, userLng: number) => {
    try {
      setLoadingClinic(true);
      const providers = await providerApi.searchProviders({
        latitude: userLat,
        longitude: userLng,
        radius: 50, // 50km radius
        type: 'emergency',
        emergencyOnly: true,
      });
      
      if (providers && providers.length > 0) {
        // Find the first open clinic, or just use the nearest one
        const openClinic = providers.find((clinic) => isClinicOpen(clinic));
        const selectedClinic = openClinic || providers[0];
        
        setNearestClinic(selectedClinic);
        return selectedClinic;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch nearest clinic:', error);
      return null;
    } finally {
      setLoadingClinic(false);
    }
  };

  // Fetch emergency vets using Gemini AI - automatically searches for 24/7 or emergency clinics in user's city
  // For emergency situations: Returns ONLY 3 emergency clinics that are currently open
  const fetchEmergencyVets = async (limit: number = 10) => {
    try {
      setLoadingVets(true);
      
      // Get user's city from their profile
      let userCity = null;
      let userPincode = null;
      
      if (isAuthenticated && user) {
        // Try to get city from user's address first
        if (user.address && user.address.city) {
          userCity = user.address.city;
          userPincode = user.address.zipCode;
        } else if (user.location && user.location.city) {
          userCity = user.location.city;
        }
      }
      
      let response;
      
      // If we have a pincode, use that for more accurate results
      if (userPincode) {
        console.log(`Searching for emergency vets by PIN code: ${userPincode}`);
        response = await recommendationsApi.getVetsByPincode(userPincode, limit);
      } else if (userCity) {
        // Use city-based search
        console.log(`Searching for emergency vets in city: ${userCity}`);
        response = await recommendationsApi.getVetsByCity(userCity, limit);
      } else {
        // Fallback to general India search if no user location available
        console.log('No user location found, using general India search');
        response = await recommendationsApi.getVetsByCity('India', limit);
      }
      
      if (response && response.clinics && response.clinics.length > 0) {
        // Convert all clinics to display format
        const allVets = response.clinics
          .map((clinic, index) => ({
            id: `emergency-vet-${index}`,
            name: clinic.name,
            address: clinic.address,
            phone: clinic.phone,
            services: clinic.services,
            hours: clinic.hours ? { monday: clinic.hours } : undefined,
            emergencyServices: true,
            is24Hours: clinic.emergency || clinic.hours?.toLowerCase().includes('24'),
            rating: clinic.rating,
            type: 'veterinary_clinic' as const,
            city: userCity || '',
            state: '',
            zipCode: userPincode || '',
            latitude: 0,
            longitude: 0,
            reviewCount: 0,
            distance: clinic.distance,
            email: undefined,
            website: undefined,
            notes: clinic.notes,
            specialties: clinic.specialties,
          }));
        
        // EMERGENCY FILTERING: Only show emergency clinics that are currently open
        const openEmergencyVets = allVets.filter(vet => {
          // Must be an emergency clinic (24/7 or emergency services)
          const isEmergency = vet.is24Hours || vet.emergencyServices;
          // Must be currently open
          const isOpen = isClinicOpen(vet);
          
          console.log(`Clinic: ${vet.name}, Emergency: ${isEmergency}, Open: ${isOpen}`);
          
          return isEmergency && isOpen;
        });
        
        // LIMIT TO EXACTLY 3 CLINICS for emergency situations
        const limitedVets = openEmergencyVets.slice(0, 3);
        
        console.log(`Total vets from AI: ${allVets.length}`);
        console.log(`Open emergency vets: ${openEmergencyVets.length}`);
        console.log(`Showing (limited to 3): ${limitedVets.length}`);
        console.log('Setting showVetList to true');
        
        setNearbyVets(limitedVets);
        setShowVetList(true);
        return limitedVets;
      }
      
      console.log('No emergency vets found in response');
      return [];
    } catch (error) {
      console.error('Failed to fetch emergency vets:', error);
      return [];
    } finally {
      setLoadingVets(false);
    }
  };

  // Fetch nearby vets using Gemini AI by pin code
  const fetchNearbyVetsByPincode = async (pincode: string, limit: number = 10) => {
    try {
      setLoadingVets(true);
      const response = await recommendationsApi.getVetsByPincode(pincode, limit);
      
      if (response && response.clinics && response.clinics.length > 0) {
        // Convert to format compatible with display
        const vetsForDisplay = response.clinics.map((clinic, index) => ({
          id: `vet-${pincode}-${index}`,
          name: clinic.name,
          address: clinic.address,
          phone: clinic.phone,
          services: clinic.services,
          hours: clinic.hours ? { monday: clinic.hours } : undefined,
          emergencyServices: clinic.emergency,
          is24Hours: clinic.emergency,
          rating: clinic.rating,
          type: 'veterinary_clinic' as const,
          city: '',
          state: '',
          zipCode: pincode,
          latitude: 0,
          longitude: 0,
          reviewCount: 0,
          distance: clinic.distance,
          email: undefined,
          website: undefined,
          notes: clinic.notes,
          specialties: clinic.specialties,
        }));
        
        setNearbyVets(vetsForDisplay);
        return vetsForDisplay;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch vets by pincode:', error);
      toast.error('Failed to load vet recommendations. Please check the pin code and try again.');
      return [];
    } finally {
      setLoadingVets(false);
    }
  };

  // Fetch nearby vets using Gemini AI by city
  const fetchNearbyVetsByCity = async (city: string, limit: number = 10) => {
    try {
      setLoadingVets(true);
      const response = await recommendationsApi.getVetsByCity(city, limit);
      
      if (response && response.clinics && response.clinics.length > 0) {
        // Convert to format compatible with display
        const vetsForDisplay = response.clinics.map((clinic, index) => ({
          id: `vet-${city}-${index}`,
          name: clinic.name,
          address: clinic.address,
          phone: clinic.phone,
          services: clinic.services,
          hours: clinic.hours ? { monday: clinic.hours } : undefined,
          emergencyServices: clinic.emergency,
          is24Hours: clinic.emergency,
          rating: clinic.rating,
          type: 'veterinary_clinic' as const,
          city: city,
          state: '',
          zipCode: '',
          latitude: 0,
          longitude: 0,
          reviewCount: 0,
          distance: clinic.distance,
          email: undefined,
          website: undefined,
          notes: clinic.notes,
          specialties: clinic.specialties,
        }));
        
        setNearbyVets(vetsForDisplay);
        return vetsForDisplay;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch vets by city:', error);
      toast.error('Failed to load vet recommendations. Please try again.');
      return [];
    } finally {
      setLoadingVets(false);
    }
  };

  // Fetch nearby vets using geolocation
  const fetchNearbyVetsByLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return [];
    }

    return new Promise<any[]>((resolve) => {
      setLoadingVets(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const providers = await providerApi.searchProviders({
              latitude,
              longitude,
              radius: 25, // 25km radius
            });

            if (providers && providers.length > 0) {
              // Convert to format compatible with display
              const vetsForDisplay = providers.map((provider, index) => ({
                id: `vet-location-${index}`,
                name: provider.name,
                address: provider.address,
                phone: provider.phone,
                services: [],
                hours: provider.is24Hours ? { monday: '24/7 Open' } : undefined,
                emergencyServices: provider.emergencyServices,
                is24Hours: provider.is24Hours,
                rating: provider.rating || 4.5,
                type: 'veterinary_clinic' as const,
                city: provider.city,
                state: provider.state,
                zipCode: provider.zipCode,
                latitude: provider.latitude,
                longitude: provider.longitude,
                reviewCount: 0,
                distance: provider.distance ? `${provider.distance.toFixed(1)} km` : undefined,
                email: undefined,
                website: undefined,
                notes: undefined,
                specialties: [],
              }));
              
              setNearbyVets(vetsForDisplay);
              resolve(vetsForDisplay);
            } else {
              resolve([]);
            }
          } catch (error) {
            console.error('Failed to fetch nearby vets:', error);
            toast.error('Failed to load nearby clinics.');
            resolve([]);
          } finally {
            setLoadingVets(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Unable to get your location. Please enable location access.');
          setLoadingVets(false);
          resolve([]);
        }
      );
    });
  };

  // Handle user's response to vet search question - now opens modal
  const handleVetSearchResponse = async (wantsVets: boolean) => {
    if (wantsVets) {
      addUserMessage('Yes, show me nearby vets');
      setShowVetSearchModal(true);
    } else {
      addUserMessage('No, thanks');
      addBotMessage('No problem! If you change your mind, you can always search for vets in the Providers section. Is there anything else I can help you with?');
    }
  };

  // Handle vet search from modal
  const handleVetSearchFromModal = async () => {
    if (vetSearchType === 'pincode') {
      if (!modalPincode || modalPincode.length !== 6 || !/^\d{6}$/.test(modalPincode)) {
        toast.error('Please enter a valid 6-digit pin code');
        return;
      }

      addUserMessage(`Search by PIN code: ${modalPincode}`);
      setUserPincode(modalPincode);
      setShowVetSearchModal(false);
      setShowVetList(true);
      setCurrentVetLimit(5);
      
      // Fetch AI-powered vet recommendations by pin code - limit to 5
      const vets = await fetchNearbyVetsByPincode(modalPincode, 5);
      
      if (vets.length > 0) {
        addBotMessage(`I found ${vets.length} reputable veterinary clinic${vets.length > 1 ? 's' : ''} near PIN code ${modalPincode}. These are AI-curated recommendations based on your location:`);
        
        // Enable follow-up questions after showing vets with action buttons
        setTimeout(() => {
          setConversationState('vet_questions');
          addBotMessage('What would you like to do next?', [
            { label: '💬 Ask About These Clinics', value: 'continue_chat' },
            { label: '❌ Close Chat', value: 'close_chat' }
          ]);
        }, 1500);
      } else {
        addBotMessage('I couldn\'t find vet recommendations for this PIN code. Please try a different PIN code or search in the Providers section.');
      }
      
      setModalPincode('');
    } else if (vetSearchType === 'city') {
      if (!modalCity.trim()) {
        toast.error('Please enter a city name');
        return;
      }

      addUserMessage(`Search by city: ${modalCity}`);
      setShowVetSearchModal(false);
      setShowVetList(true);
      setCurrentVetLimit(5);
      
      // Fetch AI-powered vet recommendations by city - limit to 5
      const vets = await fetchNearbyVetsByCity(modalCity.trim(), 5);
      
      if (vets.length > 0) {
        addBotMessage(`I found ${vets.length} reputable veterinary clinic${vets.length > 1 ? 's' : ''} in ${modalCity}. These are AI-curated recommendations:`);
        
        // Enable follow-up questions after showing vets with action buttons
        setTimeout(() => {
          setConversationState('vet_questions');
          addBotMessage('What would you like to do next?', [
            { label: '💬 Ask About These Clinics', value: 'continue_chat' },
            { label: '❌ Close Chat', value: 'close_chat' }
          ]);
        }, 1500);
      } else {
        addBotMessage(`I couldn't find vet recommendations for ${modalCity}. Please try a different city or search in the Providers section.`);
      }
      
      setModalCity('');
    }
  };

  // Handle location-based search from modal
  const handleLocationSearchFromModal = async () => {
    addUserMessage('Use my current location');
    setShowVetSearchModal(false);
    setShowVetList(true);
    
    const vets = await fetchNearbyVetsByLocation();
    
    if (vets.length > 0) {
      addBotMessage(`I found ${vets.length} veterinary clinic${vets.length > 1 ? 's' : ''} near your location. These are sorted by distance:`);
      
      // Enable follow-up questions after showing vets with action buttons
      setTimeout(() => {
        setConversationState('vet_questions');
        addBotMessage('What would you like to do next?', [
          { label: '💬 Ask About These Clinics', value: 'continue_chat' },
          { label: '❌ Close Chat', value: 'close_chat' }
        ]);
      }, 1500);
    } else {
      addBotMessage('I couldn\'t find nearby clinics. Please try searching by PIN code or city, or visit the Providers section.');
    }
  };

  // Handle loading more vets
  const handleLoadMoreVets = async () => {
    if (!userPincode) return;
    
    const newLimit = currentVetLimit + 5;
    setCurrentVetLimit(newLimit);
    
    addUserMessage('Show me more vets');
    const vets = await fetchNearbyVetsByPincode(userPincode, newLimit);
    
    if (vets.length > nearbyVets.length) {
      addBotMessage(`Loaded ${vets.length - nearbyVets.length} more clinic${vets.length - nearbyVets.length > 1 ? 's' : ''}. Showing ${vets.length} total clinics near PIN code ${userPincode}.`);
    } else {
      addBotMessage(`That's all the clinics I could find near PIN code ${userPincode}. Try searching in the Providers section for more options.`);
    }
    
    // Re-enable follow-up questions
    setTimeout(() => {
      setConversationState('vet_questions');
    }, 500);
  };

  // Handle follow-up questions about vets or emergency situation
  const handleFollowUpQuestion = async () => {
    if (!followUpInput.trim()) {
      toast.error('Please enter a question');
      return;
    }

    const question = followUpInput.trim();
    addUserMessage(question);
    setFollowUpInput('');
    setIsAnsweringFollowUp(true);

    try {
      if (conversationState === 'vet_questions' && nearbyVets.length > 0) {
        // For emergency situations with vets shown, handle BOTH vet questions AND situation questions
        
        // Build comprehensive context including both vets and the emergency situation
        const vetsContext = nearbyVets.map((vet, idx) => {
          const vetInfo = [
            `Clinic ${idx + 1}: ${vet.name}`,
            `Address: ${vet.address}`,
            `Phone: ${vet.phone}`,
            `Rating: ${vet.rating}/5.0`,
            `Distance: ${vet.distance || 'Contact for location'}`,
            `Services: ${vet.services?.join(', ') || 'General veterinary care'}`,
            `Specialties: ${(vet as any).specialties?.join(', ') || 'General practice'}`,
            `Emergency Services: ${vet.is24Hours ? '24/7 Available' : vet.emergencyServices ? 'Available' : 'Not available'}`,
            `Hours: ${vet.hours?.monday || 'Contact for hours'}`,
            `Notes: ${(vet as any).notes || 'N/A'}`
          ];
          return vetInfo.join('\n');
        }).join('\n\n');

        // Get the full conversation context for situation-related questions
        const conversationContext = messages
          .map(msg => `${msg.type === 'user' ? 'Pet Owner' : 'Veterinarian'}: ${msg.content}`)
          .join('\n\n');

        // Determine if question is about vets or the situation
        const questionLower = question.toLowerCase();
        const isVetQuestion =
          questionLower.includes('clinic') ||
          questionLower.includes('vet') ||
          questionLower.includes('hospital') ||
          questionLower.includes('which one') ||
          questionLower.includes('best for') ||
          questionLower.includes('recommend') ||
          questionLower.includes('closest') ||
          questionLower.includes('nearest') ||
          questionLower.includes('emergency service') ||
          questionLower.includes('24/7') ||
          questionLower.includes('open now');

        let response;
        if (isVetQuestion) {
          // Use vet-specific API
          response = await recommendationsApi.askAboutVets(
            question,
            userPincode,
            vetsContext
          );
        } else {
          // Use general symptom follow-up API for situation questions
          response = await recommendationsApi.askSymptomFollowup(
            question,
            conversationContext
          );
        }

        addBotMessage(response.answer || 'I apologize, but I couldn\'t generate a proper answer. Could you rephrase your question?');
        
        // Add follow-up prompt with action buttons after question response
        setTimeout(() => {
          addBotMessage('What would you like to do next?', [
            { label: '💬 Ask More Questions', value: 'continue_chat' },
            { label: '❌ Close Chat', value: 'close_chat' }
          ]);
        }, 1000);
      } else if (conversationState === 'general_followup') {
        // Handle general follow-up questions about the symptom analysis
        const conversationContext = messages
          .map(msg => `${msg.type === 'user' ? 'Pet Owner' : 'Veterinarian'}: ${msg.content}`)
          .join('\n\n');

        const response = await recommendationsApi.askSymptomFollowup(
          question,
          conversationContext
        );

        addBotMessage(response.answer || 'I apologize, but I couldn\'t generate a proper answer. Could you rephrase your question?');
        
        // Add follow-up prompt with action buttons after general question response
        setTimeout(() => {
          addBotMessage('What would you like to do next?', [
            { label: '💬 Ask More Questions', value: 'continue_chat' },
            { label: '🏥 Find Veterinary Clinics', value: 'find_vets' },
            { label: '❌ Close Chat', value: 'close_chat' }
          ]);
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to answer follow-up question:', error);
      addBotMessage('I apologize, but I encountered an error while answering your question. Please try again.');
      toast.error('Failed to process your question');
    } finally {
      setIsAnsweringFollowUp(false);
    }
  };

  const performAnalysis = async (symptomsText?: string) => {
    setConversationState('analyzing');
    const pet = currentPet || selectedPet;
    const petName = pet?.name || 'your pet';
    addBotMessage(`Let me take a look at everything you've shared about ${petName}... Give me just a moment.`);
    
    try {
      // Use the passed symptoms or fall back to collectedData
      const symptoms = symptomsText !== undefined ? symptomsText : collectedData.symptoms;
      
      // Prepare the data to send
      const requestData = {
        petId: pet?.id,
        category: collectedData.category!,
        healthSubcategory: collectedData.subcategory,
        symptoms: symptoms || undefined,
        images: collectedData.images || [],
        video: collectedData.video,
      };
      
      console.log('=== FRONTEND SENDING TO BACKEND ===');
      console.log('Request data:', requestData);
      console.log('Symptoms:', requestData.symptoms);
      console.log('Symptoms length:', requestData.symptoms ? requestData.symptoms.length : 0);
      console.log('Images:', requestData.images);
      console.log('Category:', requestData.category);
      console.log('====================================');
      
      // Call the backend API for real AI analysis
      const response = await symptomCheckApi.submitSymptomCheck(requestData);
      
      // Store the check ID for later use
      setCurrentCheckId(response.id);
      console.log('Symptom check saved:', response.id);
      
      // Convert backend response to analysis result format
      const analysis = {
        riskLevel: response.riskLevel,
        summary: response.summary,
        detailedSections: response.detailedSections,
        immediateActions: response.immediateActions,
        reasoning: response.reasoning,
      };
      
      setAnalysisResult(analysis);
      setConversationState('complete');
      
      const conversationalResponse = generateConversationalResponse(analysis, petName);
      addBotMessage(conversationalResponse);
      
      // If emergency, automatically search for emergency vets using Gemini AI
      if (analysis.riskLevel === 'Emergency') {
        // Show searching message and fetch vets
        setTimeout(async () => {
          addBotMessage('🚨 **EMERGENCY DETECTED** - Searching for nearby emergency veterinary clinics that are currently open...');
          
          // Wait a bit for the message to render
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const emergencyVets = await fetchEmergencyVets(10);
          
          console.log('Emergency vets fetched:', emergencyVets.length);
          
          if (emergencyVets && emergencyVets.length > 0) {
            // Wait for state to update before adding message
            await new Promise(resolve => setTimeout(resolve, 300));
            
            addBotMessage(`🚨 **URGENT:** I found ${emergencyVets.length} emergency clinic${emergencyVets.length > 1 ? 's' : ''} that ${emergencyVets.length > 1 ? 'are' : 'is'} **OPEN NOW** with 24/7 emergency services in your area. These clinics can handle emergency cases immediately:`);
            
            // Set conversation state to vet_questions to show the action buttons after vet list
            // Don't add as a message - render as static section after vet list instead
            setTimeout(() => {
              setConversationState('vet_questions');
            }, 1000); // Just set the state, buttons will render after vet list
          } else {
            console.log('No emergency vets found, showing regular options');
            // If no emergency vets found, show regular follow-up options
            setTimeout(() => {
              setConversationState('general_followup');
              addBotMessage('I couldn\'t find emergency clinics that are currently open in your immediate area. Please try searching by PIN code or contact emergency services. What would you like to do next?', [
                { label: '💬 Ask Follow-up Questions', value: 'continue_chat' },
                { label: '🏥 Find Veterinary Clinics', value: 'find_vets' },
                { label: '❌ Close Chat', value: 'close_chat' }
              ]);
            }, 1500);
          }
        }, 1000);
      } else {
        // For non-emergency cases, show normal follow-up options
        setTimeout(() => {
          setConversationState('general_followup');
          addBotMessage('What would you like to do next?', [
            { label: '💬 Ask Follow-up Questions', value: 'continue_chat' },
            { label: '🏥 Find Veterinary Clinics', value: 'find_vets' },
            { label: '❌ Close Chat', value: 'close_chat' }
          ]);
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to analyze symptoms:', error);
      setConversationState('symptoms');
      addBotMessage('I apologize, but I encountered an error while analyzing the symptoms. Please try again or contact support if the issue persists.');
      toast.error('Failed to analyze symptoms. Please try again.');
    }
  };

  const handleFeedback = async (type: 'up' | 'down') => {
    setFeedback(type);
    
    // Save feedback to backend if we have a check ID
    if (currentCheckId && isAuthenticated) {
      try {
        await symptomCheckApi.submitFeedback(currentCheckId, type);
      } catch (error) {
        console.error('Failed to save feedback:', error);
      }
    }
    
    if (type === 'up') {
      toast.success('Thank you for your feedback!');
      const pet = currentPet || selectedPet;
      const petName = pet?.name || 'your pet';
      addBotMessage(`I'm glad I could help with ${petName}! If you have any other concerns, feel free to start a new check anytime.`);
      
      // Note: Messages will be saved after the bot message is added (see useEffect below)
=======
  const performAnalysis = async () => {
    setConversationState('analyzing');
    const petName = selectedPet?.name || 'your pet';
    addBotMessage(`Let me take a look at everything you've shared about ${petName}... Give me just a moment.`);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const analysis = analyzeSymptoms(
      collectedData.symptoms || '',
      collectedData.images,
      collectedData.category!,
      collectedData.subcategory,
      collectedData.video
    );
    
    setAnalysisResult(analysis);
    setConversationState('complete');
    
    const conversationalResponse = generateConversationalResponse(analysis, petName);
    addBotMessage(conversationalResponse);
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    if (type === 'up') {
      toast.success('Thank you for your feedback!');
      const petName = selectedPet?.name || 'your pet';
      addBotMessage(`I'm glad I could help with ${petName}! If you have any other concerns, feel free to start a new check anytime.`);
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
    } else {
      addBotMessage('I appreciate your honesty. What could I have done better to help you? Please select the main issue:', [
        { label: 'UI issue', value: 'ui_issue' },
        { label: 'Poor image understanding', value: 'poor_image' },
        { label: 'Poor video understanding', value: 'poor_video' },
        { label: 'Poor context understanding', value: 'poor_context' },
        { label: 'Was factually incorrect', value: 'factually_incorrect' },
        { label: 'Did not follow instructions', value: 'no_instructions' },
        { label: 'Incomplete response', value: 'incomplete' },
        { label: 'Harmful or abusive content', value: 'harmful' },
        { label: 'Other', value: 'other' },
      ]);
    }
  };

<<<<<<< HEAD
  // Save messages after feedback is given and bot response is added
  useEffect(() => {
    if (feedback && currentCheckId && isAuthenticated && messages.length > 0) {
      // Wait a bit to ensure the last bot message is in the messages array
      const timer = setTimeout(async () => {
        try {
          console.log('Auto-saving messages after feedback...');
          await symptomCheckApi.updateChatMessages(currentCheckId, messages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp.toISOString(),
          })));
          console.log('Messages auto-saved successfully after feedback');
        } catch (error) {
          console.error('Failed to auto-save chat messages after feedback:', error);
        }
      }, 1000); // Wait 1 second for bot message to be added

      return () => clearTimeout(timer);
    }
  }, [feedback, messages, currentCheckId, isAuthenticated]);

  const handleFeedbackReason = async (reason: string) => {
=======
  const handleFeedbackReason = (reason: string) => {
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
    // Map the reason value to a readable label
    const reasonLabels: Record<string, string> = {
      'ui_issue': 'UI issue',
      'poor_image': 'Poor image understanding',
      'poor_video': 'Poor video understanding',
      'poor_context': 'Poor context understanding',
      'factually_incorrect': 'Was factually incorrect',
      'no_instructions': 'Did not follow instructions',
      'incomplete': 'Incomplete response',
      'harmful': 'Harmful or abusive content',
      'other': 'Other',
    };

    addUserMessage(reasonLabels[reason] || reason);
    toast.success('Thank you for helping us improve!');
<<<<<<< HEAD
    
    // Save feedback reason to backend
    if (currentCheckId && isAuthenticated) {
      try {
        await symptomCheckApi.submitFeedback(currentCheckId, 'down', reasonLabels[reason]);
        // Save complete chat history
        await symptomCheckApi.updateChatMessages(currentCheckId, messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString(),
        })));
      } catch (error) {
        console.error('Failed to save feedback reason:', error);
      }
    }
    
=======
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
    addBotMessage('Thanks for that feedback - it really helps me improve. Would you like to start a new health check or head back home?', [
      { label: '🔄 New Check', value: 'restart' },
      { label: '🏠 Go Home', value: 'home' },
    ]);
  };

  const handleOptionClick = (value: string) => {
    if (conversationState === 'category') {
      handleCategorySelect(value as SymptomCategory);
    } else if (conversationState === 'subcategory') {
      handleSubcategorySelect(value as HealthSubcategory);
    } else if (conversationState === 'complete' && feedback === 'down') {
      handleFeedbackReason(value);
<<<<<<< HEAD
    } else if (value === 'show_vets') {
      handleVetSearchResponse(true);
    } else if (value === 'no_vets') {
      handleVetSearchResponse(false);
    } else if (value === 'find_vets') {
      addUserMessage('Find nearby vets');
      setShowVetSearchModal(true);
    } else if (value === 'continue_chat') {
      addUserMessage('I have follow-up questions');
      // The follow-up input area will automatically show since conversationState is already 'general_followup'
    } else if (value === 'close_chat') {
      // Show feedback dialog before closing
      setShowCloseChatDialog(true);
=======
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
    } else if (value === 'restart') {
      setShowNewChatDialog(true);
    } else if (value === 'home') {
      navigate('/');
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
<<<<<<< HEAD
      case 'Emergency': return 'bg-red-600';
=======
      case 'Emergency': return 'bg-red-500';
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
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

<<<<<<< HEAD
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate dummy 24/7 appointment slots for the next 7 days
  const generateAppointmentSlots = () => {
    const slots = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      
      slots.push({
        date: dateStr,
        displayDate: dayName,
        times: [
          '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
          '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
          '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
          '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
        ]
      });
    }
    
    return slots;
  };

  const handleBookAppointment = (vet: any) => {
    setSelectedVetForBooking(vet);
    setSelectedDate('');
    setSelectedTime('');
    setShowBookingModal(true);
  };

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select both date and time');
      return;
    }

    // Show success message
    toast.success('Appointment booked and health summary sent!');
    
    // Close modal
    setShowBookingModal(false);
    
    // Reset selections
    setSelectedVetForBooking(null);
    setSelectedDate('');
    setSelectedTime('');
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

=======
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Fixed Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 flex-shrink-0">
<<<<<<< HEAD
        <Button variant="ghost" size="icon" onClick={() => {
          // Navigate to pet profile if authenticated, otherwise to landing page
          if (isAuthenticated) {
            navigate('/pet-profile');
          } else {
            navigate('/');
          }
        }}>
=======
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-[#FF385C]" />
          <h1 className="text-lg font-bold">AI Health Check</h1>
        </div>
<<<<<<< HEAD
        {(currentPet || selectedPet) && (
          <Badge variant="secondary" className="ml-auto flex items-center gap-1">
            <PawPrint className="w-3 h-3" />
            {(currentPet || selectedPet)?.name}
          </Badge>
        )}
        {pets.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPetSelector(true)}
            className="ml-2"
          >
            Change Pet
          </Button>
        )}
=======
        {selectedPet && (
          <Badge variant="secondary" className="ml-auto">
            {selectedPet.name}
          </Badge>
        )}
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
        {messages.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewChatDialog(true)}
            className="ml-2"
          >
            New Chat
          </Button>
        )}
<<<<<<< HEAD
        
        {/* User Profile Dropdown */}
        {isAuthenticated && user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 hover:bg-gray-100 ml-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[#FF385C] text-white">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden md:inline">{user.name}</span>
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
=======
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
      </header>

      {/* Login Banner */}
      {!isAuthenticated && showLoginBanner && (
        <Alert className="mx-4 mt-3 border-[#FF385C]/20 bg-[#FF385C]/5 flex-shrink-0">
          <LogIn className="h-4 w-4 text-[#FF385C]" />
          <AlertDescription className="text-xs flex items-center justify-between">
            <span>
              <strong>Login to save your chat history!</strong> Your recommendations will be lost if you're not logged in.
            </span>
            <div className="flex gap-2 ml-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/login')}
                className="h-7 text-xs"
              >
                Login
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowLoginBanner(false)}
                className="h-7 w-7 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Analysis Summary */}
      {analysisResult && (
<<<<<<< HEAD
        <div className={`bg-white border-b px-4 py-3 flex-shrink-0 ${analysisResult.riskLevel === 'Emergency' ? 'animate-pulse' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              {analysisResult.riskLevel === 'Emergency' && (
                <div className={`w-12 h-12 rounded-full ${getRiskColor(analysisResult.riskLevel)} flex items-center justify-center flex-shrink-0 animate-ping absolute`}>
                  {React.createElement(getRiskIcon(analysisResult.riskLevel), { className: 'w-6 h-6 text-white' })}
                </div>
              )}
              <div className={`w-12 h-12 rounded-full ${getRiskColor(analysisResult.riskLevel)} flex items-center justify-center flex-shrink-0 relative`}>
                {React.createElement(getRiskIcon(analysisResult.riskLevel), { className: 'w-6 h-6 text-white' })}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-bold ${analysisResult.riskLevel === 'Emergency' ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
                {analysisResult.riskLevel}
              </h3>
=======
        <div className="bg-white border-b px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${getRiskColor(analysisResult.riskLevel)} flex items-center justify-center flex-shrink-0`}>
              {React.createElement(getRiskIcon(analysisResult.riskLevel), { className: 'w-6 h-6 text-white' })}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900">{analysisResult.riskLevel}</h3>
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
              <p className="text-sm text-gray-600 line-clamp-2">{analysisResult.summary}</p>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <Alert className="mx-4 mt-3 border-[#FF385C]/20 bg-[#FF385C]/5 flex-shrink-0">
        <AlertCircle className="h-4 w-4 text-[#FF385C]" />
        <AlertDescription className="text-xs">
          <strong>AI-generated guidance only.</strong> Always consult a vet for diagnosis. In emergencies, seek immediate care.
        </AlertDescription>
      </Alert>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.type === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-[#FF385C] flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
              <div className={`rounded-2xl px-4 py-2 ${
                message.type === 'user' 
                  ? 'bg-[#FF385C] text-white' 
                  : 'bg-white border border-gray-200'
              }`}>
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                {message.image && (
                  <div className="mt-2 rounded-lg overflow-hidden">
                    <img src={message.image} alt="Uploaded" className="max-w-full h-auto max-h-48 object-cover" />
                  </div>
                )}
              </div>
              {message.options && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {message.options.map((option, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => handleOptionClick(option.value)}
                      className="text-xs"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            {message.type === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2 justify-start">
            <div className="w-8 h-8 rounded-full bg-[#FF385C] flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

<<<<<<< HEAD
        {/* Nearby Vets List - AI-powered recommendations */}
        {showVetList && nearbyVets.length > 0 && (
          <div className="space-y-2">
            {nearbyVets.map((vet, index) => (
              <Card key={vet.id} className="border-gray-300">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FF385C] flex items-center justify-center flex-shrink-0 text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Two-column layout */}
                      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4">
                        {/* Left Column - Generic Details */}
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h3 className="text-base font-bold text-gray-900">{vet.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                {vet.rating && (
                                  <span>⭐ {vet.rating.toFixed(1)} / 5.0</span>
                                )}
                                {vet.distance && (
                                  <span>• 📍 {vet.distance}</span>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedVetId(expandedVetId === vet.id ? null : vet.id)}
                              className="flex-shrink-0 md:hidden"
                            >
                              {expandedVetId === vet.id ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3 text-gray-500 flex-shrink-0" />
                              <p className="text-xs text-gray-600 line-clamp-2">{vet.address}</p>
                            </div>
                            {vet.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3 text-gray-500 flex-shrink-0" />
                                <a
                                  href={`tel:${vet.phone}`}
                                  className="text-xs text-[#FF385C] hover:text-[#E31C5F] underline"
                                >
                                  {vet.phone}
                                </a>
                              </div>
                            )}
                            {vet.is24Hours && (
                              <Badge className="bg-green-600 text-white text-xs">
                                🟢 24/7 Emergency Services
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Right Column - Action Buttons */}
                        <div className="flex flex-col gap-2 md:min-w-[180px]">
                          <Button
                            onClick={() => {
                              const address = encodeURIComponent(vet.address);
                              window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
                            }}
                            className="bg-[#FF385C] hover:bg-[#E31C5F] w-full"
                            size="sm"
                          >
                            <Navigation className="w-3 h-3 mr-1" />
                            Directions
                          </Button>
                          <Button
                            onClick={() => handleBookAppointment(vet)}
                            className="bg-green-600 hover:bg-green-700 w-full text-xs"
                            size="sm"
                          >
                            📅 Book Appointment & Send Health Summary
                          </Button>
                        </div>
                      </div>
                      
                      {/* Collapsed view - no longer needed as buttons are always visible */}
                      
                      {/* Expanded view - additional details */}
                      {expandedVetId === vet.id && (
                        <div className="space-y-3 mt-3 pt-3 border-t">
                          {/* Services */}
                          {vet.services && vet.services.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-1">Services:</p>
                              <div className="flex flex-wrap gap-1">
                                {vet.services.slice(0, 5).map((service: string, idx: number) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {service}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Specialties */}
                          {(vet as any).specialties && (vet as any).specialties.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-1">Specialties:</p>
                              <div className="flex flex-wrap gap-1">
                                {(vet as any).specialties.map((specialty: string, idx: number) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {specialty}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Hours */}
                          {vet.hours && (
                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-1">Hours:</p>
                              <p className="text-xs text-gray-600">{vet.hours.monday || 'Contact for hours'}</p>
                            </div>
                          )}
                          
                          {/* Notes */}
                          {(vet as any).notes && (
                            <div>
                              <p className="text-xs text-gray-600 italic">{(vet as any).notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Load More Button */}
            {nearbyVets.length >= currentVetLimit && (
              <div className="flex justify-center pt-2">
                <Button
                  onClick={handleLoadMoreVets}
                  disabled={loadingVets}
                  variant="outline"
                  className="w-full"
                >
                  {loadingVets ? 'Loading...' : 'Load More Vets'}
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Action Buttons for Emergency Vet Questions - Appears AFTER vet list */}
        {conversationState === 'vet_questions' && showVetList && nearbyVets.length > 0 && (
=======
        {/* Feedback Section */}
        {analysisResult && conversationState === 'complete' && !feedback && (
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
          <div className="flex gap-2 justify-start">
            <div className="w-8 h-8 rounded-full bg-[#FF385C] flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="max-w-[80%]">
              <Card className="border-gray-300">
                <CardContent className="p-3">
<<<<<<< HEAD
                  <p className="text-sm font-medium mb-2">What would you like to do next?</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOptionClick('continue_chat')}
                      className="text-xs"
                    >
                      💬 Ask About These Clinics
=======
                  <p className="text-sm font-medium mb-2">Was this assessment helpful?</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFeedback('up')}
                      className="flex-1"
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      Yes
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
<<<<<<< HEAD
                      onClick={() => handleOptionClick('close_chat')}
                      className="text-xs"
                    >
                      ❌ Close Chat
=======
                      onClick={() => handleFeedback('down')}
                      className="flex-1"
                    >
                      <ThumbsDown className="w-4 h-4 mr-1" />
                      No
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
<<<<<<< HEAD
        
        {/* Loading vets indicator */}
        {loadingVets && (
          <div className="px-4">
            <Card className="border-gray-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-[#FF385C] animate-pulse" />
                  <p className="text-sm font-medium text-gray-900">Finding nearby veterinary clinics...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Feedback Section - Only show after vets are displayed for emergency cases */}
        {analysisResult && conversationState === 'complete' && !feedback && (
          // For emergency cases, only show feedback after vets are displayed
          // For non-emergency cases, show feedback immediately
          (analysisResult.riskLevel !== 'Emergency' || (showVetList && nearbyVets.length > 0)) && (
            <div className="flex gap-2 justify-start">
              <div className="w-8 h-8 rounded-full bg-[#FF385C] flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="max-w-[80%]">
                <Card className="border-gray-300">
                  <CardContent className="p-3">
                    <p className="text-sm font-medium mb-2">Was this assessment helpful?</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFeedback('up')}
                        className="flex-1"
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Yes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFeedback('down')}
                        className="flex-1"
                      >
                        <ThumbsDown className="w-4 h-4 mr-1" />
                        No
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )
        )}

        {/* Close Chat Button - appears after feedback */}
        {analysisResult && conversationState === 'complete' && feedback && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleCloseChat}
              className="min-w-[200px]"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Close Chat
=======

        {/* Emergency CTA */}
        {analysisResult && analysisResult.riskLevel === 'Emergency' && (
          <div className="flex justify-center">
            <Button
              onClick={() => navigate('/providers')}
              className="bg-red-600 hover:bg-red-700"
            >
              Find Nearest Emergency Vet
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
            </Button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

<<<<<<< HEAD
      {/* Vet Search Modal - Matching Welcome Page Style */}
      <Dialog open={showVetSearchModal} onOpenChange={setShowVetSearchModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Find Nearby Veterinary Clinics</DialogTitle>
            <DialogDescription>
              Search for veterinary clinics using PIN code or city name
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={vetSearchType} onValueChange={(value) => setVetSearchType(value as 'pincode' | 'city')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pincode">By PIN Code</TabsTrigger>
              <TabsTrigger value="city">By City Name</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pincode" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="modal-pincode">Enter 6-digit PIN Code</Label>
                <Input
                  id="modal-pincode"
                  placeholder="e.g., 400001, 700001, 110001"
                  value={modalPincode}
                  onChange={(e) => setModalPincode(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  className="h-12"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && modalPincode.length === 6) {
                      handleVetSearchFromModal();
                    }
                  }}
                />
                <p className="text-xs text-gray-500">
                  Enter a valid Indian PIN code to find nearby clinics
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="city" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="modal-city">Enter City Name</Label>
                <Input
                  id="modal-city"
                  placeholder="e.g., Mumbai, Delhi, Bangalore, Chennai"
                  value={modalCity}
                  onChange={(e) => setModalCity(e.target.value)}
                  className="h-12"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && modalCity.trim()) {
                      handleVetSearchFromModal();
                    }
                  }}
                />
                <p className="text-xs text-gray-500">
                  Enter any city name in India to find veterinary clinics
                </p>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowVetSearchModal(false);
                setModalPincode('');
                setModalCity('');
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleVetSearchFromModal}
              disabled={vetSearchType === 'pincode' ? modalPincode.length !== 6 : !modalCity.trim()}
              className="bg-[#FF385C] hover:bg-[#E31C5F]"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {vetSearchType === 'pincode' ? 'Search by PIN Code' : 'Search by City'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Appointment Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book Appointment & Send Summary</DialogTitle>
            <DialogDescription>
              {selectedVetForBooking && (
                <div className="mt-2">
                  <p className="font-semibold text-gray-900">{selectedVetForBooking.name}</p>
                  <p className="text-sm text-gray-600">{selectedVetForBooking.address}</p>
                  <Badge className="mt-2 bg-green-600 text-white">
                    🟢 24/7 Emergency Services Available
                  </Badge>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Date Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Select Date</Label>
              <div className="grid grid-cols-2 gap-2">
                {generateAppointmentSlots().map((slot) => (
                  <Button
                    key={slot.date}
                    variant={selectedDate === slot.date ? 'default' : 'outline'}
                    className={selectedDate === slot.date ? 'bg-[#FF385C] hover:bg-[#E31C5F]' : ''}
                    onClick={() => {
                      setSelectedDate(slot.date);
                      setSelectedTime(''); // Reset time when date changes
                    }}
                  >
                    {slot.displayDate}
                  </Button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Select Time (24/7 Available)</Label>
                <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto p-2 border rounded">
                  {generateAppointmentSlots()
                    .find(slot => slot.date === selectedDate)
                    ?.times.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? 'default' : 'outline'}
                        size="sm"
                        className={selectedTime === time ? 'bg-[#FF385C] hover:bg-[#E31C5F]' : ''}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                </div>
              </div>
            )}

            {/* Selected Appointment Summary */}
            {selectedDate && selectedTime && (
              <Alert className="border-green-600 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-sm">
                  <strong>Appointment:</strong> {generateAppointmentSlots().find(s => s.date === selectedDate)?.displayDate} at {selectedTime}
                  <br />
                  <strong>Health Summary:</strong> Will be sent to the clinic
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowBookingModal(false);
                setSelectedVetForBooking(null);
                setSelectedDate('');
                setSelectedTime('');
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmBooking}
              disabled={!selectedDate || !selectedTime}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Follow-up Questions Input Area - for both general and vet questions */}
      {(conversationState === 'general_followup' || (conversationState === 'vet_questions' && nearbyVets.length > 0)) && (
        <div className="bg-white border-t px-4 py-3 flex-shrink-0">
          <Label htmlFor="followup" className="text-sm font-medium mb-2 block">
            {conversationState === 'vet_questions'
              ? 'Ask me about the situation or the veterinary clinics:'
              : 'Ask me any follow-up questions:'}
          </Label>
          <div className="flex gap-2">
            <Textarea
              id="followup"
              value={followUpInput}
              onChange={(e) => setFollowUpInput(e.target.value)}
              placeholder={
                conversationState === 'vet_questions'
                  ? "e.g., What should I do while traveling to the clinic? Which clinic is best for this emergency? What symptoms should I monitor?"
                  : "e.g., What should I watch for? How long until I see improvement? Should I change their diet?"
              }
              className="resize-none text-sm flex-1"
              rows={2}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleFollowUpQuestion();
                }
              }}
              disabled={isAnsweringFollowUp}
            />
            <Button
              onClick={handleFollowUpQuestion}
              disabled={!followUpInput.trim() || isAnsweringFollowUp}
              className="bg-[#FF385C] hover:bg-[#E31C5F] self-end"
            >
              {isAnsweringFollowUp ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                  Thinking...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1" />
                  Ask
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {conversationState === 'vet_questions'
              ? 'Ask about the emergency situation, immediate care steps, or questions about the veterinary clinics (services, specialties, which is best, etc.)'
              : 'Ask any questions about the assessment, symptoms, care instructions, or request nearby vet recommendations'}
          </p>
        </div>
      )}

      {/* Combined Input Area with Media Upload */}
      {conversationState === 'symptoms' && !showPincodeInput && (
=======
      {/* Combined Input Area with Media Upload */}
      {conversationState === 'symptoms' && (
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
        <div className="bg-white border-t px-4 py-3 flex-shrink-0">
          {/* Uploaded Media Preview */}
          {(collectedData.images.length > 0 || collectedData.video) && (
            <div className="mb-3 flex flex-wrap gap-2">
              {collectedData.images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img src={img} alt={`Upload ${idx + 1}`} className="w-16 h-16 object-cover rounded border" />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {collectedData.video && (
                <div className="relative">
                  <div className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center">
                    <Video className="w-6 h-6 text-gray-600" />
                  </div>
                  <button
                    onClick={removeVideo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Text Input */}
          <div className="flex gap-2 mb-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Describe the symptoms in detail..."
              className="resize-none text-sm"
              rows={2}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAnalyze();
                }
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={collectedData.images.length >= 3}
              className="flex-1"
            >
              <ImageIcon className="w-4 h-4 mr-1" />
              Photo ({collectedData.images.length}/3)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => videoInputRef.current?.click()}
              disabled={!!collectedData.video}
              className="flex-1"
            >
              <Video className="w-4 h-4 mr-1" />
              Video
            </Button>
            <Button
              onClick={handleAnalyze}
              disabled={inputValue.trim().length < 10 && collectedData.images.length === 0 && !collectedData.video}
              className="bg-[#FF385C] hover:bg-[#E31C5F] flex-1"
              size="sm"
            >
              <Send className="w-4 h-4 mr-1" />
              Analyze
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            {inputValue.length}/500 characters (min 10 required if no media)
          </p>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        className="hidden"
      />

      {/* New Chat Confirmation Dialog */}
      <AlertDialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start New Chat?</AlertDialogTitle>
            <AlertDialogDescription>
              {isAuthenticated 
                ? 'Your current chat session will be cleared. Are you sure you want to start a new chat?'
                : 'You are not logged in. Your current chat history and recommendations will be permanently lost. Are you sure you want to continue?'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleNewChat} className="bg-[#FF385C] hover:bg-[#E31C5F]">
              Start New Chat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
<<<<<<< HEAD

      {/* Close Chat Feedback Dialog */}
      <AlertDialog open={showCloseChatDialog} onOpenChange={setShowCloseChatDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Before You Go...</AlertDialogTitle>
            <AlertDialogDescription>
              How was your experience with the AI Health Check? Your feedback helps us improve!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <Button
              onClick={() => {
                setShowCloseChatDialog(false);
                addUserMessage('Positive feedback - closing chat');
                handleFeedback('up');
                // Close after a short delay to allow feedback to be saved
                setTimeout(() => {
                  handleCloseChat();
                }, 1000);
              }}
              className="bg-green-600 hover:bg-green-700 h-12"
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Helpful - Close Chat
            </Button>
            <Button
              onClick={() => {
                setShowCloseChatDialog(false);
                addUserMessage('Negative feedback - closing chat');
                handleFeedback('down');
                // The feedback flow will handle showing options, then we close
                setTimeout(() => {
                  handleCloseChat();
                }, 2000);
              }}
              variant="outline"
              className="border-orange-600 text-orange-600 hover:bg-orange-50 h-12"
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Not Helpful - Close Chat
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowCloseChatDialog(false);
                addUserMessage('Close chat without feedback');
                handleCloseChat();
              }}
            >
              Skip & Close Chat
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pet Selector Dialog */}
      <AlertDialog open={showPetSelector} onOpenChange={setShowPetSelector}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Select Pet for Health Check</AlertDialogTitle>
            <AlertDialogDescription>
              Choose from your saved pets or continue without a pet profile
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-2 py-4">
            {pets.map((pet) => (
              <Button
                key={pet.id}
                variant="outline"
                className="justify-start h-auto py-3"
                onClick={() => {
                  // Clear previous session
                  localStorage.removeItem(sessionId.current);
                  setMessages([]);
                  setCollectedData({ images: [] });
                  setConversationState('category');
                  setAnalysisResult(null);
                  setFeedback(null);
                  setInputValue('');
                  
                  // Set new pet
                  setCurrentPet(pet);
                  selectPet(pet.id);
                  setShowPetSelector(false);
                  toast.success(`Health check for ${pet.name}`);
                  
                  // Initialize new chat with selected pet's context
                  setTimeout(async () => {
                    const petName = pet.name;
                    
                    let greeting = `Hi! I'm here to help with ${petName}'s health.`;
                    
                    // Add comprehensive pet context information
                    greeting += `\n\n📋 **${petName}'s Profile:**`;
                    greeting += `\n• Breed: ${pet.breed}`;
                    greeting += `\n• Age: ${pet.age} year${pet.age !== 1 ? 's' : ''} old`;
                    greeting += `\n• Gender: ${pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)}`;
                    if (pet.weight) {
                      greeting += `\n• Weight: ${pet.weight} kg`;
                    }
                    if (pet.lifestyle) {
                      greeting += `\n• Lifestyle: ${pet.lifestyle.charAt(0).toUpperCase() + pet.lifestyle.slice(1)}`;
                    }
                    
                    // Add medical conditions
                    if (pet.conditions && pet.conditions.length > 0) {
                      greeting += `\n• Known Medical Conditions: ${pet.conditions.join(', ')}`;
                    } else {
                      greeting += `\n• Known Medical Conditions: None`;
                    }
                    
                    // Add allergies
                    if (pet.allergies && pet.allergies.length > 0) {
                      greeting += `\n• Known Allergies: ${pet.allergies.join(', ')}`;
                    } else {
                      greeting += `\n• Known Allergies: None`;
                    }
                    
                    // Fetch and add symptom check history
                    try {
                      const history = await symptomCheckApi.getPetSymptomChecks(pet.id);
                      if (history.length > 0) {
                        greeting += `\n\n📜 **Previous Health Checks:** ${history.length} check${history.length > 1 ? 's' : ''} will be included in context`;
                        
                        // Store history in a way that can be accessed during analysis
                        (window as any).__petHealthHistory = history;
                      } else {
                        greeting += `\n\n📜 **Previous Health Checks:** None recorded yet`;
                      }
                    } catch (error) {
                      console.error('Failed to load symptom check history:', error);
                      greeting += `\n\n📜 **Previous Health Checks:** Unable to load history`;
                    }
                    
                    // Add season context
                    const currentMonth = new Date().getMonth();
                    let season = 'Winter';
                    if (currentMonth >= 2 && currentMonth <= 5) {
                      season = 'Summer';
                    } else if (currentMonth >= 6 && currentMonth <= 8) {
                      season = 'Monsoon';
                    }
                    greeting += `\n\n🌦️ **Current Season:** ${season}`;
                    
                    greeting += `\n\n**I'll use all this information to provide personalized health recommendations for ${petName}.**`;
                    greeting += `\n\nWhat would you like to check today?`;

                    addBotMessage(greeting, [
                      { label: '🍖 Nutrition', value: 'Nutrition' },
                      { label: '🏃 Exercise', value: 'Exercise' },
                      { label: '✂️ Grooming', value: 'Grooming' },
                      { label: '⚕️ Health', value: 'Health' },
                      { label: '🌦️ Seasonal', value: 'Seasonal' },
                    ]);
                  }, 100);
                }}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-full bg-[#FF385C] flex items-center justify-center text-white font-bold">
                    {pet.name.charAt(0)}
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold">{pet.name}</div>
                    <div className="text-xs text-gray-500">{pet.breed} • {pet.age} years</div>
                  </div>
                </div>
              </Button>
            ))}
            
            {/* Option to continue without selecting a pet */}
            <Button
              variant="outline"
              className="justify-start h-auto py-3 border-dashed"
              onClick={() => {
                setShowPetSelector(false);
                setCurrentPet(null);
                toast.info('Starting health check without pet profile');
                setTimeout(() => {
                  initializeNewChat();
                }, 100);
              }}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <PawPrint className="w-5 h-5 text-gray-500" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold">Other Pet</div>
                  <div className="text-xs text-gray-500">Continue without saved profile</div>
                </div>
              </div>
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
=======
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
    </div>
  );
};

export default SymptomChecker;