// Mock data for development and demonstration
export interface Business {
  id: string;
  name: string;
  slug: string;
  description: string;
  website: string;
  category: string;
  logo: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface Review {
  id: string;
  businessId: string;
  reviewerAddress: string;
  reviewerName: string;
  rating: number;
  title: string;
  content: string;
  timestamp: string;
  verified: boolean;
  likes: number;
  dislikes: number;
  businessResponse?: {
    content: string;
    timestamp: string;
    responderName: string;
  };
}

export interface UserProfile {
  address: string;
  reputationScore: number;
  level: string;
  badge: string;
  reviewsCount: number;
  rewardsAvailable: number;
  reviews: Review[];
}

export const mockBusinesses: Business[] = [
  {
    id: '1',
    name: 'The Daily Grind',
    slug: 'the-daily-grind',
    description: 'Premium coffee shop serving artisanal brews and fresh pastries',
    website: 'www.thedailygrind.com',
    category: 'Coffee Shop',
    logo: '/api/placeholder/100/100',
    averageRating: 4.6,
    totalReviews: 123,
    ratingDistribution: {
      5: 62,
      4: 37,
      3: 12,
      2: 6,
      1: 6,
    },
  },
  {
    id: '2',
    name: 'Tech Solutions Inc.',
    slug: 'tech-solutions-inc',
    description: 'Leading technology consulting and software development company',
    website: 'www.techsolutions.com',
    category: 'Technology',
    logo: '/api/placeholder/100/100',
    averageRating: 4.2,
    totalReviews: 89,
    ratingDistribution: {
      5: 40,
      4: 25,
      3: 15,
      2: 6,
      1: 3,
    },
  },
  {
    id: '3',
    name: 'Urban Eats',
    slug: 'urban-eats',
    description: 'Modern restaurant offering farm-to-table dining experience',
    website: 'www.urbaneats.com',
    category: 'Restaurant',
    logo: '/api/placeholder/100/100',
    averageRating: 4.8,
    totalReviews: 256,
    ratingDistribution: {
      5: 180,
      4: 45,
      3: 20,
      2: 8,
      1: 3,
    },
  },
];

export const mockReviews: Review[] = [
  {
    id: '1',
    businessId: '1',
    reviewerAddress: '0x1234...5678',
    reviewerName: 'Sophia Carter',
    rating: 5,
    title: 'Excellent coffee and service!',
    content: 'The Daily Grind is my go-to spot for a morning pick-me-up. Their lattes are consistently delicious, and the staff is always friendly. Highly recommend!',
    timestamp: '2 weeks ago',
    verified: true,
    likes: 12,
    dislikes: 2,
  },
  {
    id: '2',
    businessId: '1',
    reviewerAddress: '0x9876...4321',
    reviewerName: 'Ethan Bennett',
    rating: 4,
    title: 'Great atmosphere',
    content: 'I enjoy the atmosphere at The Daily Grind. It\'s a great place to work or catch up with friends. The coffee is good, but I wish they had more vegan options.',
    timestamp: '1 month ago',
    verified: true,
    likes: 8,
    dislikes: 1,
  },
  {
    id: '3',
    businessId: '1',
    reviewerAddress: '0x5555...7777',
    reviewerName: 'Olivia Hayes',
    rating: 5,
    title: 'Amazing pastries!',
    content: 'Absolutely love The Daily Grind! Their pastries are amazing, and the coffee is top-notch. The baristas are always welcoming and make the experience even better.',
    timestamp: '2 months ago',
    verified: true,
    likes: 15,
    dislikes: 3,
  },
];

export const mockUserProfile: UserProfile = {
  address: '0x123...456',
  reputationScore: 1250,
  level: 'Pro Contributor',
  badge: 'Gold',
  reviewsCount: 24,
  rewardsAvailable: 2,
  reviews: [
    {
      id: '4',
      businessId: '1',
      reviewerAddress: '0x123...456',
      reviewerName: 'You',
      rating: 5,
      title: 'Perfect morning coffee',
      content: 'Love starting my day here. Great coffee, friendly staff, and a cozy atmosphere.',
      timestamp: '2 days ago',
      verified: true,
      likes: 5,
      dislikes: 0,
    },
    {
      id: '5',
      businessId: '2',
      reviewerAddress: '0x123...456',
      reviewerName: 'You',
      rating: 4,
      title: 'Professional service',
      content: 'Tech Solutions delivered exactly what we needed. Professional team and good communication throughout the project.',
      timestamp: '1 week ago',
      verified: true,
      likes: 3,
      dislikes: 0,
    },
  ],
};

export const trendingBusinesses = mockBusinesses;
export const newBusinesses = mockBusinesses.slice().reverse();