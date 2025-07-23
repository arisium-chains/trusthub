# TRH Token Economy - World Miniapp Requirements
## Trust Review Hub (TRH) - Community Review Platform

### 🌍 World Miniapp Overview
Trust Review Hub is a **World miniapp** that creates a token-incentivized review ecosystem where users earn TRH tokens for honest reviews and businesses can promote their listings through token payments.

---

## 🪙 TRH Token Economy Model

### **Token Utility & Flow**
```
📈 TOKEN FLOW DIAGRAM:

Users Submit Reviews → Earn TRH Tokens (App Sponsored Initially)
                                ↓
Businesses Pay TRH → Promoted Listings & Premium Features
                                ↓
Platform Revenue → User Reward Pool (Self-Sustaining Later)
```

### **Token Distribution**
- **60%** - User Review Rewards Pool
- **20%** - Business Incentives & Airdrops  
- **15%** - Platform Development & Operations
- **5%** - Community Governance & Moderation

---

## 💰 Token Earning Mechanisms

### **For Users (Review to Earn)**

#### **Review Rewards**
```javascript
BASE_REVIEW_REWARD = 10 TRH
QUALITY_MULTIPLIER = 1.0 - 3.0x (based on review quality)
VERIFICATION_BONUS = 5 TRH (World ID verified)
EARLY_REVIEWER_BONUS = 2x (first 10 reviews for new business)

Total Reward = BASE_REVIEW_REWARD × QUALITY_MULTIPLIER + VERIFICATION_BONUS + EARLY_BONUS
```

#### **Quality Scoring Algorithm**
- **Text Length**: 50+ words = 1.2x multiplier
- **Helpful Votes**: Each helpful vote = +0.1x multiplier (max 2.0x)
- **Media Attachment**: Photos/videos = +0.5x multiplier
- **Response Engagement**: Business response to review = +0.3x multiplier
- **Account Age**: Established accounts (30+ days) = +0.2x multiplier

#### **Additional Earning Opportunities**
- **Weekly Review Streak**: 7 consecutive days = 50 TRH bonus
- **Category Pioneer**: First review in new category = 25 TRH
- **Community Moderation**: Flag inappropriate content = 5 TRH (if validated)
- **Referral Program**: Invite verified user = 20 TRH
- **Business Discovery**: Add new business = 15 TRH

### **For Businesses (Pay to Promote)**

#### **Promotion Tiers**
```javascript
BASIC_PROMOTION = 100 TRH/month
- Featured in category listings
- "Promoted" badge
- Priority in search results within category

PREMIUM_PROMOTION = 500 TRH/month  
- Homepage trending section
- Cross-category visibility
- Featured business spotlight
- Enhanced analytics dashboard

PLATINUM_PROMOTION = 1000 TRH/month
- Top banner placement
- Push notification features  
- Custom promotional campaigns
- Priority customer support
```

#### **Dynamic Pricing Model**
- **Base Price**: Fixed TRH amounts per tier
- **Demand Multiplier**: High-demand categories cost more
- **Competition Factor**: More businesses in category = higher price
- **Geographic Pricing**: Premium locations cost more
- **Seasonal Adjustments**: Holiday/event pricing

---

## 🚀 World Miniapp Integration

### **World ID Integration**
```typescript
// World ID Verification
interface WorldIDConfig {
  appId: 'trust-review-hub',
  actionId: 'verify-reviewer',
  signal: userWalletAddress,
  enableTelemetry: true
}

// Verification Flow
const verifyUser = async () => {
  const worldIDProof = await worldcoin.verify(WorldIDConfig);
  const verificationResult = await verifyWorldIDProof(worldIDProof);
  
  if (verificationResult.success) {
    // Grant verified status + bonus TRH
    await grantVerificationBonus(userAddress, 50); // 50 TRH bonus
  }
};
```

### **World Wallet Integration**
```typescript
// TRH Token Contract Integration
interface TRHToken {
  symbol: 'TRH',
  name: 'Trust Review Hub Token',
  decimals: 18,
  totalSupply: 1000000000 // 1 billion TRH
}

// Reward Distribution
const distributeReward = async (userAddress: string, amount: number) => {
  const tx = await trhContract.transfer(userAddress, parseUnits(amount.toString(), 18));
  await tx.wait();
  
  // Log for analytics
  await logTokenEarning(userAddress, amount, 'review_reward');
};
```

### **Miniapp SDK Integration**
```typescript
// World Miniapp Lifecycle
export class TrustReviewMiniapp extends WorldMiniapp {
  async onLaunch() {
    // Initialize TRH token balance
    await this.loadUserBalance();
    
    // Check for pending rewards
    await this.checkPendingRewards(); 
    
    // Load user's review history
    await this.loadUserReviews();
  }
  
  async onUserAction(action: string, data: any) {
    switch(action) {
      case 'submit_review':
        await this.handleReviewSubmission(data);
        break;
      case 'promote_business':
        await this.handleBusinessPromotion(data);
        break;
    }
  }
}
```

---

## 📊 Database Schema Updates

### **Enhanced User Schema**
```javascript
// users collection (PocketBase)
{
  // Existing fields...
  worldId: "string (unique, from World ID verification)",
  trhBalance: "number (current TRH balance)",
  lifetimeEarned: "number (total TRH earned)",
  lifetimeSpent: "number (total TRH spent)",
  
  // Earning Stats
  reviewsEarned: "number (TRH from reviews)",
  bonusesEarned: "number (TRH from bonuses)",
  referralsEarned: "number (TRH from referrals)",
  
  // Streak & Engagement
  reviewStreak: "number (consecutive days)",
  lastReviewDate: "datetime",
  isWorldVerified: "boolean (World ID verified)",
  verificationDate: "datetime",
  
  // Referral System
  referralCode: "string (unique referral code)",
  referredBy: "string (referrer's code)",
  referralCount: "number (successful referrals)"
}
```

### **Business Promotion Schema**
```javascript
// business_promotions collection
{
  id: "string (auto-generated)",
  businessId: "relation (businesses, required)",
  
  // Promotion Details
  promotionTier: "select (basic, premium, platinum)",
  trhCost: "number (TRH tokens paid)",
  startDate: "datetime",
  endDate: "datetime",
  
  // Payment & Status
  paymentTxHash: "string (blockchain transaction)",
  isActive: "boolean (currently promoted)",
  autoRenew: "boolean (auto-renew subscription)",
  
  // Performance Metrics
  impressions: "number (times shown)",
  clicks: "number (profile visits)",
  conversions: "number (reviews generated)",
  
  createdAt: "datetime (auto)",
  updatedAt: "datetime (auto)"
}
```

### **Token Transaction Schema**
```javascript
// token_transactions collection
{
  id: "string (auto-generated)",
  
  // Transaction Details
  fromAddress: "string (sender wallet)",
  toAddress: "string (recipient wallet)", 
  amount: "number (TRH amount)",
  transactionType: "select (earning, spending, transfer)",
  
  // Context
  contextType: "select (review_reward, promotion_payment, referral_bonus)",
  contextId: "string (related entity ID)",
  description: "text (human readable description)",
  
  // Blockchain Data
  txHash: "string (on-chain transaction hash)",
  blockNumber: "number",
  gasUsed: "number",
  status: "select (pending, confirmed, failed)",
  
  createdAt: "datetime (auto)"
}
```

---

## 🎯 Launch Strategy

### **Phase 1: App-Sponsored Launch (Month 1-3)**
```yaml
Token Supply: 10M TRH allocated for user rewards
Reward Rate: 10-50 TRH per review (quality-based)
Business Cost: FREE (to encourage adoption)
User Acquisition: Airdrop 100 TRH to early users
Goal: 1,000 active reviewers, 100 businesses
```

### **Phase 2: Hybrid Model (Month 4-6)**
```yaml
Business Payments: Start charging for premium features
Revenue Split: 70% to reward pool, 30% platform operations
Reduced Sponsorship: App sponsors 50% of rewards
User Economy: Self-sustaining for basic rewards
Goal: 5,000 active users, 500 businesses
```

### **Phase 3: Full Token Economy (Month 7+)**
```yaml
Self-Sustaining: Business payments fully fund user rewards
Premium Features: Advanced analytics, priority support
Community Governance: TRH holders vote on platform changes
Global Expansion: Multi-language, regional businesses
Goal: 50,000+ users, 5,000+ businesses
```

---

## 💡 Gamification & Engagement

### **Achievement System**
```javascript
const achievements = {
  // Review Milestones
  "first_review": { reward: 25, badge: "Getting Started" },
  "review_pioneer": { reward: 100, badge: "Early Adopter" },
  "quality_reviewer": { reward: 200, badge: "Trusted Voice" },
  "review_machine": { reward: 500, badge: "Review Master" },
  
  // Streak Rewards
  "week_warrior": { reward: 75, badge: "7-Day Streak" },
  "month_master": { reward: 300, badge: "30-Day Streak" },
  "year_legend": { reward: 1000, badge: "365-Day Legend" },
  
  // Community Impact
  "helpful_contributor": { reward: 150, badge: "Community Helper" },
  "business_discoverer": { reward: 100, badge: "Explorer" },
  "trusted_moderator": { reward: 250, badge: "Guardian" }
};
```

### **Leaderboards & Competition**
- **Weekly Top Reviewers**: Extra TRH rewards
- **Category Experts**: Special badges and bonuses
- **Community Champions**: Monthly recognition
- **Regional Leaders**: Geographic leaderboards

---

## 🔒 Anti-Fraud Measures

### **Review Quality Assurance**
```typescript
// AI-Powered Review Analysis
interface ReviewQualityCheck {
  authenticity: number; // 0-100 score
  sentiment: 'positive' | 'negative' | 'neutral';
  spam_probability: number; // 0-1 probability
  duplicate_check: boolean;
  world_id_verified: boolean;
}

// Reward Calculation with Fraud Prevention
const calculateReward = (review: Review, qualityCheck: ReviewQualityCheck) => {
  let baseReward = 10;
  
  // Reduce reward for suspicious reviews
  if (qualityCheck.spam_probability > 0.5) return 0;
  if (qualityCheck.authenticity < 50) baseReward *= 0.5;
  if (!qualityCheck.world_id_verified) baseReward *= 0.8;
  
  return baseReward * qualityMultiplier;
};
```

### **Sybil Attack Prevention**
- **World ID Requirement**: One verified identity per person
- **Device Fingerprinting**: Limit reviews per device
- **Behavioral Analysis**: Detect automated/bot behavior
- **Social Graph**: Analyze review patterns across users
- **Stake Requirements**: Higher stakes for frequent reviewers

---

## 📈 Analytics & KPIs

### **Platform Metrics**
- **Token Velocity**: TRH circulation rate
- **User Engagement**: Daily active reviewers
- **Business Adoption**: Monthly paying businesses
- **Review Quality**: Average quality scores
- **Economic Health**: Revenue vs reward distribution

### **Success Metrics**
```yaml
Month 1-3 Targets:
  - 1,000 World ID verified users
  - 5,000 reviews submitted
  - 100 businesses onboarded
  - 500K TRH distributed

Month 4-6 Targets:
  - 5,000 active users
  - 25,000 reviews
  - 500 businesses (50% paying)
  - Break-even on token economy

Month 7-12 Targets:
  - 50,000 users globally
  - 250,000 reviews
  - 5,000 businesses
  - Full self-sustaining economy
```

---

## 🛠 Technical Implementation

### **Smart Contract Architecture**
```solidity
// TRH Token Contract (ERC-20)
contract TRHToken {
    mapping(address => uint256) public balances;
    mapping(address => uint256) public lifetimeEarned;
    
    // Review reward distribution
    function distributeReviewReward(address reviewer, uint256 amount) external onlyPlatform {
        balances[reviewer] += amount;
        lifetimeEarned[reviewer] += amount;
        emit RewardDistributed(reviewer, amount, "review");
    }
    
    // Business promotion payments
    function processPromotionPayment(address business, uint256 amount) external {
        require(balances[business] >= amount, "Insufficient balance");
        balances[business] -= amount;
        emit PromotionPurchased(business, amount);
    }
}
```

### **World Miniapp Configuration**
```json
{
  "name": "Trust Review Hub",
  "description": "Earn TRH tokens for honest reviews",
  "version": "1.0.0",
  "world_id_required": true,
  "permissions": [
    "wallet_access",
    "world_id_verification", 
    "push_notifications",
    "location_access"
  ],
  "token_integration": {
    "primary_token": "TRH",
    "contract_address": "0x...",
    "features": ["earning", "spending", "staking"]
  }
}
```

This comprehensive token economy design transforms the review platform into a sustainable, incentive-driven ecosystem within the World miniapp framework.