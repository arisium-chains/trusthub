import PocketBase, { RecordService, RealtimeService } from 'pocketbase';

// Production PocketBase Configuration
const PB_CONFIG = {
  url: process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://localhost:8090',
  maxReconnectAttempts: 5,
  reconnectInterval: 1000,
  heartbeatInterval: 30000,
  requestTimeout: 10000
};

// Enhanced PocketBase client with production features
class TrustHubPocketBase {
  private pb: PocketBase;
  private reconnectAttempts = 0;
  private heartbeatInterval?: NodeJS.Timeout;
  private connectionStatus: 'connected' | 'disconnected' | 'connecting' = 'disconnected';
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.pb = new PocketBase(PB_CONFIG.url);
    this.setupErrorHandling();
    this.setupAutoReconnect();
    this.setupHeartbeat();
  }

  // Connection Management
  private setupErrorHandling() {
    this.pb.authStore.onChange((token, model) => {
      if (token && model) {
        console.log('🔐 PocketBase authenticated:', model.wallet_address);
        this.connectionStatus = 'connected';
        this.notifyListeners('auth_changed', { token, model });
      } else {
        console.log('🔓 PocketBase authentication cleared');
        this.connectionStatus = 'disconnected';
        this.notifyListeners('auth_changed', { token: null, model: null });
      }
    });
  }

  private setupAutoReconnect() {
    // Monitor connection and auto-reconnect
    setInterval(async () => {
      if (this.connectionStatus === 'disconnected' && this.reconnectAttempts < PB_CONFIG.maxReconnectAttempts) {
        await this.attemptReconnect();
      }
    }, PB_CONFIG.reconnectInterval);
  }

  private setupHeartbeat() {
    this.heartbeatInterval = setInterval(async () => {
      try {
        await this.pb.health.check();
        this.connectionStatus = 'connected';
        this.reconnectAttempts = 0;
      } catch (error) {
        console.warn('💔 PocketBase heartbeat failed:', error);
        this.connectionStatus = 'disconnected';
      }
    }, PB_CONFIG.heartbeatInterval);
  }

  private async attemptReconnect() {
    if (this.reconnectAttempts >= PB_CONFIG.maxReconnectAttempts) {
      console.error('❌ Maximum reconnect attempts reached');
      return;
    }

    this.connectionStatus = 'connecting';
    this.reconnectAttempts++;

    try {
      console.log(`🔄 Attempting PocketBase reconnection (${this.reconnectAttempts}/${PB_CONFIG.maxReconnectAttempts})`);
      
      await this.pb.health.check();
      
      // If we had an auth token, try to refresh it
      if (this.pb.authStore.token) {
        await this.pb.collection('users').authRefresh();
      }

      this.connectionStatus = 'connected';
      this.reconnectAttempts = 0;
      console.log('✅ PocketBase reconnected successfully');
      
      this.notifyListeners('reconnected', {});
    } catch (error) {
      console.error(`❌ Reconnection attempt ${this.reconnectAttempts} failed:`, error);
      this.connectionStatus = 'disconnected';
    }
  }

  // Event Listeners
  private notifyListeners(event: string, data: any) {
    const eventListeners = this.listeners.get(event) || [];
    eventListeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Event listener error:', error);
      }
    });
  }

  public on(event: string, listener: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  public off(event: string, listener: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  // Authentication Methods
  async authenticateWithWallet(
    walletAddress: string, 
    signature: string, 
    message: string,
    worldIdData?: any
  ) {
    try {
      console.log('🔐 Authenticating with wallet:', walletAddress);
      
      // Custom authentication endpoint
      const response = await fetch(`${PB_CONFIG.url}/api/auth/wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: walletAddress,
          signature,
          message,
          world_id_data: worldIdData
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const authData = await response.json();
      
      // Set auth data in PocketBase
      this.pb.authStore.save(authData.token, authData.user);
      
      console.log('✅ Wallet authentication successful');
      return authData;
    } catch (error) {
      console.error('❌ Wallet authentication failed:', error);
      throw error;
    }
  }

  async createUserAccount(userData: CreateUserData): Promise<UserRecord> {
    try {
      const user = await this.pb.collection('users').create({
        wallet_address: userData.walletAddress,
        world_id_verified: userData.worldIdVerified || false,
        world_id_hash: userData.worldIdHash,
        display_name: userData.displayName,
        reputation_score: 0,
        level: 'Beginner',
        badge: 'Bronze',
        reviews_count: 0,
        trh_balance: userData.worldIdVerified ? 100 : 0, // Welcome bonus
        status: 'active',
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      });

      console.log('✅ User account created:', user.id);
      return user as unknown as UserRecord;
    } catch (error) {
      console.error('❌ Failed to create user account:', error);
      throw error;
    }
  }

  // Business Operations
  async createBusiness(businessData: CreateBusinessData): Promise<BusinessRecord> {
    try {
      const business = await this.pb.collection('businesses').create({
        slug: businessData.slug,
        name: businessData.name,
        description: businessData.description,
        website: businessData.website,
        category: businessData.category,
        logo_url: businessData.logoUrl,
        owner_wallet: businessData.ownerWallet,
        average_rating: 0,
        total_reviews: 0,
        rating_1: 0,
        rating_2: 0,
        rating_3: 0,
        rating_4: 0,
        rating_5: 0,
        verified: false,
        claimed: true,
        status: 'pending',
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      });

      console.log('✅ Business created:', business.id);
      return business as unknown as BusinessRecord;
    } catch (error) {
      console.error('❌ Failed to create business:', error);
      throw error;
    }
  }

  async getBusinessBySlug(slug: string): Promise<BusinessRecord | null> {
    try {
      const business = await this.pb.collection('businesses')
        .getFirstListItem(`slug="${slug}" && status="active"`);
      return business as unknown as BusinessRecord;
    } catch (error: any) {
      if (error.status === 404) {
        return null; // Business not found
      }
      console.error('❌ Failed to get business:', error);
      throw error;
    }
  }

  // Review Operations
  async createReview(reviewData: CreateReviewData): Promise<ReviewRecord> {
    try {
      const review = await this.pb.collection('reviews').create({
        business_id: reviewData.businessId,
        reviewer_address: reviewData.reviewerAddress,
        rating: reviewData.rating,
        title: reviewData.title,
        content: reviewData.content,
        world_id_verified: reviewData.worldIdVerified,
        chain_verified: false, // Will be updated when blockchain confirms
        helpful_votes: 0,
        not_helpful_votes: 0,
        status: 'published',
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      });

      // Update business statistics
      await this.updateBusinessStats(reviewData.businessId);

      console.log('✅ Review created:', review.id);
      return review as unknown as ReviewRecord;
    } catch (error) {
      console.error('❌ Failed to create review:', error);
      throw error;
    }
  }

  async getReviewsForBusiness(businessId: string, options: QueryOptions = {}): Promise<ReviewRecord[]> {
    try {
      const reviews = await this.pb.collection('reviews').getFullList({
        filter: `business_id="${businessId}" && status="published"`,
        sort: options.sort || '-created',
        expand: 'reviewer',
        ...options
      });

      return reviews as unknown as ReviewRecord[];
    } catch (error) {
      console.error('❌ Failed to get reviews:', error);
      throw error;
    }
  }

  private async updateBusinessStats(businessId: string) {
    try {
      // Get all reviews for this business
      const reviews = await this.pb.collection('reviews').getFullList({
        filter: `business_id="${businessId}" && status="published"`,
        fields: 'rating'
      });

      if (reviews.length === 0) return;

      // Calculate statistics
      const totalReviews = reviews.length;
      const ratings = reviews.map(r => r.rating);
      const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / totalReviews;
      
      const ratingDistribution = {
        rating_1: ratings.filter(r => r === 1).length,
        rating_2: ratings.filter(r => r === 2).length,
        rating_3: ratings.filter(r => r === 3).length,
        rating_4: ratings.filter(r => r === 4).length,
        rating_5: ratings.filter(r => r === 5).length
      };

      // Update business record
      await this.pb.collection('businesses').update(businessId, {
        average_rating: Number(averageRating.toFixed(2)),
        total_reviews: totalReviews,
        ...ratingDistribution,
        updated: new Date().toISOString()
      });

      console.log('✅ Business stats updated for:', businessId);
    } catch (error) {
      console.error('❌ Failed to update business stats:', error);
    }
  }

  // Search Operations
  async searchBusinesses(query: string, options: SearchOptions = {}): Promise<BusinessRecord[]> {
    try {
      const filter = query 
        ? `(name ~ "${query}" || description ~ "${query}" || category ~ "${query}") && status="active"`
        : 'status="active"';

      const businesses = await this.pb.collection('businesses').getFullList({
        filter,
        sort: options.sortBy === 'rating' 
          ? '-average_rating,-total_reviews' 
          : options.sortBy === 'reviews' 
          ? '-total_reviews,-average_rating'
          : '-created',
        fields: options.fields || '*',
        limit: options.limit || 50
      });

      return businesses as unknown as BusinessRecord[];
    } catch (error) {
      console.error('❌ Search failed:', error);
      throw error;
    }
  }

  // Real-time Operations
  async subscribeToCollection(collection: string, callback: (data: any) => void) {
    try {
      await this.pb.collection(collection).subscribe('*', callback);
      console.log(`🔴 Subscribed to ${collection} real-time updates`);
    } catch (error) {
      console.error(`❌ Failed to subscribe to ${collection}:`, error);
      throw error;
    }
  }

  async unsubscribeFromCollection(collection: string) {
    try {
      await this.pb.collection(collection).unsubscribe();
      console.log(`⚫ Unsubscribed from ${collection}`);
    } catch (error) {
      console.error(`❌ Failed to unsubscribe from ${collection}:`, error);
    }
  }

  // Analytics & Monitoring
  async logAnalyticsEvent(event: AnalyticsEvent) {
    try {
      await this.pb.collection('analytics').create({
        event_type: event.type,
        user_address: event.userAddress,
        business_id: event.businessId,
        review_id: event.reviewId,
        session_id: event.sessionId,
        metadata: event.metadata || {},
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        created: new Date().toISOString()
      });
    } catch (error) {
      // Don't throw on analytics errors to avoid disrupting user flow
      console.warn('⚠️ Analytics event failed:', error);
    }
  }

  // Health & Status
  getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' {
    return this.connectionStatus;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.pb.health.check();
      return true;
    } catch {
      return false;
    }
  }

  // Cleanup
  destroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.pb.realtime.unsubscribe();
    this.listeners.clear();
  }

  // Direct PocketBase access for advanced usage
  get client(): PocketBase {
    return this.pb;
  }
}

// Type Definitions
export interface CreateUserData {
  walletAddress: string;
  worldIdVerified?: boolean;
  worldIdHash?: string;
  displayName?: string;
}

export interface CreateBusinessData {
  slug: string;
  name: string;
  description: string;
  website?: string;
  category: string;
  logoUrl?: string;
  ownerWallet: string;
}

export interface CreateReviewData {
  businessId: string;
  reviewerAddress: string;
  rating: number;
  title: string;
  content: string;
  worldIdVerified: boolean;
}

export interface QueryOptions {
  sort?: string;
  fields?: string;
  limit?: number;
  filter?: string;
}

export interface SearchOptions {
  sortBy?: 'rating' | 'reviews' | 'date';
  category?: string;
  limit?: number;
  fields?: string;
}

export interface AnalyticsEvent {
  type: string;
  userAddress?: string;
  businessId?: string;
  reviewId?: string;
  sessionId: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserRecord {
  id: string;
  wallet_address: string;
  world_id_verified: boolean;
  display_name?: string;
  reputation_score: number;
  level: string;
  badge: string;
  reviews_count: number;
  trh_balance: number;
  status: string;
  created: string;
  updated: string;
}

export interface BusinessRecord {
  id: string;
  slug: string;
  name: string;
  description: string;
  website?: string;
  category: string;
  logo_url?: string;
  owner_wallet?: string;
  average_rating: number;
  total_reviews: number;
  rating_1: number;
  rating_2: number;
  rating_3: number;
  rating_4: number;
  rating_5: number;
  verified: boolean;
  status: string;
  created: string;
  updated: string;
}

export interface ReviewRecord {
  id: string;
  business_id: string;
  reviewer_address: string;
  rating: number;
  title: string;
  content: string;
  world_id_verified: boolean;
  chain_verified: boolean;
  helpful_votes: number;
  not_helpful_votes: number;
  status: string;
  created: string;
  updated: string;
}

// Create singleton instance
export const pb = new TrustHubPocketBase();

// Legacy compatibility
export { pb as default };

// Export for testing
export { TrustHubPocketBase };