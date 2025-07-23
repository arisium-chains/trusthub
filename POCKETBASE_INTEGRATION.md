# PocketBase Integration Requirements
## Decentralized Community Review Platform (DCRP) - Database Layer

### Overview
This document outlines the requirements for integrating PocketBase as the off-chain database solution for the DCRP application. PocketBase will handle all non-sensitive data storage, user management, and provide real-time capabilities while maintaining the integrity of on-chain verification.

---

## 🎯 Integration Goals

### Primary Objectives
- **Off-chain Data Storage**: Store business profiles, review content, and user metadata
- **Real-time Features**: Live updates for new reviews and business responses
- **Search & Filtering**: Advanced search capabilities for businesses and reviews
- **Admin Dashboard**: Business management interface for verified business owners
- **Performance**: Fast queries and efficient data synchronization

### Secondary Objectives
- **File Storage**: Handle business logos, user avatars, and media attachments
- **Analytics**: Track platform usage and review statistics
- **Moderation**: Content flagging and review management system
- **API Integration**: RESTful API for external integrations

---

## 📊 Database Schema Design

### Collections Structure

#### 1. **users** Collection
```javascript
{
  id: "string (auto-generated)",
  walletAddress: "string (unique, indexed)",
  username: "string (optional)",
  email: "string (optional)",
  avatar: "file (optional)",
  
  // Reputation & Stats
  reputationScore: "number (default: 0)",
  level: "string (default: 'Newcomer')",
  badge: "string (default: 'Bronze')",
  reviewsCount: "number (default: 0)",
  helpfulVotes: "number (default: 0)",
  
  // Metadata
  createdAt: "datetime (auto)",
  updatedAt: "datetime (auto)",
  lastActiveAt: "datetime",
  isVerified: "boolean (default: false)",
  isActive: "boolean (default: true)"
}
```

#### 2. **businesses** Collection
```javascript
{
  id: "string (auto-generated)",
  name: "string (required, indexed)",
  slug: "string (unique, indexed)",
  description: "text",
  website: "url",
  email: "email",
  phone: "string",
  
  // Address & Location
  address: "text",
  city: "string",
  state: "string",
  country: "string",
  latitude: "number",
  longitude: "number",
  
  // Business Info
  category: "string (required, indexed)",
  subcategory: "string",
  logo: "file",
  coverImage: "file",
  businessHours: "json",
  
  // Owner Info
  ownerWalletAddress: "string (indexed)",
  ownerUserId: "relation (users)",
  
  // Stats (computed fields)
  averageRating: "number (default: 0)",
  totalReviews: "number (default: 0)",
  ratingDistribution: "json (default: {1:0,2:0,3:0,4:0,5:0})",
  
  // Status
  isVerified: "boolean (default: false)",
  isActive: "boolean (default: true)",
  verificationDate: "datetime",
  
  // Metadata
  createdAt: "datetime (auto)",
  updatedAt: "datetime (auto)"
}
```

#### 3. **reviews** Collection
```javascript
{
  id: "string (auto-generated)",
  
  // Relations
  businessId: "relation (businesses, required)",
  userId: "relation (users, required)",
  
  // Review Content
  title: "string",
  content: "text (required)",
  rating: "number (1-5, required)",
  
  // Blockchain Data
  transactionHash: "string (indexed)",
  blockNumber: "number",
  signatureHash: "string",
  ipfsHash: "string",
  
  // Review Stats
  helpfulVotes: "number (default: 0)",
  notHelpfulVotes: "number (default: 0)",
  totalVotes: "number (default: 0)",
  
  // Status
  isVerified: "boolean (default: false)",
  isActive: "boolean (default: true)",
  isFlagged: "boolean (default: false)",
  flaggedReason: "string",
  moderationStatus: "select (approved, pending, rejected, under_review)",
  
  // Metadata
  createdAt: "datetime (auto)",
  updatedAt: "datetime (auto)",
  verifiedAt: "datetime",
  
  // Rich Content
  images: "file (multiple)",
  tags: "json array"
}
```

#### 4. **business_responses** Collection
```javascript
{
  id: "string (auto-generated)",
  
  // Relations
  reviewId: "relation (reviews, required)",
  businessId: "relation (businesses, required)",
  userId: "relation (users, required)", // Business owner
  
  // Response Content
  content: "text (required)",
  
  // Blockchain Data
  transactionHash: "string (indexed)",
  signatureHash: "string",
  
  // Status
  isVerified: "boolean (default: false)",
  isActive: "boolean (default: true)",
  
  // Metadata
  createdAt: "datetime (auto)",
  updatedAt: "datetime (auto)",
  verifiedAt: "datetime"
}
```

#### 5. **review_votes** Collection
```javascript
{
  id: "string (auto-generated)",
  
  // Relations
  reviewId: "relation (reviews, required)",
  userId: "relation (users, required)",
  
  // Vote Data
  voteType: "select (helpful, not_helpful)",
  
  // Metadata
  createdAt: "datetime (auto)",
  
  // Constraints: unique combination of reviewId + userId
}
```

#### 6. **business_categories** Collection
```javascript
{
  id: "string (auto-generated)",
  name: "string (required, unique)",
  slug: "string (unique, indexed)",
  description: "text",
  icon: "string", // Icon name or emoji
  parentCategoryId: "relation (business_categories)", // For subcategories
  isActive: "boolean (default: true)",
  sortOrder: "number (default: 0)",
  
  createdAt: "datetime (auto)",
  updatedAt: "datetime (auto)"
}
```

#### 7. **user_activities** Collection
```javascript
{
  id: "string (auto-generated)",
  
  // Relations
  userId: "relation (users, required)",
  
  // Activity Data
  activityType: "select (review_submitted, response_posted, vote_cast, business_claimed)",
  entityType: "select (review, business, response, vote)",
  entityId: "string", // ID of the related entity
  
  // Details
  details: "json", // Additional activity-specific data
  ipAddress: "string",
  userAgent: "text",
  
  // Metadata
  createdAt: "datetime (auto)"
}
```

#### 8. **content_flags** Collection
```javascript
{
  id: "string (auto-generated)",
  
  // Relations
  reporterId: "relation (users, required)",
  
  // Flagged Content
  contentType: "select (review, response, business)",
  contentId: "string (required)",
  
  // Flag Details
  reason: "select (spam, inappropriate, fake, hate_speech, misleading)",
  description: "text",
  
  // Status
  status: "select (pending, reviewed, resolved, dismissed)",
  moderatorId: "relation (users)",
  moderatorNotes: "text",
  
  // Metadata
  createdAt: "datetime (auto)",
  updatedAt: "datetime (auto)",
  resolvedAt: "datetime"
}
```

---

## 🔧 Technical Implementation

### PocketBase Setup

#### 1. **Installation & Configuration**
```bash
# Download PocketBase binary
wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip

# Extract and run
unzip pocketbase_0.22.0_linux_amd64.zip
./pocketbase serve --http=127.0.0.1:8090
```

#### 2. **Environment Configuration**
```env
# .env.local
NEXT_PUBLIC_POCKETBASE_URL=http://localhost:8090
POCKETBASE_ADMIN_EMAIL=admin@reviewr.com
POCKETBASE_ADMIN_PASSWORD=secure_password_here
```

#### 3. **Collection Rules & Permissions**

**Users Collection Rules:**
```javascript
// List/Search Rule
@request.auth.id != ""

// View Rule  
@request.auth.id != "" && (id = @request.auth.id || @request.auth.walletAddress = walletAddress)

// Create Rule
@request.auth.id = "" && @request.data.walletAddress != ""

// Update Rule
@request.auth.id = id

// Delete Rule
@request.auth.id = id
```

**Businesses Collection Rules:**
```javascript
// List/Search Rule
@request.auth.id != ""

// View Rule
isActive = true

// Create Rule
@request.auth.id != "" && @request.data.ownerWalletAddress = @request.auth.walletAddress

// Update Rule
@request.auth.id != "" && ownerWalletAddress = @request.auth.walletAddress

// Delete Rule
@request.auth.id != "" && ownerWalletAddress = @request.auth.walletAddress
```

**Reviews Collection Rules:**
```javascript
// List/Search Rule
isActive = true && moderationStatus = "approved"

// View Rule
isActive = true && moderationStatus = "approved"

// Create Rule
@request.auth.id != "" && @request.data.userId = @request.auth.id

// Update Rule
@request.auth.id = userId && created <= @now - 300 // 5 minute edit window

// Delete Rule
@request.auth.id = userId && created >= @now - 3600 // 1 hour delete window
```

### Frontend Integration

#### 1. **PocketBase Client Setup**
```typescript
// lib/pocketbase.ts
import PocketBase from 'pocketbase';

export const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

// Auto-refresh auth token
pb.authStore.onChange((token, model) => {
  if (token) {
    // Sync with wallet state
    console.log('PocketBase auth changed:', model);
  }
});
```

#### 2. **Authentication Integration**
```typescript
// hooks/usePocketBase.ts
import { useWallet } from './useWallet';
import { pb } from '@/lib/pocketbase';

export const usePocketBase = () => {
  const { account, signMessage } = useWallet();

  const authenticateWithWallet = async () => {
    if (!account?.address) throw new Error('Wallet not connected');

    // Sign authentication message
    const message = `Authenticate with wallet: ${account.address} at ${Date.now()}`;
    const signature = await signMessage(message);

    // Authenticate with PocketBase using custom auth
    const authData = await pb.collection('users').authWithMethod('wallet', {
      walletAddress: account.address,
      signature: signature.signature,
      message: signature.message
    });

    return authData;
  };

  return {
    pb,
    authenticateWithWallet,
    isAuthenticated: pb.authStore.isValid
  };
};
```

#### 3. **Data Hooks**
```typescript
// hooks/useBusinesses.ts
import { useEffect, useState } from 'react';
import { pb } from '@/lib/pocketbase';

export const useBusinesses = (searchQuery?: string, category?: string) => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      
      let filter = 'isActive = true';
      if (searchQuery) {
        filter += ` && (name ~ "${searchQuery}" || description ~ "${searchQuery}")`;
      }
      if (category) {
        filter += ` && category = "${category}"`;
      }

      const records = await pb.collection('businesses').getList(1, 20, {
        filter,
        sort: '-averageRating,-totalReviews',
        expand: 'ownerUserId'
      });

      setBusinesses(records.items);
      setLoading(false);
    };

    fetchBusinesses();
  }, [searchQuery, category]);

  return { businesses, loading };
};
```

#### 4. **Real-time Updates**
```typescript
// hooks/useRealtimeReviews.ts
import { useEffect, useState } from 'react';
import { pb } from '@/lib/pocketbase';

export const useRealtimeReviews = (businessId: string) => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = pb.collection('reviews').subscribe('*', (e) => {
      if (e.record.businessId === businessId) {
        if (e.action === 'create') {
          setReviews(prev => [e.record, ...prev]);
        } else if (e.action === 'update') {
          setReviews(prev => prev.map(r => r.id === e.record.id ? e.record : r));
        } else if (e.action === 'delete') {
          setReviews(prev => prev.filter(r => r.id !== e.record.id));
        }
      }
    });

    return () => unsubscribe();
  }, [businessId]);

  return reviews;
};
```

---

## 🚀 Implementation Phases

### Phase 1: Core Database Setup (Week 1)
- [ ] Install and configure PocketBase
- [ ] Create all collection schemas
- [ ] Set up basic authentication
- [ ] Implement collection rules and permissions
- [ ] Create admin dashboard access

### Phase 2: Frontend Integration (Week 2)
- [ ] Install PocketBase JavaScript SDK
- [ ] Create PocketBase client configuration
- [ ] Implement wallet-based authentication
- [ ] Replace mock data with PocketBase queries
- [ ] Add loading states and error handling

### Phase 3: Real-time Features (Week 3)
- [ ] Implement real-time review updates
- [ ] Add live business response notifications
- [ ] Create activity feed functionality
- [ ] Add WebSocket connection management
- [ ] Implement optimistic updates

### Phase 4: Advanced Features (Week 4)
- [ ] Add file upload for business logos/avatars
- [ ] Implement search and filtering
- [ ] Create content moderation system
- [ ] Add analytics and reporting
- [ ] Implement caching strategies

### Phase 5: Production Optimization (Week 5)
- [ ] Set up production PocketBase instance
- [ ] Configure backup and recovery
- [ ] Implement monitoring and logging
- [ ] Add rate limiting and security measures
- [ ] Performance optimization and testing

---

## 🔐 Security Considerations

### Authentication & Authorization
- **Wallet-based Auth**: Users authenticate using wallet signatures
- **Role-based Access**: Different permissions for users, business owners, moderators
- **API Rate Limiting**: Prevent abuse and spam
- **Input Validation**: Sanitize all user inputs
- **CORS Configuration**: Restrict API access to authorized domains

### Data Privacy
- **Minimal Data Storage**: Store only necessary off-chain data
- **Data Encryption**: Encrypt sensitive fields at rest
- **User Consent**: Clear privacy policy and data usage
- **Right to Deletion**: Allow users to delete their data
- **GDPR Compliance**: Follow data protection regulations

### Content Moderation
- **Automated Filtering**: Basic spam and inappropriate content detection
- **Community Reporting**: User-driven content flagging system
- **Moderator Tools**: Admin interface for content review
- **Appeal Process**: Allow users to contest moderation decisions

---

## 📈 Performance Optimization

### Database Optimization
- **Indexing Strategy**: Index frequently queried fields
- **Query Optimization**: Use efficient filters and pagination
- **Caching Layer**: Redis for frequently accessed data
- **Connection Pooling**: Optimize database connections
- **Data Archiving**: Archive old data to maintain performance

### Frontend Optimization
- **Data Caching**: Cache API responses with SWR or React Query
- **Pagination**: Implement infinite scroll or pagination
- **Image Optimization**: Compress and resize uploaded images
- **CDN Integration**: Use CDN for static assets
- **Bundle Optimization**: Code splitting and lazy loading

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] PocketBase collection CRUD operations
- [ ] Authentication and authorization flows
- [ ] Data validation and sanitization
- [ ] Error handling and edge cases

### Integration Tests
- [ ] Frontend-backend API integration
- [ ] Real-time update functionality
- [ ] File upload and storage
- [ ] Search and filtering accuracy

### End-to-End Tests
- [ ] Complete user workflows
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness
- [ ] Performance under load

---

## 📊 Monitoring & Analytics

### System Monitoring
- **Database Performance**: Query execution times and resource usage
- **API Response Times**: Monitor endpoint performance
- **Error Tracking**: Log and alert on application errors
- **Uptime Monitoring**: Track service availability
- **Resource Usage**: Monitor CPU, memory, and disk usage

### Business Analytics
- **User Engagement**: Track active users and session duration
- **Content Metrics**: Review submission rates and response times
- **Business Growth**: Track business registrations and activity
- **Platform Health**: Monitor content quality and moderation needs

---

## 🚀 Deployment Architecture

### Development Environment
```
Local Development:
├── Next.js App (localhost:3000)
├── PocketBase (localhost:8090)
└── File Storage (local filesystem)
```

### Production Environment
```
Production Setup:
├── Next.js App (Vercel/Netlify)
├── PocketBase (VPS/Cloud Server)
├── Database (SQLite/PostgreSQL)
├── File Storage (S3/MinIO)
├── CDN (CloudFlare)
└── Backup (Automated daily backups)
```

### Environment Variables
```env
# Production .env
NEXT_PUBLIC_POCKETBASE_URL=https://api.reviewr.com
POCKETBASE_ADMIN_EMAIL=admin@reviewr.com
POCKETBASE_ADMIN_PASSWORD=<secure-password>
POCKETBASE_ENCRYPTION_KEY=<encryption-key>
S3_BUCKET_NAME=reviewr-uploads
S3_ACCESS_KEY=<access-key>
S3_SECRET_KEY=<secret-key>
```

---

## 📝 Migration Plan

### Data Migration Strategy
1. **Backup Current State**: Export all mock data to JSON format
2. **Schema Creation**: Set up PocketBase collections with proper relationships
3. **Data Import**: Import existing data with proper ID mapping
4. **Verification**: Validate data integrity and relationships
5. **Cutover**: Switch from mock data to PocketBase queries

### Rollback Plan
- Keep mock data system as fallback
- Feature flags for gradual rollout
- Database snapshots before major changes
- Automated testing before deployment

---

This comprehensive integration plan provides a solid foundation for adding PocketBase as the off-chain database solution while maintaining the decentralized nature of the review verification system.