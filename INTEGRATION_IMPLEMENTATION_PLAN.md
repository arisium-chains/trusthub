# Implementation Plan: World ID MiniApp SDK & PocketBase Integration

## Overview
This document details the implementation plan for integrating World ID's MiniApp SDK and PocketBase into the Decentralized Community Review Platform (DCRP). This integration will replace the current mock implementations with production-ready systems for authentication, data storage, and token management.

## Current Architecture Assessment

### Wallet Integration
Currently using a mock implementation in `src/lib/miniapp-sdk.ts` that simulates:
- Wallet connection
- Wallet disconnection
- Message signing
- Transaction sending

### User Authentication & Data Storage
Currently using localStorage for:
- Wallet connection state
- TRH token balances
- Transaction history
- World ID verification status

### Token Management
TRH tokens are mock-managed with localStorage persistence in `src/lib/trh-token.ts`

## Integration Goals

1. Replace mock MiniApp SDK with World ID's actual MiniApp SDK
2. Implement PocketBase for off-chain data storage
3. Create proper authentication flow between World ID and PocketBase
4. Implement on-chain token interactions through smart contracts
5. Ensure production-grade security, error handling, and scalability

## Detailed Implementation Steps

### Phase 1: Environment Setup & Dependencies

#### 1.1 Environment Variables
Create `.env.local` with required configuration:
```env
NEXT_PUBLIC_WORLD_ID_APP_ID=your_world_id_app_id
NEXT_PUBLIC_POCKETBASE_URL=https://your-pocketbase-instance.com
POCKETBASE_ADMIN_EMAIL=admin@example.com
POCKETBASE_ADMIN_PASSWORD=your_secure_password
NEXT_PUBLIC_TRH_CONTRACT_ADDRESS=0xYourTRHContractAddress
```

#### 1.2 Dependencies Installation
Install required packages:
```bash
npm install pocketbase @worldcoin/minikit
```

### Phase 2: World ID MiniApp SDK Integration

#### 2.1 Replace Mock SDK
Replace `src/lib/miniapp-sdk.ts` with actual World ID MiniApp SDK integration:
- Implement wallet connection using World ID's wallet provider
- Implement message signing with World ID's secure signing methods
- Implement transaction sending through World ID's transaction handler

#### 2.2 Authentication Service
Create `src/services/auth-service.ts`:
- Handle World ID authentication flow
- Manage authentication tokens
- Implement session management

#### 2.3 Wallet Hook Enhancement
Update `src/hooks/useWallet.ts`:
- Integrate with World ID MiniApp SDK
- Implement proper error handling
- Add loading states for all operations

### Phase 3: PocketBase Integration

#### 3.1 PocketBase Client Setup
Create `src/lib/pocketbase.ts`:
- Initialize PocketBase client
- Implement authentication with World ID tokens
- Add request/response interceptors for error handling

#### 3.2 Data Models Implementation
Based on the PocketBase integration document, implement the following collections:
1. Users
2. Businesses
3. Reviews
4. Business Responses
5. Review Votes
6. Business Categories
7. User Activities
8. Content Flags

#### 3.3 Service Layer
Create service files for each data model:
- `src/services/user-service.ts`
- `src/services/business-service.ts`
- `src/services/review-service.ts`
- `src/services/response-service.ts`

#### 3.4 Real-time Updates
Implement real-time functionality using PocketBase's subscription features:
- Live updates for new reviews
- Real-time business response notifications
- Activity feed updates

### Phase 4: On-Chain Integration

#### 4.1 Smart Contract Interface
Create `src/lib/trh-contract.ts`:
- Interface with TRH token smart contract
- Implement token balance retrieval
- Implement token transfer functions
- Handle transaction confirmations

#### 4.2 Token Management Service
Update `src/lib/trh-token.ts`:
- Replace localStorage implementation with on-chain data
- Implement proper error handling for blockchain operations
- Add transaction monitoring

### Phase 5: Data Flow Implementation

#### 5.1 Review Submission Flow
Implement complete review submission process:
1. User writes review
2. Review content uploaded to IPFS
3. Review hash signed with World ID
4. Transaction sent to smart contract
5. Review data stored in PocketBase
6. Real-time updates to UI

#### 5.2 Business Registration Flow
Implement business registration:
1. Business owner connects wallet
2. Business data validated
3. Business registered on-chain (if required)
4. Business data stored in PocketBase
5. Verification process initiated

#### 5.3 Token Distribution Flow
Implement token reward distribution:
1. Review quality calculated
2. Reward amount determined
3. Transaction sent to smart contract
4. Token balance updated in UI
5. Transaction recorded in PocketBase

### Phase 6: Security & Production Readiness

#### 6.1 Authentication Security
- Implement proper JWT token handling
- Securely store authentication tokens
- Validate all API requests
- Implement rate limiting

#### 6.2 Data Protection
- Encrypt sensitive data in transit and at rest
- Implement proper CORS policies
- Sanitize all user inputs
- Add input validation on both frontend and backend

#### 6.3 Error Handling
- Implement comprehensive error handling
- Add user-friendly error messages
- Log errors for monitoring
- Implement retry mechanisms

#### 6.4 Performance Optimization
- Implement caching strategies
- Optimize database queries
- Use code splitting and lazy loading
- Optimize images and assets

### Phase 7: Testing & Deployment

#### 7.1 Testing Strategy
- Unit tests for all service functions
- Integration tests for data flows
- End-to-end tests for user journeys
- Security testing

#### 7.2 Deployment Process
- Set up staging environment
- Implement CI/CD pipeline
- Configure monitoring and alerting
- Prepare production deployment

## File Structure Changes

```
src/
├── lib/
│   ├── pocketbase.ts          # PocketBase client
│   ├── miniapp-sdk.ts         # World ID MiniApp SDK (replaced)
│   ├── trh-contract.ts        # TRH token contract interface
│   ├── worldid.ts             # World ID verification (updated)
│   └── trh-token.ts           # Token management (updated)
├── services/
│   ├── auth-service.ts        # Authentication service
│   ├── user-service.ts        # User data service
│   ├── business-service.ts    # Business data service
│   ├── review-service.ts      # Review data service
│   ├── response-service.ts    # Response data service
│   └── token-service.ts       # Token operations service
├── hooks/
│   └── useWallet.ts           # Updated wallet hook
└── components/
    └── (existing components updated to use new services)
```

## Implementation Timeline

### Week 1: Environment Setup & World ID Integration
- Set up environment variables
- Install dependencies
- Replace mock MiniApp SDK with World ID integration
- Implement authentication service

### Week 2: PocketBase Integration - Part 1
- Set up PocketBase client
- Implement basic data models
- Create service layer for data operations

### Week 3: PocketBase Integration - Part 2
- Implement real-time updates
- Add advanced querying capabilities
- Implement file upload functionality

### Week 4: On-Chain Integration
- Implement TRH contract interface
- Update token management service
- Implement transaction monitoring

### Week 5: Data Flow Implementation
- Implement review submission flow
- Implement business registration flow
- Implement token distribution flow

### Week 6: Security & Production Readiness
- Implement security measures
- Add error handling and logging
- Optimize performance
- Prepare for testing

### Week 7: Testing & Deployment
- Conduct comprehensive testing
- Set up staging environment
- Deploy to production
- Monitor and optimize

## Success Criteria

1. Users can successfully authenticate with World ID
2. Data is properly stored and retrieved from PocketBase
3. Token transactions execute successfully on-chain
4. All security measures are implemented
5. Performance meets acceptable standards
6. Error handling works correctly in all scenarios
7. Real-time updates function properly
8. The application is ready for production deployment