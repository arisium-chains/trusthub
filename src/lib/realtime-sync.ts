import { pb } from './pocketbase-production';
import { blockchain } from './blockchain';

// Real-time Synchronization Service
export class RealtimeSyncService {
  private subscriptions: Map<string, Function[]> = new Map();
  private isInitialized = false;
  private syncQueue: SyncOperation[] = [];
  private isProcessing = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🔄 Initializing real-time synchronization...');
      
      // Set up PocketBase real-time subscriptions
      await this.setupPocketBaseSubscriptions();
      
      // Set up blockchain event listeners
      await this.setupBlockchainListeners();
      
      // Start sync queue processor
      this.startSyncProcessor();
      
      this.isInitialized = true;
      console.log('✅ Real-time synchronization initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize real-time sync:', error);
      throw error;
    }
  }

  private async setupPocketBaseSubscriptions(): Promise<void> {
    // Subscribe to review changes
    await pb.subscribeToCollection('reviews', (data) => {
      this.handleReviewUpdate(data);
    });

    // Subscribe to business changes
    await pb.subscribeToCollection('businesses', (data) => {
      this.handleBusinessUpdate(data);
    });

    // Subscribe to user changes
    await pb.subscribeToCollection('users', (data) => {
      this.handleUserUpdate(data);
    });

    console.log('🔴 PocketBase real-time subscriptions active');
  }

  private async setupBlockchainListeners(): Promise<void> {
    if (!blockchain.isConnected()) {
      console.log('⚠️ Blockchain not connected - skipping event listeners');
      return;
    }

    blockchain.setupEventListeners({
      onReviewSubmitted: (reviewId, reviewer, business, rating, contentHash) => {
        this.handleBlockchainReviewSubmitted({
          reviewId,
          reviewer,
          business,
          rating,
          contentHash
        });
      },

      onReviewVerified: (reviewId, verifier) => {
        this.handleBlockchainReviewVerified({
          reviewId,
          verifier
        });
      },

      onTokenTransfer: (from, to, amount) => {
        this.handleTokenTransfer({
          from,
          to,
          amount: amount.toString()
        });
      },

      onTokenMint: (to, amount, reason) => {
        this.handleTokenMint({
          to,
          amount: amount.toString(),
          reason
        });
      }
    });

    console.log('⛓️ Blockchain event listeners active');
  }

  // PocketBase Event Handlers
  private async handleReviewUpdate(data: any): Promise<void> {
    const { action, record } = data;
    
    console.log(`🔄 Review ${action}:`, record.id);

    switch (action) {
      case 'create':
        await this.onReviewCreated(record);
        break;
      case 'update':
        await this.onReviewUpdated(record);
        break;
      case 'delete':
        await this.onReviewDeleted(record);
        break;
    }

    // Notify subscribers
    this.notifySubscribers('review_changed', { action, record });
  }

  private async handleBusinessUpdate(data: any): Promise<void> {
    const { action, record } = data;
    
    console.log(`🔄 Business ${action}:`, record.id);

    switch (action) {
      case 'create':
        await this.onBusinessCreated(record);
        break;
      case 'update':
        await this.onBusinessUpdated(record);
        break;
    }

    // Notify subscribers
    this.notifySubscribers('business_changed', { action, record });
  }

  private async handleUserUpdate(data: any): Promise<void> {
    const { action, record } = data;
    
    console.log(`🔄 User ${action}:`, record.id);

    // Notify subscribers
    this.notifySubscribers('user_changed', { action, record });
  }

  // Blockchain Event Handlers
  private async handleBlockchainReviewSubmitted(data: {
    reviewId: string;
    reviewer: string;
    business: string;
    rating: number;
    contentHash: string;
  }): Promise<void> {
    console.log('⛓️ Blockchain review submitted:', data.reviewId);

    // Queue sync operation to update database
    this.queueSync({
      type: 'review_blockchain_confirmed',
      data: {
        reviewId: data.reviewId,
        txHash: data.reviewId, // In real implementation, this would be the actual tx hash
        contentHash: data.contentHash,
        blockchainConfirmed: true
      },
      priority: 'high'
    });
  }

  private async handleBlockchainReviewVerified(data: {
    reviewId: string;
    verifier: string;
  }): Promise<void> {
    console.log('⛓️ Blockchain review verified:', data.reviewId);

    this.queueSync({
      type: 'review_verified',
      data: {
        reviewId: data.reviewId,
        verifier: data.verifier,
        verifiedAt: new Date().toISOString()
      },
      priority: 'medium'
    });
  }

  private async handleTokenTransfer(data: {
    from: string;
    to: string;
    amount: string;
  }): Promise<void> {
    console.log('🪙 Token transfer:', data);

    // Update user balance in database
    if (data.to !== '0x0000000000000000000000000000000000000000') {
      this.queueSync({
        type: 'update_user_balance',
        data: {
          walletAddress: data.to,
          amount: data.amount,
          transactionType: 'received'
        },
        priority: 'low'
      });
    }
  }

  private async handleTokenMint(data: {
    to: string;
    amount: string;
    reason: string;
  }): Promise<void> {
    console.log('🎁 Token mint:', data);

    this.queueSync({
      type: 'update_user_balance',
      data: {
        walletAddress: data.to,
        amount: data.amount,
        transactionType: 'minted',
        reason: data.reason
      },
      priority: 'medium'
    });
  }

  // Database Event Handlers
  private async onReviewCreated(record: any): Promise<void> {
    // Update business statistics
    await this.updateBusinessStatistics(record.business_id);
    
    // Update user statistics
    await this.updateUserStatistics(record.reviewer_address);
    
    // Log analytics event
    await pb.logAnalyticsEvent({
      type: 'review_created',
      userAddress: record.reviewer_address,
      businessId: record.business_id,
      reviewId: record.id,
      sessionId: this.generateSessionId(),
      metadata: {
        rating: record.rating,
        verified: record.world_id_verified
      }
    });
  }

  private async onReviewUpdated(record: any): Promise<void> {
    // Check if this is a blockchain confirmation update
    if (record.chain_verified && record.tx_hash) {
      console.log('✅ Review blockchain confirmation updated:', record.id);
      
      // Award TRH tokens for verified review
      await this.awardReviewTokens(record);
    }
  }

  private async onReviewDeleted(record: any): Promise<void> {
    // Update business statistics
    await this.updateBusinessStatistics(record.business_id);
    
    // Update user statistics
    await this.updateUserStatistics(record.reviewer_address);
  }

  private async onBusinessCreated(record: any): Promise<void> {
    // Log analytics event
    await pb.logAnalyticsEvent({
      type: 'business_created',
      businessId: record.id,
      sessionId: this.generateSessionId(),
      metadata: {
        category: record.category,
        verified: record.verified
      }
    });
  }

  private async onBusinessUpdated(record: any): Promise<void> {
    // Check for verification status changes
    if (record.verified && !record.previous_verified) {
      console.log('✅ Business verified:', record.name);
      
      // Notify business owner
      this.notifySubscribers('business_verified', { business: record });
    }
  }

  // Sync Operations
  private queueSync(operation: SyncOperation): void {
    this.syncQueue.push({
      ...operation,
      timestamp: Date.now()
    });

    // Sort by priority (high -> medium -> low)
    this.syncQueue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private startSyncProcessor(): void {
    setInterval(async () => {
      if (this.isProcessing || this.syncQueue.length === 0) return;

      this.isProcessing = true;
      
      try {
        const operation = this.syncQueue.shift();
        if (operation) {
          await this.processSyncOperation(operation);
        }
      } catch (error) {
        console.error('❌ Sync operation failed:', error);
      } finally {
        this.isProcessing = false;
      }
    }, 1000); // Process every second
  }

  private async processSyncOperation(operation: SyncOperation): Promise<void> {
    console.log(`🔄 Processing sync operation: ${operation.type}`);

    switch (operation.type) {
      case 'review_blockchain_confirmed':
        await this.syncReviewBlockchainConfirmation(operation.data);
        break;
        
      case 'review_verified':
        await this.syncReviewVerification(operation.data);
        break;
        
      case 'update_user_balance':
        await this.syncUserBalance(operation.data);
        break;
        
      default:
        console.warn('Unknown sync operation type:', operation.type);
    }
  }

  private async syncReviewBlockchainConfirmation(data: any): Promise<void> {
    try {
      // Find review by transaction hash or review ID
      const reviews = await pb.client.collection('reviews').getFullList({
        filter: `tx_hash="${data.txHash}" || blockchain_id="${data.reviewId}"`
      });

      for (const review of reviews) {
        await pb.client.collection('reviews').update(review.id, {
          chain_verified: true,
          tx_hash: data.txHash,
          ipfs_hash: data.contentHash,
          blockchain_confirmed_at: new Date().toISOString()
        });

        console.log('✅ Review blockchain confirmation synced:', review.id);
      }
    } catch (error) {
      console.error('❌ Failed to sync review blockchain confirmation:', error);
    }
  }

  private async syncReviewVerification(data: any): Promise<void> {
    try {
      const reviews = await pb.client.collection('reviews').getFullList({
        filter: `blockchain_id="${data.reviewId}"`
      });

      for (const review of reviews) {
        await pb.client.collection('reviews').update(review.id, {
          chain_verified: true,
          verified_by: data.verifier,
          verified_at: data.verifiedAt
        });

        console.log('✅ Review verification synced:', review.id);
      }
    } catch (error) {
      console.error('❌ Failed to sync review verification:', error);
    }
  }

  private async syncUserBalance(data: any): Promise<void> {
    try {
      // Get current blockchain balance
      const blockchainBalance = await blockchain.getTRHBalance(data.walletAddress);
      
      // Update user record
      const users = await pb.client.collection('users').getFullList({
        filter: `wallet_address="${data.walletAddress}"`
      });

      for (const user of users) {
        await pb.client.collection('users').update(user.id, {
          trh_balance: blockchainBalance,
          balance_updated_at: new Date().toISOString()
        });

        console.log('💰 User balance synced:', data.walletAddress, blockchainBalance);
      }
    } catch (error) {
      console.error('❌ Failed to sync user balance:', error);
    }
  }

  // Statistics Updates
  private async updateBusinessStatistics(businessId: string): Promise<void> {
    try {
      const reviews = await pb.client.collection('reviews').getFullList({
        filter: `business_id="${businessId}" && status="published"`,
        fields: 'rating'
      });

      if (reviews.length === 0) return;

      const ratings = reviews.map((r: any) => r.rating);
      const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
      
      const ratingDistribution = {
        rating_1: ratings.filter(r => r === 1).length,
        rating_2: ratings.filter(r => r === 2).length,
        rating_3: ratings.filter(r => r === 3).length,
        rating_4: ratings.filter(r => r === 4).length,
        rating_5: ratings.filter(r => r === 5).length
      };

      await pb.client.collection('businesses').update(businessId, {
        average_rating: Number(averageRating.toFixed(2)),
        total_reviews: reviews.length,
        ...ratingDistribution,
        stats_updated_at: new Date().toISOString()
      });

      console.log('📊 Business statistics updated:', businessId);
    } catch (error) {
      console.error('❌ Failed to update business statistics:', error);
    }
  }

  private async updateUserStatistics(walletAddress: string): Promise<void> {
    try {
      const users = await pb.client.collection('users').getFullList({
        filter: `wallet_address="${walletAddress}"`
      });

      if (users.length === 0) return;

      const user = users[0];
      
      // Get user's reviews
      const reviews = await pb.client.collection('reviews').getFullList({
        filter: `reviewer_address="${walletAddress}" && status="published"`,
        fields: 'rating,helpful_votes,world_id_verified'
      });

      const reviewCount = reviews.length;
      const helpfulVotes = reviews.reduce((sum: number, r: any) => sum + (r.helpful_votes || 0), 0);
      const verifiedReviews = reviews.filter((r: any) => r.world_id_verified).length;

      // Calculate reputation score
      let reputationScore = reviewCount * 100; // Base points
      reputationScore += verifiedReviews * 50; // Verification bonus
      reputationScore += helpfulVotes * 10; // Helpful votes bonus
      reputationScore = Math.min(reputationScore, 10000); // Cap at 10,000

      // Calculate level
      const level = this.calculateUserLevel(reviewCount);
      const badge = this.calculateUserBadge(verifiedReviews, helpfulVotes);

      await pb.client.collection('users').update(user.id, {
        reviews_count: reviewCount,
        helpful_votes: helpfulVotes,
        verified_reviews: verifiedReviews,
        reputation_score: reputationScore,
        level: level,
        badge: badge,
        stats_updated_at: new Date().toISOString()
      });

      console.log('📊 User statistics updated:', walletAddress);
    } catch (error) {
      console.error('❌ Failed to update user statistics:', error);
    }
  }

  private async awardReviewTokens(review: any): Promise<void> {
    try {
      let tokenAmount = 10; // Base reward

      // Bonus for World ID verified reviews
      if (review.world_id_verified) {
        tokenAmount += 5;
      }

      // Bonus for detailed reviews
      if (review.content && review.content.length > 200) {
        tokenAmount += 3;
      }

      // Bonus for high-quality reviews (based on rating distribution)
      if (review.quality_score && review.quality_score > 0.8) {
        tokenAmount += 2;
      }

      // Award tokens via blockchain
      if (blockchain.isConnected()) {
        await blockchain.mintTRH(
          review.reviewer_address,
          tokenAmount,
          'review_reward'
        );
      }

      console.log(`🎁 Awarded ${tokenAmount} TRH to ${review.reviewer_address} for review`);
    } catch (error) {
      console.error('❌ Failed to award review tokens:', error);
    }
  }

  // Utility Methods
  private calculateUserLevel(reviewCount: number): string {
    if (reviewCount >= 100) return 'Expert Reviewer';
    if (reviewCount >= 50) return 'Pro Contributor';
    if (reviewCount >= 20) return 'Active Member';
    if (reviewCount >= 10) return 'Regular Member';
    if (reviewCount >= 5) return 'Contributor';
    return 'Beginner';
  }

  private calculateUserBadge(verifiedReviews: number, helpfulVotes: number): string {
    if (verifiedReviews >= 50 && helpfulVotes >= 200) return 'Diamond';
    if (verifiedReviews >= 25 && helpfulVotes >= 100) return 'Platinum';
    if (verifiedReviews >= 10 && helpfulVotes >= 50) return 'Gold';
    if (verifiedReviews >= 5 && helpfulVotes >= 20) return 'Silver';
    return 'Bronze';
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Subscription Management
  subscribe(event: string, callback: Function): void {
    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, []);
    }
    this.subscriptions.get(event)!.push(callback);
  }

  unsubscribe(event: string, callback: Function): void {
    const callbacks = this.subscriptions.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private notifySubscribers(event: string, data: any): void {
    const callbacks = this.subscriptions.get(event) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Subscriber callback error:', error);
      }
    });
  }

  // Cleanup
  async destroy(): Promise<void> {
    console.log('🛑 Shutting down real-time sync service');
    
    // Unsubscribe from PocketBase
    await pb.unsubscribeFromCollection('reviews');
    await pb.unsubscribeFromCollection('businesses');
    await pb.unsubscribeFromCollection('users');
    
    // Remove blockchain listeners
    blockchain.removeEventListeners();
    
    // Clear subscriptions
    this.subscriptions.clear();
    
    // Clear sync queue
    this.syncQueue = [];
    
    this.isInitialized = false;
  }

  // Status and Monitoring
  getStatus(): SyncStatus {
    return {
      initialized: this.isInitialized,
      queueSize: this.syncQueue.length,
      processing: this.isProcessing,
      subscriptions: Object.fromEntries(
        Array.from(this.subscriptions.entries()).map(([key, callbacks]) => [key, callbacks.length])
      )
    };
  }

  getQueuedOperations(): SyncOperation[] {
    return [...this.syncQueue];
  }
}

// Type Definitions
interface SyncOperation {
  type: string;
  data: any;
  priority: 'high' | 'medium' | 'low';
  timestamp?: number;
}

interface SyncStatus {
  initialized: boolean;
  queueSize: number;
  processing: boolean;
  subscriptions: Record<string, number>;
}

// Create singleton instance
export const realtimeSync = new RealtimeSyncService();

// Auto-initialize when imported (can be disabled by setting DISABLE_AUTO_SYNC env var)
if (typeof window !== 'undefined' && !process.env.DISABLE_AUTO_SYNC) {
  realtimeSync.initialize().catch(error => {
    console.warn('⚠️ Real-time sync auto-initialization failed:', error);
  });
}