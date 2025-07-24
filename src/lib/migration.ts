import { pb } from './pocketbase-production';
import { mockBusinesses, mockReviews, mockUserProfile } from './mock-data';

// Migration Service for transitioning from mock data to production PocketBase
export class MigrationService {
  private migrationLog: MigrationLogEntry[] = [];
  private startTime: number = 0;

  async executeMigration(): Promise<MigrationResult> {
    this.startTime = Date.now();
    this.log('info', 'Starting migration from mock data to PocketBase');

    const result: MigrationResult = {
      success: false,
      executionTime: 0,
      statistics: {
        users: { created: 0, updated: 0, failed: 0, errors: [] },
        businesses: { created: 0, updated: 0, failed: 0, errors: [] },
        reviews: { created: 0, updated: 0, failed: 0, errors: [] }
      },
      migrationLog: []
    };

    try {
      // Step 1: Validate mock data
      await this.validateMockData();

      // Step 2: Create categories
      await this.createCategories();

      // Step 3: Migrate users (extract from review data)
      await this.migrateUsers(result.statistics.users);

      // Step 4: Migrate businesses
      await this.migrateBusinesses(result.statistics.businesses);

      // Step 5: Migrate reviews
      await this.migrateReviews(result.statistics.reviews);

      // Step 6: Update calculated fields
      await this.updateCalculatedFields();

      // Step 7: Verify migration integrity
      await this.verifyMigrationIntegrity();

      result.success = true;
      this.log('info', 'Migration completed successfully');

    } catch (error) {
      result.success = false;
      this.log('error', `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    result.executionTime = Date.now() - this.startTime;
    result.migrationLog = this.migrationLog;

    return result;
  }

  private async validateMockData(): Promise<void> {
    this.log('info', 'Validating mock data structure');

    // Validate businesses
    if (!mockBusinesses || mockBusinesses.length === 0) {
      throw new Error('No mock businesses found');
    }

    // Validate reviews
    if (!mockReviews || mockReviews.length === 0) {
      throw new Error('No mock reviews found');
    }

    // Check for required fields
    for (const business of mockBusinesses) {
      if (!business.id || !business.name || !business.slug) {
        throw new Error(`Invalid business data: ${JSON.stringify(business)}`);
      }
    }

    for (const review of mockReviews) {
      if (!review.id || !review.businessId || !review.reviewerAddress || !review.content) {
        throw new Error(`Invalid review data: ${JSON.stringify(review)}`);
      }
    }

    this.log('info', `Validated ${mockBusinesses.length} businesses and ${mockReviews.length} reviews`);
  }

  private async createCategories(): Promise<void> {
    this.log('info', 'Creating business categories');

    const categories = [...new Set(mockBusinesses.map(b => b.category))];
    
    for (const categoryName of categories) {
      try {
        const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
        
        // Check if category already exists
        const existing = await pb.client.collection('categories')
          .getFirstListItem(`slug="${slug}"`)
          .catch(() => null);

        if (!existing) {
          await pb.client.collection('categories').create({
            name: categoryName,
            slug: slug,
            description: `${categoryName} businesses and services`,
            sort_order: categories.indexOf(categoryName),
            active: true,
            created: new Date().toISOString(),
            updated: new Date().toISOString()
          });

          this.log('info', `Created category: ${categoryName}`);
        }
      } catch (error) {
        this.log('warn', `Failed to create category ${categoryName}: ${error}`);
      }
    }
  }

  private async migrateUsers(stats: MigrationStats): Promise<void> {
    this.log('info', 'Migrating users from review data');

    // Extract unique reviewers from mock data
    const uniqueReviewers = new Map<string, any>();
    
    // Add reviewers from reviews
    mockReviews.forEach(review => {
      if (!uniqueReviewers.has(review.reviewerAddress)) {
        uniqueReviewers.set(review.reviewerAddress, {
          wallet_address: review.reviewerAddress,
          display_name: review.reviewerName,
          reviews: mockReviews.filter(r => r.reviewerAddress === review.reviewerAddress)
        });
      }
    });

    // Add mock user profile
    if (mockUserProfile) {
      uniqueReviewers.set(mockUserProfile.address, {
        wallet_address: mockUserProfile.address,
        display_name: 'You',
        reviews: mockUserProfile.reviews,
        reputation_score: mockUserProfile.reputationScore,
        level: mockUserProfile.level,
        badge: mockUserProfile.badge
      });
    }

    for (const [address, userData] of uniqueReviewers) {
      try {
        // Check if user already exists
        const existing = await pb.client.collection('users')
          .getFirstListItem(`wallet_address="${address}"`)
          .catch(() => null);

        if (existing) {
          this.log('info', `User already exists: ${address}`);
          stats.updated++;
          continue;
        }

        // Calculate user statistics
        const userReviews = userData.reviews;
        const reputationScore = this.calculateReputationScore(userReviews);
        const level = this.calculateUserLevel(userReviews.length);
        const badge = this.calculateUserBadge(userReviews);

        const user = await pb.createUserAccount({
          walletAddress: address,
          displayName: userData.display_name,
          worldIdVerified: userReviews.every((r: any) => r.verified),
          worldIdHash: userData.world_id_hash
        });

        // Update with calculated fields
        await pb.client.collection('users').update(user.id, {
          reputation_score: userData.reputation_score || reputationScore,
          level: userData.level || level,
          badge: userData.badge || badge,
          reviews_count: userReviews.length,
          trh_balance: userReviews.length * 10 + (userReviews.every((r: any) => r.verified) ? 100 : 0),
          
          // Migration metadata
          migrated_from: 'mock_data',
          migration_date: new Date().toISOString()
        });

        stats.created++;
        this.log('info', `Created user: ${address} (${userData.display_name})`);

      } catch (error) {
        stats.failed++;
        stats.errors.push(`Failed to create user ${address}: ${error}`);
        this.log('error', `Failed to create user ${address}: ${error}`);
      }
    }

    this.log('info', `User migration completed: ${stats.created} created, ${stats.updated} updated, ${stats.failed} failed`);
  }

  private async migrateBusinesses(stats: MigrationStats): Promise<void> {
    this.log('info', 'Migrating businesses');

    for (const business of mockBusinesses) {
      try {
        // Check if business already exists
        const existing = await pb.getBusinessBySlug(business.slug);
        
        if (existing) {
          this.log('info', `Business already exists: ${business.slug}`);
          stats.updated++;
          continue;
        }

        const businessRecord = await pb.createBusiness({
          slug: business.slug,
          name: business.name,
          description: business.description,
          website: business.website,
          category: business.category,
          logoUrl: business.logo,
          ownerWallet: '0x0000000000000000000000000000000000000000' // Placeholder
        });

        // Update with additional mock data
        await pb.client.collection('businesses').update(businessRecord.id, {
          // Copy rating data from mock
          average_rating: Number(business.averageRating.toFixed(2)),
          total_reviews: business.totalReviews,
          rating_1: business.ratingDistribution[1],
          rating_2: business.ratingDistribution[2],
          rating_3: business.ratingDistribution[3],
          rating_4: business.ratingDistribution[4],
          rating_5: business.ratingDistribution[5],
          
          // Migration metadata
          migrated_from: business.id,
          migration_date: new Date().toISOString(),
          
          // Mark as unverified initially
          verified: false,
          claimed: false,
          status: 'active'
        });

        stats.created++;
        this.log('info', `Created business: ${business.name} (${business.slug})`);

      } catch (error) {
        stats.failed++;
        stats.errors.push(`Failed to create business ${business.slug}: ${error}`);
        this.log('error', `Failed to create business ${business.slug}: ${error}`);
      }
    }

    this.log('info', `Business migration completed: ${stats.created} created, ${stats.updated} updated, ${stats.failed} failed`);
  }

  private async migrateReviews(stats: MigrationStats): Promise<void> {
    this.log('info', 'Migrating reviews');

    // Get business ID mappings (slug -> PocketBase ID)
    const businesses = await pb.client.collection('businesses').getFullList();
    const businessMap = new Map(businesses.map((b: any) => [b.slug, b.id]));

    for (const review of mockReviews) {
      try {
        // Find corresponding business
        const mockBusiness = mockBusinesses.find(b => b.id === review.businessId);
        if (!mockBusiness) {
          throw new Error(`Mock business not found for review ${review.id}`);
        }

        const businessId = businessMap.get(mockBusiness.slug);
        if (!businessId) {
          throw new Error(`Business not found in database: ${mockBusiness.slug}`);
        }

        // Check if review already exists
        const existing = await pb.client.collection('reviews')
          .getFirstListItem(`migrated_from="${review.id}"`)
          .catch(() => null);

        if (existing) {
          this.log('info', `Review already exists: ${review.id}`);
          stats.updated++;
          continue;
        }

        const reviewRecord = await pb.createReview({
          businessId: businessId,
          reviewerAddress: review.reviewerAddress,
          rating: review.rating,
          title: review.title,
          content: review.content,
          worldIdVerified: review.verified
        });

        // Update with additional mock data
        await pb.client.collection('reviews').update(reviewRecord.id, {
          helpful_votes: review.likes,
          not_helpful_votes: review.dislikes,
          
          // Convert mock timestamp to ISO string
          created: this.convertMockTimestamp(review.timestamp),
          updated: this.convertMockTimestamp(review.timestamp),
          
          // Business response if exists
          business_response: review.businessResponse ? JSON.stringify(review.businessResponse) : null,
          
          // Migration metadata
          migrated_from: review.id,
          migration_date: new Date().toISOString(),
          
          // Quality scores (estimated)
          quality_score: 0.8,
          fraud_score: 0.1,
          sentiment_score: review.rating >= 4 ? 0.7 : review.rating <= 2 ? -0.5 : 0.0
        });

        stats.created++;
        this.log('info', `Created review: ${review.id} for business ${mockBusiness.name}`);

      } catch (error) {
        stats.failed++;
        stats.errors.push(`Failed to create review ${review.id}: ${error}`);
        this.log('error', `Failed to create review ${review.id}: ${error}`);
      }
    }

    this.log('info', `Review migration completed: ${stats.created} created, ${stats.updated} updated, ${stats.failed} failed`);
  }

  private async updateCalculatedFields(): Promise<void> {
    this.log('info', 'Updating calculated fields');

    // Get all businesses
    const businesses = await pb.client.collection('businesses').getFullList();

    for (const business of businesses) {
      try {
        // Get all reviews for this business
        const reviews = await pb.client.collection('reviews').getFullList({
          filter: `business_id="${business.id}" && status="published"`,
          fields: 'rating'
        });

        if (reviews.length === 0) continue;

        // Recalculate statistics
        const ratings = reviews.map((r: any) => r.rating);
        const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
        
        const ratingDistribution = {
          rating_1: ratings.filter(r => r === 1).length,
          rating_2: ratings.filter(r => r === 2).length,
          rating_3: ratings.filter(r => r === 3).length,
          rating_4: ratings.filter(r => r === 4).length,
          rating_5: ratings.filter(r => r === 5).length
        };

        await pb.client.collection('businesses').update(business.id, {
          average_rating: Number(averageRating.toFixed(2)),
          total_reviews: reviews.length,
          ...ratingDistribution,
          updated: new Date().toISOString()
        });

        this.log('info', `Updated stats for business: ${business.name}`);

      } catch (error) {
        this.log('warn', `Failed to update stats for business ${business.id}: ${error}`);
      }
    }
  }

  private async verifyMigrationIntegrity(): Promise<void> {
    this.log('info', 'Verifying migration integrity');

    const checks = [];

    // Check record counts
    const businessCount = await pb.client.collection('businesses').getFullList().then(r => r.length);
    const reviewCount = await pb.client.collection('reviews').getFullList().then(r => r.length);

    checks.push({
      name: 'Business count',
      expected: mockBusinesses.length,
      actual: businessCount,
      passed: businessCount >= mockBusinesses.length
    });

    checks.push({
      name: 'Review count',
      expected: mockReviews.length,
      actual: reviewCount,
      passed: reviewCount >= mockReviews.length
    });

    // Check referential integrity
    const orphanedReviews = await pb.client.collection('reviews').getFullList({
      filter: 'business_id=""',
      fields: 'id'
    });

    checks.push({
      name: 'Referential integrity',
      expected: 0,
      actual: orphanedReviews.length,
      passed: orphanedReviews.length === 0
    });

    // Log results
    for (const check of checks) {
      if (check.passed) {
        this.log('info', `✅ ${check.name}: ${check.actual}/${check.expected}`);
      } else {
        this.log('error', `❌ ${check.name}: ${check.actual}/${check.expected}`);
        throw new Error(`Migration integrity check failed: ${check.name}`);
      }
    }
  }

  // Utility Methods
  private convertMockTimestamp(mockTime: string): string {
    const now = new Date();
    const timeMap: Record<string, number> = {
      '2 days ago': 2 * 24 * 60 * 60 * 1000,
      '1 week ago': 7 * 24 * 60 * 60 * 1000,
      '2 weeks ago': 14 * 24 * 60 * 60 * 1000,
      '1 month ago': 30 * 24 * 60 * 60 * 1000,
      '2 months ago': 60 * 24 * 60 * 60 * 1000
    };

    const offset = timeMap[mockTime] || 7 * 24 * 60 * 60 * 1000; // Default to 1 week
    return new Date(now.getTime() - offset).toISOString();
  }

  private calculateReputationScore(reviews: any[]): number {
    let score = reviews.length * 100; // 100 points per review
    score += reviews.filter(r => r.verified).length * 50; // 50 bonus for verified
    score += reviews.reduce((sum, r) => sum + (r.likes || 0), 0) * 10; // 10 points per like
    return Math.min(score, 10000); // Cap at 10000
  }

  private calculateUserLevel(reviewCount: number): string {
    if (reviewCount >= 50) return 'Expert Reviewer';
    if (reviewCount >= 20) return 'Pro Contributor';
    if (reviewCount >= 10) return 'Active Member';
    if (reviewCount >= 5) return 'Contributor';
    return 'Beginner';
  }

  private calculateUserBadge(reviews: any[]): string {
    const verifiedCount = reviews.filter(r => r.verified).length;
    const totalLikes = reviews.reduce((sum, r) => sum + (r.likes || 0), 0);

    if (verifiedCount >= 20 && totalLikes >= 100) return 'Platinum';
    if (verifiedCount >= 10 && totalLikes >= 50) return 'Gold';
    if (verifiedCount >= 5 && totalLikes >= 20) return 'Silver';
    return 'Bronze';
  }

  private log(level: 'info' | 'warn' | 'error', message: string): void {
    const timestamp = new Date().toISOString();
    const logEntry: MigrationLogEntry = {
      timestamp,
      level,
      message
    };

    this.migrationLog.push(logEntry);
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
  }

  // Migration rollback (for testing)
  async rollbackMigration(): Promise<void> {
    this.log('warn', 'Starting migration rollback');

    try {
      // Delete migrated records (identified by migration metadata)
      await pb.client.collection('reviews').delete('', {
        filter: 'migrated_from!=""'
      });

      await pb.client.collection('businesses').delete('', {
        filter: 'migrated_from!=""'
      });

      await pb.client.collection('users').delete('', {
        filter: 'migrated_from="mock_data"'
      });

      this.log('info', 'Migration rollback completed');
    } catch (error) {
      this.log('error', `Migration rollback failed: ${error}`);
      throw error;
    }
  }
}

// Type Definitions
export interface MigrationResult {
  success: boolean;
  executionTime: number;
  statistics: {
    users: MigrationStats;
    businesses: MigrationStats;
    reviews: MigrationStats;
  };
  migrationLog: MigrationLogEntry[];
}

export interface MigrationStats {
  created: number;
  updated: number;
  failed: number;
  errors: string[];
}

export interface MigrationLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

// Create singleton instance
export const migrationService = new MigrationService();

// CLI-friendly migration runner
export async function runMigration(): Promise<void> {
  console.log('🚀 Starting TrustHub data migration...');
  
  try {
    const result = await migrationService.executeMigration();
    
    console.log('\n📊 Migration Results:');
    console.log(`Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Execution Time: ${result.executionTime}ms`);
    
    console.log('\n📈 Statistics:');
    console.log(`Users: ${result.statistics.users.created} created, ${result.statistics.users.failed} failed`);
    console.log(`Businesses: ${result.statistics.businesses.created} created, ${result.statistics.businesses.failed} failed`);
    console.log(`Reviews: ${result.statistics.reviews.created} created, ${result.statistics.reviews.failed} failed`);
    
    if (!result.success) {
      console.log('\n❌ Errors:');
      [...result.statistics.users.errors, ...result.statistics.businesses.errors, ...result.statistics.reviews.errors]
        .forEach(error => console.log(`  - ${error}`));
    }
    
  } catch (error) {
    console.error('💥 Migration failed with critical error:', error);
    process.exit(1);
  }
}