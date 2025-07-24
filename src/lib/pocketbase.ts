import PocketBase from 'pocketbase';

// Initialize PocketBase client
export const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

// Auto-refresh auth token
pb.authStore.onChange((token, model) => {
  if (token) {
    // Sync with wallet state
    console.log('PocketBase auth changed:', model);
  }
});

// Types for our PocketBase collections
export interface PBUser {
  id: string;
  walletAddress: string;
  username?: string;
  email?: string;
  avatar?: string;
  
  // Reputation & Stats
  reputationScore: number;
  level: string;
  badge: string;
  reviewsCount: number;
  helpfulVotes: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
  isVerified: boolean;
  isActive: boolean;
}

export interface PBBusiness {
  id: string;
  name: string;
  slug: string;
  description: string;
  website?: string;
  email?: string;
  phone?: string;
  
  // Address & Location
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  
  // Business Info
  category: string;
  subcategory?: string;
  logo?: string;
  coverImage?: string;
  businessHours?: any;
  
  // Owner Info
  ownerWalletAddress: string;
  ownerUserId: string;
  
  // Stats (computed fields)
  averageRating: number;
  totalReviews: number;
  ratingDistribution: any;
  
  // Status
  isVerified: boolean;
  isActive: boolean;
  verificationDate?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface PBReview {
  id: string;
  
  // Relations
  businessId: string;
  userId: string;
  
  // Review Content
  title?: string;
  content: string;
  rating: number;
  
  // Blockchain Data
  transactionHash?: string;
  blockNumber?: number;
  signatureHash?: string;
  ipfsHash?: string;
  
  // Review Stats
  helpfulVotes: number;
  notHelpfulVotes: number;
  totalVotes: number;
  
  // Status
  isVerified: boolean;
  isActive: boolean;
  isFlagged: boolean;
  flaggedReason?: string;
  moderationStatus: 'approved' | 'pending' | 'rejected' | 'under_review';
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  
  // Rich Content
  images?: string[];
  tags?: string[];
}

export interface PBResponse {
  id: string;
  
  // Relations
  reviewId: string;
  businessId: string;
  userId: string; // Business owner
  
  // Response Content
  content: string;
  
  // Blockchain Data
  transactionHash?: string;
  signatureHash?: string;
  
  // Status
  isVerified: boolean;
  isActive: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
}

export interface PBVote {
  id: string;
  
  // Relations
  reviewId: string;
  userId: string;
  
  // Vote Data
  voteType: 'helpful' | 'not_helpful';
  
  // Metadata
  createdAt: string;
}

// Authentication service for PocketBase using World ID
export const authenticateWithWorldID = async (
  walletAddress: string,
  signature: string,
  message: string
) => {
  try {
    // Authenticate with PocketBase using custom auth method
    const authData = await pb.collection('users').authWithOAuth2({
      provider: 'worldcoin',
      code: signature,
      codeVerifier: message,
      redirectUrl: `${window.location.origin}/auth/callback`,
      createData: {
        walletAddress: walletAddress
      }
    });

    return authData;
  } catch (error) {
    console.error('PocketBase authentication failed:', error);
    throw error;
  }
};

// Check if user is authenticated with PocketBase
export const isPBAuthenticated = (): boolean => {
  return pb.authStore.isValid;
};

// Get current authenticated user
export const getCurrentUser = (): PBUser | null => {
  if (!pb.authStore.model) return null;
  return pb.authStore.model as PBUser;
};

// Logout from PocketBase
export const logoutFromPB = (): void => {
  pb.authStore.clear();
};