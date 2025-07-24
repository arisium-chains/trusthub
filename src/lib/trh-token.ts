// TRH Token Management System
import { isWorldIDVerified } from './worldid';

export interface TRHBalance {
  available: number;
  earned: number;
  spent: number;
  locked: number; // For staking or pending transactions
}

export interface TRHTransaction {
  id: string;
  type: 'earning' | 'spending' | 'transfer';
  amount: number;
  description: string;
  contextType: 'review_reward' | 'verification_bonus' | 'streak_bonus' | 'promotion_payment' | 'achievement_reward';
  contextId?: string;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
  txHash?: string;
}

export interface ReviewQualityScore {
  textLength: number; // 0-100
  helpfulVotes: number;
  mediaAttached: boolean;
  accountAge: number; // days
  worldIdVerified: boolean;
  overallScore: number; // 0-100
  multiplier: number; // 1.0-3.0
}

// Base TRH rewards configuration
export const TRH_REWARDS = {
  BASE_REVIEW_REWARD: 10,
  WORLD_ID_VERIFICATION_BONUS: 50,
  WORLD_ID_REVIEW_BONUS: 5,
  EARLY_REVIEWER_BONUS: 20, // 2x multiplier
  STREAK_BONUS: {
    7: 50,   // 7 days
    30: 200, // 30 days
    90: 750, // 90 days
  },
  ACHIEVEMENT_REWARDS: {
    first_review: 25,
    quality_reviewer: 100,
    community_helper: 75,
    business_discoverer: 50,
  }
} as const;

// Calculate review quality score
export const calculateReviewQuality = (
  textLength: number,
  helpfulVotes: number,
  hasMedia: boolean,
  accountAgeDays: number,
  isFirstReviewForBusiness: boolean = false
): ReviewQualityScore => {
  const worldIdVerified = isWorldIDVerified();
  
  // Text length score (0-30 points)
  const textScore = Math.min(textLength / 200 * 30, 30); // 200+ chars = max points
  
  // Helpful votes score (0-25 points)
  const votesScore = Math.min(helpfulVotes * 5, 25);
  
  // Media bonus (0-15 points)
  const mediaScore = hasMedia ? 15 : 0;
  
  // Account age bonus (0-15 points)
  const ageScore = Math.min(accountAgeDays / 30 * 15, 15); // 30+ days = max points
  
  // World ID bonus (0-15 points)
  const worldIdScore = worldIdVerified ? 15 : 0;
  
  const overallScore = textScore + votesScore + mediaScore + ageScore + worldIdScore;
  
  // Calculate multiplier (1.0-3.0)
  let multiplier = 1.0 + (overallScore / 100) * 2.0; // Scale to 1.0-3.0
  
  // Early reviewer bonus
  if (isFirstReviewForBusiness) {
    multiplier *= 2.0;
  }
  
  // Cap at 3.0x
  multiplier = Math.min(multiplier, 3.0);
  
  return {
    textLength: textScore,
    helpfulVotes: votesScore,
    mediaAttached: hasMedia,
    accountAge: ageScore,
    worldIdVerified,
    overallScore,
    multiplier
  };
};

// Calculate TRH reward for a review
export const calculateReviewReward = (
  qualityScore: ReviewQualityScore,
  isEarlyReviewer: boolean = false
): number => {
  const baseReward = TRH_REWARDS.BASE_REVIEW_REWARD;
  
  // Apply quality multiplier
  let reward = baseReward * qualityScore.multiplier;
  
  // Add World ID bonus
  if (qualityScore.worldIdVerified) {
    reward += TRH_REWARDS.WORLD_ID_REVIEW_BONUS;
  }
  
  // Add early reviewer bonus
  if (isEarlyReviewer) {
    reward += TRH_REWARDS.EARLY_REVIEWER_BONUS;
  }
  
  return Math.round(reward);
};

// TRH Token Contract Interface
class TRHTokenManager {
  private contractAddress: string;
  private storageKey = 'trh_balance';
  private transactionsKey = 'trh_transactions';

  constructor() {
    this.contractAddress = process.env.NEXT_PUBLIC_TRH_CONTRACT_ADDRESS || '';
  }

  // Get current TRH balance from blockchain
  getBalance(): TRHBalance {
    try {
      // In production, this would call the smart contract to get balance
      // For now, we'll use localStorage for demo purposes
      
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure all properties exist and are numbers
        return {
          available: Number(parsed.available) || 0,
          earned: Number(parsed.earned) || 0,
          spent: Number(parsed.spent) || 0,
          locked: Number(parsed.locked) || 0
        };
      }
    } catch (error) {
      console.error('Error loading TRH balance:', error);
    }
    
    // Default balance for new users
    return {
      available: 0,
      earned: 0,
      spent: 0,
      locked: 0
    };
  }

  // Update TRH balance (used for demo/local storage)
  private updateBalance(balance: TRHBalance): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(balance));
    } catch (error) {
      console.error('Error saving TRH balance:', error);
    }
  }

  // Get transaction history
  getTransactions(): TRHTransaction[] {
    try {
      const stored = localStorage.getItem(this.transactionsKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading TRH transactions:', error);
    }
    return [];
  }

  // Add new transaction
  private addTransaction(transaction: TRHTransaction): void {
    try {
      const transactions = this.getTransactions();
      transactions.unshift(transaction); // Add to beginning
      
      // Keep only last 100 transactions
      const limitedTransactions = transactions.slice(0, 100);
      
      localStorage.setItem(this.transactionsKey, JSON.stringify(limitedTransactions));
    } catch (error) {
      console.error('Error saving TRH transaction:', error);
    }
  }

  // Award TRH tokens (mock implementation - in production, this would interact with smart contract)
  async awardTokens(
    amount: number,
    description: string,
    contextType: TRHTransaction['contextType'],
    contextId?: string
  ): Promise<TRHTransaction> {
    const balance = await this.getBalance();
    
    // Create transaction record
    const transaction: TRHTransaction = {
      id: `trh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'earning',
      amount,
      description,
      contextType,
      contextId,
      timestamp: new Date().toISOString(),
      status: 'pending',
      txHash: `0x${Math.random().toString(16).substr(2, 64)}` // Mock tx hash
    };

    // Simulate blockchain transaction delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update balance
    const newBalance: TRHBalance = {
      available: balance.available + amount,
      earned: balance.earned + amount,
      spent: balance.spent,
      locked: balance.locked
    };

    // Confirm transaction
    transaction.status = 'confirmed';
    
    this.updateBalance(newBalance);
    this.addTransaction(transaction);

    return transaction;
  }

  // Spend TRH tokens (mock implementation - in production, this would interact with smart contract)
  async spendTokens(
    amount: number,
    description: string,
    contextType: TRHTransaction['contextType'],
    contextId?: string
  ): Promise<TRHTransaction> {
    const balance = await this.getBalance();
    
    if (balance.available < amount) {
      throw new Error(`Insufficient TRH balance. Available: ${balance.available}, Required: ${amount}`);
    }

    // Create transaction record
    const transaction: TRHTransaction = {
      id: `trh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'spending',
      amount: -amount, // Negative for spending
      description,
      contextType,
      contextId,
      timestamp: new Date().toISOString(),
      status: 'pending',
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`
    };

    // Simulate blockchain transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update balance
    const newBalance: TRHBalance = {
      available: balance.available - amount,
      earned: balance.earned,
      spent: balance.spent + amount,
      locked: balance.locked
    };

    // Confirm transaction
    transaction.status = 'confirmed';
    
    this.updateBalance(newBalance);
    this.addTransaction(transaction);

    return transaction;
  }

  // Initialize user with World ID verification bonus
  async initializeWithVerificationBonus(): Promise<void> {
    const balance = await this.getBalance();
    
    // Only award if user hasn't received verification bonus yet
    if (balance.earned === 0 && isWorldIDVerified()) {
      await this.awardTokens(
        TRH_REWARDS.WORLD_ID_VERIFICATION_BONUS,
        'World ID Verification Bonus',
        'verification_bonus'
      );
    }
  }

  // Clear all data (for development/testing)
  clearAllData(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.transactionsKey);
  }
}

// Export singleton instance
export const trhTokenManager = new TRHTokenManager();

// Utility functions
export const formatTRHAmount = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0 TRH';
  }
  return `${Math.floor(amount).toLocaleString()} TRH`;
};

export const getTRHTransactionTypeLabel = (type: TRHTransaction['type']): string => {
  const labels = {
    earning: 'Earned',
    spending: 'Spent',
    transfer: 'Transfer'
  };
  return labels[type];
};

export const getTRHContextTypeLabel = (contextType: TRHTransaction['contextType']): string => {
  const labels = {
    review_reward: 'Review Reward',
    verification_bonus: 'Verification Bonus',
    streak_bonus: 'Streak Bonus',
    promotion_payment: 'Business Promotion',
    achievement_reward: 'Achievement Reward'
  };
  return labels[contextType];
};