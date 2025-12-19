import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PawPrint, Zap, Heart, Shield, Camera, MapPin, Bell, Star, Stethoscope, Play, Mail, BookOpen, Facebook, Twitter, Instagram, Youtube, Phone, MapPinIcon, HelpCircle, Users, Navigation, Microscope, ArrowRight, LogOut, User, Home, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getUserLocation, getOpenProvidersNearby } from '@/utils/providerUtils';
import { MOCK_PROVIDERS } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [isLoadingVets, setIsLoadingVets] = useState(false);
  const [isLoadingDiagnostics, setIsLoadingDiagnostics] = useState(false);
  const [showPincodeDialog, setShowPincodeDialog] = useState(false);
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [searchType, setSearchType] = useState<'pincode' | 'city'>('pincode');

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success('Signed out successfully');
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

  const features = [
    {
      icon: Zap,
      text: '24/7 AI-powered symptom checker with instant guidance',
    },
    {
      icon: Camera,
      text: 'Upload photos & videos for accurate health assessment',
    },
    {
      icon: MapPin,
      text: 'India-specific care based on breed, climate & location',
    },
    {
      icon: Shield,
      text: 'Privacy-first: Your pet\'s data stays on your device',
    },
    {
      icon: Heart,
      text: 'Emergency vet finder with 24/7 clinic locations',
    },
    {
      icon: Bell,
      text: 'Personalized health alerts for your pet\'s needs',
    },
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      location: 'Mumbai',
      platform: 'Google Reviews',
      rating: 5,
      text: 'Saved me a panic trip to the vet at 2 AM! The AI correctly identified my Labrador\'s symptoms as non-emergency.',
      initials: 'PS',
    },
    {
      name: 'Rajesh Kumar',
      location: 'Bangalore',
      platform: 'Twitter',
      rating: 5,
      text: 'Finally, an app that understands Indian climate and breeds! The monsoon tick alerts were spot on.',
      initials: 'RK',
    },
    {
      name: 'Ananya Desai',
      location: 'Delhi',
      platform: 'Facebook',
      rating: 5,
      text: 'The breed-specific recommendations are amazing. As a Golden Retriever parent, the hip dysplasia tips have been invaluable.',
      initials: 'AD',
    },
    {
      name: 'Vikram Patel',
      location: 'Pune',
      platform: 'Google Reviews',
      rating: 5,
      text: 'Love that my pet\'s data stays private on my device. The emergency vet finder helped me locate a 24/7 clinic instantly!',
      initials: 'VP',
    },
  ];

  const articles = [
    {
      title: 'Monsoon Pet Care: Essential Tips for Mumbai & Coastal Cities',
      category: 'Seasonal Care',
      region: 'Coastal India',
      date: '2 days ago',
    },
    {
      title: 'Summer Heatstroke Prevention for Dogs in North India',
      category: 'Weather Alert',
      region: 'North India',
      date: '1 week ago',
    },
    {
      title: 'Tick & Flea Prevention During Rainy Season',
      category: 'Health Guide',
      region: 'All India',
      date: '2 weeks ago',
    },
  ];

  const breedTutorials = [
    {
      breed: 'Labrador Retriever',
      topics: ['Hip Dysplasia Care', 'Weight Management', 'Exercise Needs'],
      popularity: 'Most Popular',
    },
    {
      breed: 'Indian Pariah Dog',
      topics: ['Hardy Breed Care', 'Local Adaptation', 'Minimal Grooming'],
      popularity: 'Indigenous',
    },
    {
      breed: 'German Shepherd',
      topics: ['Joint Health', 'Training Tips', 'Grooming Guide'],
      popularity: 'Popular',
    },
    {
      breed: 'Golden Retriever',
      topics: ['Heart Health', 'Coat Care', 'Activity Requirements'],
      popularity: 'Popular',
    },
  ];

  const handleFindNearbyVets = () => {
    // Show pin code dialog instead of using geolocation
    setShowPincodeDialog(true);
  };

  const handlePincodeSubmit = () => {
    // Validate pin code (6 digits)
    if (!/^\d{6}$/.test(pincode)) {
      toast.error('Please enter a valid 6-digit pin code');
      return;
    }

    // Navigate to providers page with pin code
    setShowPincodeDialog(false);
    navigate('/providers', {
      state: {
        pincode: pincode,
        searchByPincode: true,
      }
    });
    setPincode(''); // Reset for next time
  };

  const handleCitySubmit = () => {
    // Validate city name
    if (!city.trim()) {
      toast.error('Please enter a city name');
      return;
    }

    // Navigate to providers page with city
    setShowPincodeDialog(false);
    navigate('/providers', {
      state: {
        city: city.trim(),
        searchByCity: true,
      }
    });
    setCity(''); // Reset for next time
  };

  const handleSearchSubmit = () => {
    if (searchType === 'pincode') {
      handlePincodeSubmit();
    } else {
      handleCitySubmit();
    }
  };

  const handleFindNearbyDiagnostics = async () => {
    setIsLoadingDiagnostics(true);
    
    try {
      // Get user location
      const location = await getUserLocation();
      
      // For now, we'll use the same provider data but filter for diagnostic centers
      // In a real app, you'd have separate diagnostic center data
      toast.info('Finding diagnostic centers near you...');
      
      // Simulate finding diagnostics (using same data for MVP)
      setTimeout(() => {
        toast.success('Showing diagnostic centers in your area');
        navigate('/providers', {
          state: {
            diagnostics: true,
            userLocation: location,
          }
        });
      }, 1000);
    } catch (error) {
      console.error('Error finding diagnostics:', error);
      toast.error('Unable to get your location. Showing all diagnostic centers.');
      navigate('/providers');
    } finally {
      setIsLoadingDiagnostics(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image with Overlay - Clear image of dog with owner */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=2000&auto=format&fit=crop)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <PawPrint className="w-6 h-6" />
              <span className="text-lg font-bold">Pet Health Companion</span>
            </div>
            
            {/* Profile Dropdown - Only show when authenticated */}
            {isAuthenticated && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 hover:bg-white/10 text-white"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[#FF385C] text-white text-sm">
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
          </div>
        </header>

        {/* Main Content - Centered */}
        <div className="flex-1 flex items-center justify-center px-4 py-6">
          <div className="max-w-5xl w-full">
            {/* Hero Text */}
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">
                Our Pet's 24/7 Health Companion
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl mx-auto">
                India's first AI-powered pet health app. Instant guidance when your furry friend needs it most.
              </p>

              {/* Demo Video + CTAs - Side by Side Layout with Center Alignment */}
              <div className="flex flex-col lg:flex-row gap-4 items-center mb-8 max-w-4xl mx-auto">
                {/* Demo Video Section - 2/5 size, left aligned */}
                <div className="lg:w-2/5 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Play className="w-4 h-4 text-[#FF385C]" />
                    <h2 className="text-sm font-bold text-gray-900">How It Works</h2>
                  </div>
                  <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden mb-2">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-[#FF385C] rounded-full flex items-center justify-center mx-auto mb-2 cursor-pointer hover:bg-[#E31C5F] transition-colors">
                          <Play className="w-6 h-6 text-white ml-1" />
                        </div>
                        <p className="text-white text-xs">2 min tutorial</p>
                      </div>
                    </div>
                    <img 
                      src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=2000&auto=format&fit=crop" 
                      alt="Tutorial thumbnail" 
                      className="w-full h-full object-cover opacity-40"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <div className="text-center p-1 bg-gray-50 rounded">
                      <p className="text-xs font-semibold text-gray-900">Step 1</p>
                      <p className="text-xs text-gray-600">Describe</p>
                    </div>
                    <div className="text-center p-1 bg-gray-50 rounded">
                      <p className="text-xs font-semibold text-gray-900">Step 2</p>
                      <p className="text-xs text-gray-600">Upload</p>
                    </div>
                    <div className="text-center p-1 bg-gray-50 rounded">
                      <p className="text-xs font-semibold text-gray-900">Step 3</p>
                      <p className="text-xs text-gray-600">Get AI Help</p>
                    </div>
                  </div>
                </div>

                {/* CTAs Section - Right side, center aligned */}
                <div className="lg:w-3/5 flex flex-col gap-3">
                  {/* AI Symptom Checker Banner */}
                  <div className="bg-gradient-to-r from-[#FF385C] to-[#E31C5F] rounded-lg p-4 shadow-2xl">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-white">
                        <div className="bg-white/20 p-2 rounded-full flex-shrink-0">
                          <Stethoscope className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-base font-bold leading-tight">Try AI Health Check</h3>
                          <p className="text-white/90 text-sm leading-tight">Instant assessment - No signup!</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => navigate('/symptom-checker', { state: { fromLandingPage: true } })}
                        className="bg-white text-[#FF385C] hover:bg-gray-100 font-semibold px-4 py-2 text-sm rounded-lg shadow-lg transition-all hover:shadow-xl whitespace-nowrap flex-shrink-0"
                      >
                        Check Now →
                      </Button>
                    </div>
                  </div>

                  {/* Get Started and Login Buttons - Only show when not authenticated */}
                  {!isAuthenticated && (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => navigate('/signup')}
                        className="bg-[#FF385C] hover:bg-[#E31C5F] text-white font-semibold px-6 py-6 text-base rounded-lg shadow-lg transition-all hover:shadow-xl flex-1"
                      >
                        Get Started Free
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate('/login')}
                        className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white/30 font-semibold px-6 py-6 text-base rounded-lg transition-all flex-1"
                      >
                        Login
                      </Button>
                    </div>
                  )}

                  {/* Find Nearby Services - Two Buttons Side by Side */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleFindNearbyVets}
                      className="bg-white/95 hover:bg-white text-gray-900 font-semibold px-6 py-6 text-base rounded-lg shadow-lg transition-all hover:shadow-xl border-2 border-white/50 flex-1"
                    >
                      <Navigation className="w-5 h-5 mr-2" />
                      Find Nearby Vets
                    </Button>
                    <Button
                      onClick={handleFindNearbyDiagnostics}
                      disabled={isLoadingDiagnostics}
                      className="bg-white/95 hover:bg-white text-gray-900 font-semibold px-6 py-6 text-base rounded-lg shadow-lg transition-all hover:shadow-xl border-2 border-white/50 flex-1"
                    >
                      <Microscope className="w-5 h-5 mr-2" />
                      {isLoadingDiagnostics ? 'Finding...' : 'Find Diagnosticians'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Grid - Compact */}
            <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 md:p-6 shadow-2xl mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
                Built for India's 31M+ Dog Owners
              </h2>
              
              <div className="grid md:grid-cols-2 gap-3">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-8 h-8 bg-[#FF385C]/10 rounded-full flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[#FF385C]" />
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed pt-0.5">
                        {feature.text}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#FF385C]">31M+</div>
                  <div className="text-xs text-gray-600">Dog Owners</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#FF385C]">24/7</div>
                  <div className="text-xs text-gray-600">AI Support</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#FF385C]">100%</div>
                  <div className="text-xs text-gray-600">Private</div>
                </div>
              </div>
            </div>

            {/* Combined Pet Health Resources Section */}
            <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 md:p-6 shadow-2xl mb-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-[#FF385C]" />
                <h2 className="text-xl font-bold text-gray-900">Pet Health Resources</h2>
              </div>
              
              <Tabs defaultValue="articles" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="articles" className="gap-2">
                    <Mail className="w-4 h-4" />
                    Regional Insights
                  </TabsTrigger>
                  <TabsTrigger value="breeds" className="gap-2">
                    <PawPrint className="w-4 h-4" />
                    Breed Guides
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="articles" className="space-y-4">
                  {/* Newsletter Signup */}
                  <div className="bg-gradient-to-r from-[#FF385C]/10 to-[#E31C5F]/10 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Get Bi-Weekly Health Tips</h3>
                    <p className="text-xs text-gray-600 mb-3">Personalized articles based on your location, climate, and pet breed</p>
                    <div className="flex gap-2">
                      <Input 
                        type="email" 
                        placeholder="your@email.com" 
                        className="h-9 text-sm"
                      />
                      <Button className="bg-[#FF385C] hover:bg-[#E31C5F] h-9 px-4 text-sm whitespace-nowrap">
                        Subscribe
                      </Button>
                    </div>
                  </div>

                  {/* Recent Articles */}
                  <div className="space-y-2">
                    {articles.map((article, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3 hover:border-[#FF385C] transition-colors cursor-pointer">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 leading-tight">{article.title}</h4>
                          <Badge variant="secondary" className="text-xs whitespace-nowrap">{article.region}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{article.category}</span>
                          <span>•</span>
                          <span>{article.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI Health Check Link */}
                  <div className="border-t border-gray-200 pt-4">
                    <button
                      onClick={() => navigate('/symptom-checker', { state: { fromLandingPage: true } })}
                      className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-[#FF385C]/5 to-[#E31C5F]/5 hover:from-[#FF385C]/10 hover:to-[#E31C5F]/10 rounded-lg transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-[#FF385C]" />
                        <span className="text-sm font-medium text-gray-900">
                          For other insights, try our AI Health Check
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#FF385C] group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </TabsContent>

                <TabsContent value="breeds" className="space-y-4">
                  <p className="text-sm text-gray-600">Expert tutorials for popular breeds in your region</p>
                  
                  <div className="grid md:grid-cols-2 gap-3">
                    {breedTutorials.map((tutorial, index) => (
                      <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-semibold text-gray-900">{tutorial.breed}</h4>
                            <Badge variant="outline" className="text-xs">{tutorial.popularity}</Badge>
                          </div>
                          <div className="space-y-1">
                            {tutorial.topics.map((topic, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-600">
                                <div className="w-1 h-1 bg-[#FF385C] rounded-full"></div>
                                <span>{topic}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* AI Health Check Link */}
                  <div className="border-t border-gray-200 pt-4">
                    <button
                      onClick={() => navigate('/symptom-checker', { state: { fromLandingPage: true } })}
                      className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-[#FF385C]/5 to-[#E31C5F]/5 hover:from-[#FF385C]/10 hover:to-[#E31C5F]/10 rounded-lg transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-[#FF385C]" />
                        <span className="text-sm font-medium text-gray-900">
                          For other insights, try our AI Health Check
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#FF385C] group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Testimonials Section */}
            <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 md:p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
                What Pet Parents Are Saying
              </h2>
              
              <div className="grid md:grid-cols-2 gap-3">
                {testimonials.map((testimonial, index) => (
                  <Card key={index} className="border-none shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-2 mb-2">
                        <Avatar className="w-10 h-10 bg-[#FF385C]/10">
                          <AvatarFallback className="text-[#FF385C] font-semibold text-sm">
                            {testimonial.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-0.5">
                            <h4 className="font-semibold text-sm text-gray-900">{testimonial.name}</h4>
                            <div className="flex gap-0.5">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-[#FF385C] text-[#FF385C]" />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">{testimonial.location} • {testimonial.platform}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        "{testimonial.text}"
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Comprehensive Footer */}
        <footer className="bg-gray-900 text-white mt-8">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">
              {/* Company Info */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <PawPrint className="w-5 h-5 text-[#FF385C]" />
                  <span className="font-bold text-sm">Pet Health Companion</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  India's first AI-powered pet health companion. Making veterinary care accessible 24/7.
                </p>
              </div>

              {/* Contact */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Contact</h3>
                <ul className="space-y-2 text-xs text-gray-400">
                  <li className="flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    <span>+91 1800-PET-HELP</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    <span>support@pethealth.in</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPinIcon className="w-3 h-3" />
                    <span>Mumbai, India</span>
                  </li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Company</h3>
                <ul className="space-y-2 text-xs text-gray-400">
                  <li><a href="#" className="hover:text-[#FF385C] transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-[#FF385C] transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-[#FF385C] transition-colors">Press Kit</a></li>
                  <li><a href="#" className="hover:text-[#FF385C] transition-colors">Blog</a></li>
                </ul>
              </div>

              {/* Help & Support */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Help & Support</h3>
                <ul className="space-y-2 text-xs text-gray-400">
                  <li className="flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" />
                    <a href="#" className="hover:text-[#FF385C] transition-colors">Help Center</a>
                  </li>
                  <li><a href="#" className="hover:text-[#FF385C] transition-colors">FAQs</a></li>
                  <li><a href="#" className="hover:text-[#FF385C] transition-colors">Safety Guidelines</a></li>
                  <li><a href="#" className="hover:text-[#FF385C] transition-colors">Report Issue</a></li>
                </ul>
              </div>

              {/* Legal & Community */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Legal</h3>
                <ul className="space-y-2 text-xs text-gray-400 mb-4">
                  <li><a href="#" className="hover:text-[#FF385C] transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-[#FF385C] transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-[#FF385C] transition-colors">Cookie Policy</a></li>
                </ul>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Community
                </h3>
                <ul className="space-y-2 text-xs text-gray-400">
                  <li><a href="#" className="hover:text-[#FF385C] transition-colors">Pet Parent Forum</a></li>
                  <li><a href="#" className="hover:text-[#FF385C] transition-colors">Success Stories</a></li>
                </ul>
              </div>
            </div>

            {/* CTA Section */}
            <div className="border-t border-gray-800 pt-6 mb-6">
              <div className="bg-gradient-to-r from-[#FF385C] to-[#E31C5F] rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base mb-1">Ready to Get Started?</h3>
                  <p className="text-xs text-white/90">Join thousands of pet parents using AI health guidance</p>
                </div>
                <Button 
                  onClick={() => navigate('/signup')}
                  className="bg-white text-[#FF385C] hover:bg-gray-100 font-semibold px-6 py-2 text-sm rounded-lg whitespace-nowrap"
                >
                  Get Started Free
                </Button>
              </div>
            </div>

            {/* Social Links & Copyright */}
            <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <a href="#" className="text-gray-400 hover:text-[#FF385C] transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-[#FF385C] transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-[#FF385C] transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-[#FF385C] transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-green-500" />
                  <span>Secure & Private</span>
                </div>
                <span>•</span>
                <span>© 2024 Pet Health Companion</span>
                <span>•</span>
                <span>Made with ❤️ in India</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Search Dialog - PIN Code or City */}
      <Dialog open={showPincodeDialog} onOpenChange={setShowPincodeDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Find Nearby Veterinary Clinics</DialogTitle>
            <DialogDescription>
              Search for veterinary clinics using PIN code or city name
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={searchType} onValueChange={(value) => setSearchType(value as 'pincode' | 'city')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pincode">By PIN Code</TabsTrigger>
              <TabsTrigger value="city">By City Name</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pincode" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="pincode">Enter 6-digit PIN Code</Label>
                <Input
                  id="pincode"
                  placeholder="e.g., 400001, 700001, 110001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  className="h-12"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && pincode.length === 6) {
                      handlePincodeSubmit();
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
                <Label htmlFor="city">Enter City Name</Label>
                <Input
                  id="city"
                  placeholder="e.g., Mumbai, Delhi, Bangalore, Chennai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-12"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && city.trim()) {
                      handleCitySubmit();
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
                setShowPincodeDialog(false);
                setPincode('');
                setCity('');
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSearchSubmit}
              disabled={searchType === 'pincode' ? pincode.length !== 6 : !city.trim()}
              className="bg-[#FF385C] hover:bg-[#E31C5F]"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {searchType === 'pincode' ? 'Search by PIN Code' : 'Search by City'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Welcome;