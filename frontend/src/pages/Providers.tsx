import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Clock, Star, Navigation, Filter, Search, Loader2, ArrowRight, X, Home, User, PawPrint, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MOCK_PROVIDERS } from '@/data/mockData';
import { VetProvider } from '@/types';
import { providerApi, recommendationsApi, VetRecommendation } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const Providers: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as any;
  const { user, logout, isAuthenticated } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [show24x7Only, setShow24x7Only] = useState(false);
  const [showOpenNow, setShowOpenNow] = useState(false);
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');
  const [providers, setProviders] = useState<VetProvider[]>(MOCK_PROVIDERS);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [usingRealData, setUsingRealData] = useState(false);
  const [searchPincode, setSearchPincode] = useState('');
  const [loadingPincodeSearch, setLoadingPincodeSearch] = useState(false);
  const [currentVetLimit, setCurrentVetLimit] = useState(10);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchType, setSearchType] = useState<'pincode' | 'city'>('pincode');
  const [modalPincode, setModalPincode] = useState('');
  const [modalCity, setModalCity] = useState('');
  const [allCities, setAllCities] = useState<string[]>([]);

  // Initialize from navigation state if available
  useEffect(() => {
    if (locationState) {
      if (locationState.openNow) {
        setShowOpenNow(true);
      }
      if (locationState.providers) {
        setProviders(locationState.providers);
      }
      // Handle pin code search from landing page
      if (locationState.searchByPincode && locationState.pincode) {
        setSearchPincode(locationState.pincode);
        handlePincodeSearch(locationState.pincode, 10);
      }
      // Handle city search from landing page
      if (locationState.searchByCity && locationState.city) {
        handleCitySearch(locationState.city);
      }
      
      // Clear the navigation state after using it to prevent persistence on refresh
      window.history.replaceState({}, document.title);
    }
  }, [locationState]);

  // Convert AI recommendations to VetProvider format
  const convertAIRecommendationToProvider = (rec: VetRecommendation, index: number, cityName?: string): VetProvider => {
    // Parse distance from string like "2.8 km" or "3.5 km"
    let distanceValue: number | undefined = undefined;
    if (rec.distance) {
      const distanceMatch = rec.distance.match(/[\d.]+/);
      if (distanceMatch) {
        distanceValue = parseFloat(distanceMatch[0]);
      }
    }
    
    // Determine city name: use provided cityName, or pincode, or extract from address
    let cityDisplay = 'Unknown';
    if (cityName) {
      cityDisplay = cityName;
    } else if (searchPincode) {
      cityDisplay = `Near ${searchPincode}`;
    } else if (rec.address) {
      // Try to extract city from address (usually after first comma)
      const addressParts = rec.address.split(',');
      if (addressParts.length > 1) {
        cityDisplay = addressParts[addressParts.length - 2].trim();
      }
    }
    
    return {
      id: `ai-vet-${index}`,
      name: rec.name,
      address: rec.address,
      city: cityDisplay,
      phone: rec.phone,
      rating: rec.rating || 4.5,
      distance: distanceValue,
      operatingHours: rec.hours || 'Call for hours',
      is24x7: rec.emergency || false,
      latitude: 0, // AI recommendations don't have exact coordinates
      longitude: 0,
    };
  };

  // Handle pin code search
  const handlePincodeSearch = async (pincode: string, limit: number = 10) => {
    if (!/^\d{6}$/.test(pincode)) {
      toast.error('Please enter a valid 6-digit pin code');
      return;
    }

    setLoadingPincodeSearch(true);
    try {
      const response = await recommendationsApi.getVetsByPincode(pincode, limit);
      
      if (response.clinics && response.clinics.length > 0) {
        const convertedProviders = response.clinics.map((clinic, index) =>
          convertAIRecommendationToProvider(clinic, index)
        );
        
        // Sort by distance (closest first)
        const sortedProviders = convertedProviders.sort((a, b) => {
          // If both have distance, sort by distance
          if (a.distance !== undefined && b.distance !== undefined) {
            return a.distance - b.distance;
          }
          // If only one has distance, prioritize the one with distance
          if (a.distance !== undefined) return -1;
          if (b.distance !== undefined) return 1;
          // If neither has distance, maintain original order
          return 0;
        });
        
        setProviders(sortedProviders);
        setUsingRealData(true);
        setSortBy('distance');
        toast.success(`Found ${sortedProviders.length} veterinary clinics near pin code ${pincode}`);
      } else {
        toast.info('No clinics found for this pin code. Showing all available clinics.');
        setProviders(MOCK_PROVIDERS);
        setUsingRealData(false);
      }
    } catch (error) {
      console.error('Failed to fetch vets by pin code:', error);
      toast.error('Failed to fetch clinics. Showing all available clinics.');
      setProviders(MOCK_PROVIDERS);
      setUsingRealData(false);
    } finally {
      setLoadingPincodeSearch(false);
    }
  };

  // Handle city search from modal
  const handleCitySearch = async (city: string) => {
    setLoadingPincodeSearch(true);
    try {
      const response = await recommendationsApi.getVetsByCity(city, 10);
      
      if (response.clinics && response.clinics.length > 0) {
        const convertedProviders = response.clinics.map((clinic, index) =>
          convertAIRecommendationToProvider(clinic, index, city)
        );
        
        // Sort by distance if available
        const sortedProviders = convertedProviders.sort((a, b) => {
          if (a.distance !== undefined && b.distance !== undefined) {
            return a.distance - b.distance;
          }
          if (a.distance !== undefined) return -1;
          if (b.distance !== undefined) return 1;
          return 0;
        });
        
        setProviders(sortedProviders);
        setUsingRealData(true);
        setSearchPincode(''); // Clear pincode when searching by city
        
        // Set the city filter to show the selected city
        // First check if the city exists in the cities list, if not it will be added automatically
        setSelectedCity(city);
        
        toast.success(`Found ${sortedProviders.length} AI-powered veterinary clinics in ${city}`);
        setShowSearchModal(false);
        setModalCity('');
      } else {
        toast.info(`No clinics found in ${city}. Showing all available clinics.`);
        setProviders(MOCK_PROVIDERS);
        setUsingRealData(false);
        setShowSearchModal(false);
        setModalCity('');
      }
    } catch (error) {
      console.error('Failed to fetch vets by city:', error);
      toast.error('Failed to fetch clinics. Showing all available clinics.');
      setProviders(MOCK_PROVIDERS);
      setUsingRealData(false);
      setShowSearchModal(false);
      setModalCity('');
    } finally {
      setLoadingPincodeSearch(false);
    }
  };

  // Handle load more vets
  const handleLoadMoreVets = async () => {
    if (!searchPincode) {
      toast.error('Please enter a pin code first');
      return;
    }

    const newLimit = currentVetLimit + 10;
    setCurrentVetLimit(newLimit);
    await handlePincodeSearch(searchPincode, newLimit);
  };

  // Get unique cities from providers
  const cities = useMemo(() => {
    const uniqueCities = Array.from(new Set(providers.map(p => p.city)));
    const sortedCities = uniqueCities.sort();
    
    // Update allCities to include any new cities
    setAllCities(prevCities => {
      const combined = Array.from(new Set([...prevCities, ...sortedCities]));
      return combined.sort();
    });
    
    return sortedCities;
  }, [providers]);

  // Use allCities for the dropdown to show all cities even after filtering
  const cityOptions = allCities.length > 0 ? allCities : cities;

  // Filter and sort providers
  const filteredProviders = useMemo(() => {
    let filtered = [...providers];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(provider =>
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by city
    if (selectedCity !== 'all') {
      filtered = filtered.filter(provider => provider.city === selectedCity);
    }

    // Filter by 24x7
    if (show24x7Only) {
      filtered = filtered.filter(provider => provider.is24x7);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      // Sort by distance if available
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      return a.id.localeCompare(b.id);
    });

    return filtered;
  }, [providers, searchQuery, selectedCity, show24x7Only, sortBy]);

  const handleGetDirections = (provider: VetProvider) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${provider.name}, ${provider.address}, ${provider.city}`
    )}`;
    window.open(url, '_blank');
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  // Fetch nearby vets using geolocation
  const handleFindNearbyVets = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLoadingNearby(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const nearbyProviders = await providerApi.searchProviders({
            latitude,
            longitude,
            radius: 25, // 25km radius
          });

          if (nearbyProviders && nearbyProviders.length > 0) {
            // Convert API response to VetProvider format
            const convertedProviders: VetProvider[] = nearbyProviders.map((provider) => ({
              id: provider.id,
              name: provider.name,
              address: provider.address,
              city: provider.city,
              phone: provider.phone,
              rating: provider.rating || 4.5,
              distance: provider.distance,
              operatingHours: provider.is24Hours ? '24/7 Open' : 'Mon-Fri: 9AM-6PM',
              is24x7: provider.is24Hours,
              latitude: provider.latitude,
              longitude: provider.longitude,
            }));

            setProviders(convertedProviders);
            setUsingRealData(true);
            setSortBy('distance'); // Sort by distance when showing nearby
            toast.success(`Found ${convertedProviders.length} nearby veterinary clinics`);
          } else {
            toast.info('No nearby clinics found. Showing all available clinics.');
            setProviders(MOCK_PROVIDERS);
            setUsingRealData(false);
          }
        } catch (error) {
          console.error('Failed to fetch nearby vets:', error);
          toast.error('Failed to fetch nearby clinics. Showing all available clinics.');
          setProviders(MOCK_PROVIDERS);
          setUsingRealData(false);
        } finally {
          setLoadingNearby(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Unable to get your location. Please enable location access.');
        setLoadingNearby(false);
      }
    );
  };

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success('Signed out successfully');
      navigate('/welcome');
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <MapPin className="w-6 h-6 text-[#FF385C]" />
                <h1 className="text-xl font-bold">Find Veterinary Clinics</h1>
              </div>
            </div>
            
            {/* Profile Dropdown - Only show when authenticated */}
            {isAuthenticated && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 hover:bg-gray-100"
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
                    onClick={() => navigate('/welcome')}
                    className="cursor-pointer"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    <span>Home</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate('/profile')}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
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

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Search Modal */}
        <Dialog open={showSearchModal} onOpenChange={setShowSearchModal}>
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
                        setCurrentVetLimit(10);
                        handlePincodeSearch(modalPincode, 10);
                        setSearchPincode(modalPincode);
                        setShowSearchModal(false);
                        setModalPincode('');
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500">
                    Enter a valid Indian PIN code to find nearby clinics
                  </p>
                </div>
                <Button
                  onClick={() => {
                    if (modalPincode.length === 6) {
                      setCurrentVetLimit(10);
                      handlePincodeSearch(modalPincode, 10);
                      setSearchPincode(modalPincode);
                      setShowSearchModal(false);
                      setModalPincode('');
                    } else {
                      toast.error('Please enter a valid 6-digit PIN code');
                    }
                  }}
                  disabled={loadingPincodeSearch || modalPincode.length !== 6}
                  className="w-full bg-[#FF385C] hover:bg-[#E31C5F] h-12"
                >
                  {loadingPincodeSearch ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 mr-2" />
                      Search by PIN Code
                    </>
                  )}
                </Button>
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
                        handleCitySearch(modalCity.trim());
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500">
                    Enter any city name in India to find veterinary clinics
                  </p>
                </div>
                <Button
                  onClick={() => {
                    if (modalCity.trim()) {
                      handleCitySearch(modalCity.trim());
                    } else {
                      toast.error('Please enter a city name');
                    }
                  }}
                  disabled={loadingPincodeSearch || !modalCity.trim()}
                  className="w-full bg-[#FF385C] hover:bg-[#E31C5F] h-12"
                >
                  {loadingPincodeSearch ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 mr-2" />
                      Search by City
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            
            <Button
              onClick={() => {
                handleFindNearbyVets();
                setShowSearchModal(false);
              }}
              disabled={loadingNearby}
              variant="outline"
              className="w-full h-12"
            >
              {loadingNearby ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Finding...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 mr-2" />
                  Use My Current Location
                </>
              )}
            </Button>
          </DialogContent>
        </Dialog>

        {/* Real data indicator */}
        {usingRealData && searchPincode && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <MapPin className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm text-green-800">
              <strong>AI-powered recommendations for pin code {searchPincode}</strong> - Showing {providers.length} clinics
            </AlertDescription>
          </Alert>
        )}
        {usingRealData && !searchPincode && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <MapPin className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm text-green-800">
              <strong>Showing nearby clinics based on your location</strong> - Sorted by distance
            </AlertDescription>
          </Alert>
        )}

        {/* Location-based results alert */}
        {locationState?.openNow && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <MapPin className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm text-green-800">
              <strong>Showing open clinics near you</strong>
              {locationState.maxDistance && (
                <span> within {locationState.maxDistance}KM radius</span>
              )}
              {locationState.userLocation && (
                <span> • {locationState.userLocation.city}</span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by name, address, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>

              {/* Filters Row */}
              <div className="grid md:grid-cols-5 gap-4">
                {/* PIN Code Filter */}
                <div className="space-y-2">
                  <Label>PIN Code</Label>
                  <Input
                    placeholder="e.g., 400001"
                    value={searchPincode}
                    onChange={(e) => setSearchPincode(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    className="h-10"
                  />
                </div>

                {/* City Filter */}
                <div className="space-y-2">
                  <Label>City</Label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="All cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {cityOptions.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                  <Label>Sort By</Label>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'distance' | 'rating')}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="distance">Distance</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 24x7 Filter */}
                <div className="flex items-end">
                  <div className="flex items-center space-x-2 h-10">
                    <Checkbox
                      id="24x7"
                      checked={show24x7Only}
                      onCheckedChange={(checked) => setShow24x7Only(checked as boolean)}
                    />
                    <label
                      htmlFor="24x7"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      24/7 Only
                    </label>
                  </div>
                </div>

                {/* Open Now Filter */}
                <div className="flex items-end">
                  <div className="flex items-center space-x-2 h-10">
                    <Checkbox
                      id="openNow"
                      checked={showOpenNow}
                      onCheckedChange={(checked) => setShowOpenNow(checked as boolean)}
                    />
                    <label
                      htmlFor="openNow"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Open Now
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Apply filters and Clear */}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  onClick={() => {
                    // Reset all filters and search fields
                    setSearchQuery('');
                    setSelectedCity('all');
                    setShow24x7Only(false);
                    setShowOpenNow(false);
                    setSortBy('distance');
                    setSearchPincode('');
                    setProviders(MOCK_PROVIDERS);
                    setUsingRealData(false);
                    setCurrentVetLimit(10);
                    toast.success('All filters cleared');
                  }}
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
                <Button
                  onClick={async () => {
                    // Priority: PIN code search > City search > Show all
                    
                    // If PIN code is entered, search by PIN code
                    if (searchPincode && searchPincode.length === 6) {
                      setCurrentVetLimit(10);
                      await handlePincodeSearch(searchPincode, 10);
                    }
                    // Else if a city is selected, use Gemini AI to search by city
                    else if (selectedCity && selectedCity !== 'all') {
                      setLoadingPincodeSearch(true);
                      try {
                        const response = await recommendationsApi.getVetsByCity(selectedCity, 10);
                        
                        if (response.clinics && response.clinics.length > 0) {
                          const convertedProviders = response.clinics.map((clinic, index) =>
                            convertAIRecommendationToProvider(clinic, index, selectedCity)
                          );
                          
                          // Sort by distance if available
                          const sortedProviders = convertedProviders.sort((a, b) => {
                            if (a.distance !== undefined && b.distance !== undefined) {
                              return a.distance - b.distance;
                            }
                            if (a.distance !== undefined) return -1;
                            if (b.distance !== undefined) return 1;
                            return 0;
                          });
                          
                          setProviders(sortedProviders);
                          setUsingRealData(true);
                          setSearchPincode(''); // Clear PIN code when searching by city
                          toast.success(`Found ${sortedProviders.length} AI-powered veterinary clinics in ${selectedCity}`);
                        } else {
                          toast.info(`No clinics found in ${selectedCity}. Showing all available clinics.`);
                          setProviders(MOCK_PROVIDERS);
                          setUsingRealData(false);
                        }
                      } catch (error) {
                        console.error('Failed to fetch vets by city:', error);
                        toast.error('Failed to fetch clinics. Showing all available clinics.');
                        setProviders(MOCK_PROVIDERS);
                        setUsingRealData(false);
                      } finally {
                        setLoadingPincodeSearch(false);
                      }
                    } else {
                      // No PIN code or city selected, just use mock data with filters
                      setProviders(MOCK_PROVIDERS);
                      setUsingRealData(false);
                      toast.success('Filters applied - showing all clinics');
                    }
                  }}
                  disabled={loadingPincodeSearch}
                  variant="outline"
                  className="border-[#FF385C] text-[#FF385C] hover:bg-[#FF385C]/10"
                >
                  {loadingPincodeSearch ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Filter className="w-4 h-4 mr-2" />
                      Apply Filters
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Found {filteredProviders.length} {filteredProviders.length === 1 ? 'clinic' : 'clinics'}
          </p>
        </div>

        {/* Providers List */}
        {filteredProviders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No clinics found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search in a different area
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCity('all');
                  setShow24x7Only(false);
                  setShowOpenNow(false);
                  setProviders(MOCK_PROVIDERS);
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredProviders.map((provider) => (
              <Card key={provider.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{provider.name}</CardTitle>
                        {provider.distance !== undefined && (
                          <Badge variant="outline" className="text-xs">
                            {provider.distance}km away
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{provider.rating}</span>
                        </div>
                        {provider.is24x7 && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            24/7 Open
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">
                        {provider.address}, {provider.city}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{provider.phone}</p>
                    </div>
                  </div>

                  {/* Operating Hours */}
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Operating Hours</p>
                      <p className="text-sm text-muted-foreground">{provider.operatingHours}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => handleCall(provider.phone)}
                      className="flex-1 bg-[#FF385C] hover:bg-[#E31C5F]"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleGetDirections(provider)}
                      className="flex-1"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More Button - Only show when using pin code search */}
        {usingRealData && searchPincode && filteredProviders.length > 0 && (
          <div className="mt-6 text-center">
            <Button
              onClick={handleLoadMoreVets}
              disabled={loadingPincodeSearch}
              variant="outline"
              className="w-full md:w-auto"
            >
              {loadingPincodeSearch ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading more...
                </>
              ) : (
                <>
                  Load More Clinics
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Currently showing {providers.length} clinics. Click to load 10 more.
            </p>
          </div>
        )}

        {/* Emergency Notice */}
        <Card className="mt-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Emergency?</h3>
                <p className="text-sm text-red-800 mb-3">
                  If your pet is experiencing a medical emergency, call ahead to the nearest 24/7 clinic 
                  or go directly to the emergency vet. Time is critical in emergencies.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShow24x7Only(true);
                    setSortBy('distance');
                  }}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Show 24/7 Clinics Only
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Providers;