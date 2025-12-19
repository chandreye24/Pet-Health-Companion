import { VetProvider } from '@/types';

export const isClinicOpenNow = (provider: VetProvider): boolean => {
  // 24/7 clinics are always open
  if (provider.is24x7) {
    return true;
  }

  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes since midnight

  // Parse operating hours (e.g., "9:00 AM - 9:00 PM")
  const hours = provider.operatingHours;
  
  // Handle "24/7" string format
  if (hours.toLowerCase().includes('24/7') || hours.toLowerCase().includes('24x7')) {
    return true;
  }

  // Parse time range (e.g., "9:00 AM - 9:00 PM")
  const timeMatch = hours.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  
  if (!timeMatch) {
    // If we can't parse, assume closed for safety
    return false;
  }

  const [_, startHour, startMin, startPeriod, endHour, endMin, endPeriod] = timeMatch;
  
  // Convert to 24-hour format and minutes since midnight
  let openTime = parseInt(startHour) * 60 + parseInt(startMin);
  let closeTime = parseInt(endHour) * 60 + parseInt(endMin);
  
  // Adjust for AM/PM
  if (startPeriod.toUpperCase() === 'PM' && parseInt(startHour) !== 12) {
    openTime += 12 * 60;
  }
  if (startPeriod.toUpperCase() === 'AM' && parseInt(startHour) === 12) {
    openTime = parseInt(startMin);
  }
  
  if (endPeriod.toUpperCase() === 'PM' && parseInt(endHour) !== 12) {
    closeTime += 12 * 60;
  }
  if (endPeriod.toUpperCase() === 'AM' && parseInt(endHour) === 12) {
    closeTime = parseInt(endMin);
  }

  // Check if current time is within operating hours
  return currentTime >= openTime && currentTime <= closeTime;
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  // Haversine formula to calculate distance between two coordinates
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

export const filterProvidersByDistance = (
  providers: VetProvider[],
  userLat: number,
  userLon: number,
  maxDistance: number = 5
): VetProvider[] => {
  return providers
    .map(provider => ({
      ...provider,
      distance: calculateDistance(userLat, userLon, provider.latitude, provider.longitude),
    }))
    .filter(provider => provider.distance! <= maxDistance)
    .sort((a, b) => a.distance! - b.distance!);
};

export const getOpenProvidersNearby = (
  providers: VetProvider[],
  userLat: number,
  userLon: number,
  maxDistance: number = 5
): VetProvider[] => {
  const openProviders = providers.filter(isClinicOpenNow);
  return filterProvidersByDistance(openProviders, userLat, userLon, maxDistance);
};

// Mock user location for major Indian cities
export const getMockUserLocation = (): { latitude: number; longitude: number; city: string } => {
  // Default to Mumbai coordinates
  return {
    latitude: 19.0760,
    longitude: 72.8777,
    city: 'Mumbai',
  };
};

export const getUserLocation = (): Promise<{ latitude: number; longitude: number; city: string }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      // Fallback to mock location if geolocation not supported
      resolve(getMockUserLocation());
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          city: 'Your Location',
        });
      },
      (error) => {
        // Fallback to mock location on error
        console.warn('Geolocation error, using mock location:', error);
        resolve(getMockUserLocation());
      },
      {
        timeout: 5000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
};