import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PawPrint, Save, User as UserIcon, Home, LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Address } from '@/types';

// List of Indian states
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

// Country codes for phone numbers
const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
];

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [contactCode, setContactCode] = useState('+91');
  const [contactNumber, setContactNumber] = useState('');
  const [emergencyCode, setEmergencyCode] = useState('+91');
  const [emergencyNumber, setEmergencyNumber] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Load user data into form
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      
      // Parse contact number
      if (user.contactNumber) {
        const match = user.contactNumber.match(/^(\+\d+)(.+)$/);
        if (match) {
          setContactCode(match[1]);
          setContactNumber(match[2]);
        } else {
          setContactNumber(user.contactNumber);
        }
      }
      
      // Parse emergency contact
      if (user.emergencyContact) {
        const match = user.emergencyContact.match(/^(\+\d+)(.+)$/);
        if (match) {
          setEmergencyCode(match[1]);
          setEmergencyNumber(match[2]);
        } else {
          setEmergencyNumber(user.emergencyContact);
        }
      }
      
      // Load address
      if (user.address) {
        setStreet(user.address.street || '');
        setCity(user.address.city || '');
        setState(user.address.state || '');
        setZipCode(user.address.zipCode || '');
      }
    }
  }, [user]);

  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/[\s-]/g, '');
    return /^\d{10}$/.test(cleaned);
  };

  const validateZipCode = (zip: string): boolean => {
    return /^\d{6}$/.test(zip);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    if (!contactNumber.trim()) {
      toast.error('Contact number is required');
      return;
    }
    
    if (!validatePhone(contactNumber)) {
      toast.error('Contact number must be 10 digits');
      return;
    }
    
    if (!city.trim() || !state.trim() || !zipCode.trim()) {
      toast.error('City, State, and ZIP code are required');
      return;
    }
    
    if (!validateZipCode(zipCode)) {
      toast.error('ZIP code must be 6 digits');
      return;
    }
    
    if (emergencyNumber && !validatePhone(emergencyNumber)) {
      toast.error('Emergency contact must be 10 digits');
      return;
    }

    setLoading(true);
    try {
      const address: Address = {
        street: street.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
        country: 'India',
      };

      await updateUser({
        name: name.trim(),
        contactNumber: `${contactCode}${contactNumber.replace(/[\s-]/g, '')}`,
        emergencyContact: emergencyNumber ? `${emergencyCode}${emergencyNumber.replace(/[\s-]/g, '')}` : undefined,
        address,
      });
      
      toast.success('Profile updated successfully!');
      setProfileSaved(true);
      
      // Redirect to pet profile page after successful profile save
      setTimeout(() => {
        navigate('/pet-profile');
      }, 1500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Profile Dropdown */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PawPrint className="w-8 h-8 text-[#FF385C]" />
            <span className="text-lg font-bold">Pet Health Companion</span>
          </div>
          
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
        </div>
      </header>

      <div className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">My Profile</CardTitle>
              <CardDescription>
                Manage your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <UserIcon className="w-5 h-5 text-[#FF385C]" />
                    <h3 className="text-lg font-semibold">Personal Information</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Cannot be changed)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="h-12 bg-gray-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact Number *</Label>
                    <div className="flex gap-2">
                      <select
                        value={contactCode}
                        onChange={(e) => setContactCode(e.target.value)}
                        className="h-12 px-3 border border-gray-300 rounded-md bg-white"
                      >
                        {COUNTRY_CODES.map((item) => (
                          <option key={item.code} value={item.code}>
                            {item.flag} {item.code}
                          </option>
                        ))}
                      </select>
                      <Input
                        id="contact"
                        type="tel"
                        placeholder="9876543210"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, ''))}
                        required
                        className="h-12 flex-1"
                        maxLength={10}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter 10-digit mobile number
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency">Emergency Contact Number</Label>
                    <div className="flex gap-2">
                      <select
                        value={emergencyCode}
                        onChange={(e) => setEmergencyCode(e.target.value)}
                        className="h-12 px-3 border border-gray-300 rounded-md bg-white"
                      >
                        {COUNTRY_CODES.map((item) => (
                          <option key={item.code} value={item.code}>
                            {item.flag} {item.code}
                          </option>
                        ))}
                      </select>
                      <Input
                        id="emergency"
                        type="tel"
                        placeholder="9876543210"
                        value={emergencyNumber}
                        onChange={(e) => setEmergencyNumber(e.target.value.replace(/\D/g, ''))}
                        className="h-12 flex-1"
                        maxLength={10}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Optional - For emergency situations
                    </p>
                  </div>
                </div>

                {/* Address Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <h3 className="text-lg font-semibold">Address</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      type="text"
                      placeholder="123 Main Street, Apartment 4B"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        type="text"
                        placeholder="Mumbai"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <select
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                        className="h-12 w-full px-3 border border-gray-300 rounded-md bg-white"
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((stateName) => (
                          <option key={stateName} value={stateName}>
                            {stateName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">PIN Code *</Label>
                    <Input
                      id="zipCode"
                      type="text"
                      placeholder="400001"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
                      required
                      className="h-12"
                      maxLength={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      6-digit PIN code
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-[#FF385C] hover:bg-[#E31C5F] text-white font-semibold"
                  disabled={loading}
                >
                  <Save className="w-5 h-5 mr-2" />
                  {loading ? 'Saving...' : 'Save Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Navigate to Pet Profiles */}
          <Card className="shadow-xl mt-6">
            <CardContent className="pt-6">
              <div className="text-center">
                <PawPrint className="w-12 h-12 text-[#FF385C] mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Manage Your Pet Profiles
                </h3>
                <p className="text-gray-600 mb-4">
                  Create and manage up to 10 pet profiles with photos, health history, and more.
                </p>
                <Button
                  onClick={() => navigate('/pet-profile')}
                  className="bg-[#FF385C] hover:bg-[#E31C5F]"
                >
                  <PawPrint className="w-4 h-4 mr-2" />
                  Go to Pet Profiles
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;