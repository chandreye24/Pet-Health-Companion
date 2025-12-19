import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { authApi, SignupData, LoginData, convertLocation } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage and verify token on mount
    const initAuth = async () => {
      const storedUser = localStorage.getItem('pet_health_user');
      const token = localStorage.getItem('pet_health_token');
      
      if (storedUser && token) {
        try {
          // Verify token is still valid by fetching current user
          const currentUser = await authApi.getCurrentUser();
          const userWithId: User = {
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.name,
            contactNumber: currentUser.contactNumber,
            emergencyContact: currentUser.emergencyContact,
            address: currentUser.address,
            location: convertLocation(currentUser.location),
            termsAccepted: currentUser.termsAccepted,
            ageConfirmed: currentUser.ageConfirmed,
            createdAt: currentUser.createdAt,
            updatedAt: currentUser.updatedAt,
          };
          setUser(userWithId);
          localStorage.setItem('pet_health_user', JSON.stringify(userWithId));
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem('pet_health_user');
          localStorage.removeItem('pet_health_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signup = async (data: SignupData) => {
    const response = await authApi.signup(data);
    
    // Store token and user data
    localStorage.setItem('pet_health_token', response.token);
    
    const userWithId: User = {
      id: response.user.id,
      email: response.user.email,
      name: response.user.name,
      contactNumber: response.user.contactNumber,
      emergencyContact: response.user.emergencyContact,
      address: response.user.address,
      location: convertLocation(response.user.location),
      termsAccepted: response.user.termsAccepted,
      ageConfirmed: response.user.ageConfirmed,
      createdAt: response.user.createdAt,
      updatedAt: response.user.updatedAt,
    };
    
    setUser(userWithId);
    localStorage.setItem('pet_health_user', JSON.stringify(userWithId));
  };

  const login = async (email: string) => {
    try {
      console.log('AuthContext: Starting login for email:', email);
      const response = await authApi.login({ email });
      console.log('AuthContext: Received response from API:', response);
      
      // Store token and user data
      localStorage.setItem('pet_health_token', response.token);
      console.log('AuthContext: Token stored');
      
      const userWithId: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        contactNumber: response.user.contactNumber,
        emergencyContact: response.user.emergencyContact,
        address: response.user.address,
        location: convertLocation(response.user.location),
        termsAccepted: response.user.termsAccepted,
        ageConfirmed: response.user.ageConfirmed,
        createdAt: response.user.createdAt,
        updatedAt: response.user.updatedAt,
      };
      
      console.log('AuthContext: Setting user state:', userWithId);
      setUser(userWithId);
      localStorage.setItem('pet_health_user', JSON.stringify(userWithId));
      console.log('AuthContext: Login complete');
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('pet_health_user');
      localStorage.removeItem('pet_health_token');
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (user) {
      try {
        console.log('AuthContext updateUser called with:', updates);
        
        // Convert frontend location format to backend format
        const locationData = updates.location ? {
          address: `${updates.location.city}, ${updates.location.state}`,
          latitude: updates.location.latitude,
          longitude: updates.location.longitude,
        } : undefined;
        
        const profileData = {
          name: updates.name,
          contactNumber: updates.contactNumber,
          emergencyContact: updates.emergencyContact,
          address: updates.address,
          location: locationData,
        };
        
        console.log('AuthContext calling authApi.updateProfile with:', profileData);
        
        const updatedUser = await authApi.updateProfile(profileData);
        
        console.log('Backend returned:', updatedUser);
        
        const userWithId: User = {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          contactNumber: updatedUser.contactNumber,
          emergencyContact: updatedUser.emergencyContact,
          address: updatedUser.address,
          location: convertLocation(updatedUser.location),
          termsAccepted: updatedUser.termsAccepted,
          ageConfirmed: updatedUser.ageConfirmed,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        };
        
        setUser(userWithId);
        localStorage.setItem('pet_health_user', JSON.stringify(userWithId));
      } catch (error) {
        console.error('Update user error:', error);
        throw error;
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        updateUser,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};