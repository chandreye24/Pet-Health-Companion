export const DOG_BREEDS = [
  'Labrador Retriever', 'German Shepherd', 'Golden Retriever', 'Beagle', 'Pug',
  'Rottweiler', 'Doberman', 'Cocker Spaniel', 'Dachshund', 'Shih Tzu',
  'Indian Pariah Dog', 'Rajapalayam', 'Mudhol Hound', 'Chippiparai', 'Kombai',
  'Bulldog', 'Boxer', 'Pomeranian', 'Chihuahua', 'Great Dane',
  'Saint Bernard', 'Siberian Husky', 'Dalmatian', 'Yorkshire Terrier', 'Maltese',
  // Add more breeds as needed
].sort();

export const MOCK_PROVIDERS = [
  {
    id: 'vet_1',
    name: 'Pet Care Veterinary Clinic',
    phone: '+91-9876543210',
    address: 'Shop 12, Linking Road, Bandra West',
    city: 'Mumbai',
    latitude: 19.0596,
    longitude: 72.8295,
    operatingHours: '9:00 AM - 9:00 PM',
    rating: 4.5,
    is24x7: false,
  },
  {
    id: 'vet_2',
    name: 'Emergency Pet Hospital',
    phone: '+91-9876543211',
    address: '45, MG Road, Koramangala',
    city: 'Bangalore',
    latitude: 12.9352,
    longitude: 77.6245,
    operatingHours: '24/7',
    rating: 4.8,
    is24x7: true,
  },
  {
    id: 'vet_3',
    name: 'Happy Paws Veterinary Center',
    phone: '+91-9876543212',
    address: 'Park Street, Near Victoria Memorial',
    city: 'Kolkata',
    latitude: 22.5448,
    longitude: 88.3426,
    operatingHours: '8:00 AM - 8:00 PM',
    rating: 4.3,
    is24x7: false,
  },
  {
    id: 'vet_4',
    name: 'Animal Care Hospital',
    phone: '+91-9876543213',
    address: 'Connaught Place, Central Delhi',
    city: 'Delhi',
    latitude: 28.6315,
    longitude: 77.2167,
    operatingHours: '24/7',
    rating: 4.6,
    is24x7: true,
  },
  {
    id: 'vet_5',
    name: 'Pet Wellness Clinic',
    phone: '+91-9876543214',
    address: 'Anna Nagar, Chennai',
    city: 'Chennai',
    latitude: 13.0843,
    longitude: 80.2705,
    operatingHours: '9:00 AM - 7:00 PM',
    rating: 4.4,
    is24x7: false,
  },
];

export const BREED_HEALTH_TIPS: Record<string, string[]> = {
  'Labrador Retriever': [
    'Prone to hip dysplasia - maintain healthy weight',
    'Regular exercise needed to prevent obesity',
    'Watch for ear infections due to floppy ears',
  ],
  'German Shepherd': [
    'Monitor for hip and elbow dysplasia',
    'Regular grooming needed for double coat',
    'Prone to bloat - feed smaller meals',
  ],
  'Golden Retriever': [
    'High risk of hip dysplasia',
    'Regular grooming to prevent matting',
    'Watch for heart conditions',
  ],
  'Pug': [
    'Brachycephalic breed - monitor breathing',
    'Keep facial wrinkles clean and dry',
    'Avoid overheating in hot weather',
  ],
  'Indian Pariah Dog': [
    'Hardy breed with few genetic issues',
    'Regular deworming important',
    'Excellent heat tolerance',
  ],
};

export const SEASONAL_ALERTS = [
  {
    id: 'alert_1',
    type: 'seasonal' as const,
    title: 'Monsoon Tick Alert',
    description: 'Tick and flea infestations increase during monsoon. Use preventive treatments.',
    severity: 'warning' as const,
    relevantSeasons: ['monsoon', 'june', 'july', 'august', 'september'],
  },
  {
    id: 'alert_2',
    type: 'weather' as const,
    title: 'Summer Heatstroke Warning',
    description: 'High temperatures can cause heatstroke. Ensure adequate water and shade.',
    severity: 'critical' as const,
    relevantSeasons: ['summer', 'april', 'may', 'june'],
  },
  {
    id: 'alert_3',
    type: 'seasonal' as const,
    title: 'Winter Care Tips',
    description: 'Cold weather can affect joint health. Consider warm bedding for senior dogs.',
    severity: 'info' as const,
    relevantSeasons: ['winter', 'december', 'january', 'february'],
  },
];