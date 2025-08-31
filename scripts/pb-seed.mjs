#!/usr/bin/env node
// Seed PocketBase with demo data (apps, a user, and reviews)
// Usage: PB_URL=http://127.0.0.1:8090 PB_ADMIN_EMAIL=admin@example.com PB_ADMIN_PASSWORD=secret node scripts/pb-seed.mjs
import PocketBase from 'pocketbase'

const url = process.env.PB_URL || process.env.POCKETBASE_URL || 'http://127.0.0.1:8090'
const adminEmail = process.env.PB_ADMIN_EMAIL
const adminPassword = process.env.PB_ADMIN_PASSWORD

if (!adminEmail || !adminPassword) {
  console.error('Missing PB_ADMIN_EMAIL / PB_ADMIN_PASSWORD env')
  process.exit(1)
}

const pb = new PocketBase(url)

async function ensureCollections() {
  const existing = (await pb.collections.getFullList()).map(c => c.name)
  const need = ['apps','reviews','aggregates','audit_logs']
  for (const name of need) {
    if (existing.includes(name)) continue
    if (name === 'apps') await pb.collections.create({ name, type: 'base', schema: [
      { name:'name', type:'text', required:true },
      { name:'slug', type:'text', required:true, options:{ pattern:"^[a-z0-9-]+$" } },
      { name:'category', type:'text' },
      { name:'chain', type:'text' },
    ] })
    if (name === 'reviews') await pb.collections.create({ name, type: 'base', schema: [
      { name:'app', type:'relation', options:{ collectionId:'', cascadeDelete:false } },
      { name:'user', type:'relation', options:{ collectionId:'', cascadeDelete:false } },
      { name:'rating', type:'number', required:true },
      { name:'comment', type:'text', required:true },
      { name:'txHash', type:'text' },
      { name:'status', type:'select', options:{ values:['pending','approved','rejected'] }, required:true },
    ] })
    if (name === 'aggregates') await pb.collections.create({ name, type: 'base', schema: [
      { name:'app', type:'relation', options:{ collectionId:'', cascadeDelete:false }, required:true },
      { name:'score', type:'number', required:true },
    ] })
    if (name === 'audit_logs') await pb.collections.create({ name, type: 'base', schema: [
      { name:'type', type:'text', required:true },
      { name:'ref', type:'text' },
      { name:'status', type:'text' },
      { name:'reason', type:'text' },
    ] })
  }
}

async function main() {
  console.log('Logging in as admin…', url)
  await pb.admins.authWithPassword(adminEmail, adminPassword)
  await ensureCollections()

  // Upsert demo apps
  const apps = [
    { name: 'Trust Wallet', slug:'trust-wallet', category:'Wallet', chain:'Ethereum' },
    { name: 'Safe', slug:'safe', category:'Wallet', chain:'Ethereum' },
    { name: 'Lens Miniapp', slug:'lens-miniapp', category:'Social', chain:'Polygon' },
    { name: 'Uniswap', slug:'uniswap', category:'DeFi', chain:'Ethereum' },
    { name: 'Aave', slug:'aave', category:'DeFi', chain:'Ethereum' },
    { name: 'OpenSea', slug:'opensea', category:'NFT', chain:'Ethereum' },
  ]
  for (const a of apps) {
    try { await pb.collection('apps').getFirstListItem(`slug = "${a.slug}"`) }
    catch { await pb.collection('apps').create(a) }
  }

  // Upsert demo users
  const users = [
    { email: 'demo@trusthub.local', name: 'Demo User', pass: 'changeme123' },
    { email: 'alice@trusthub.local', name: 'Alice Smith', pass: 'changeme123' },
    { email: 'bob@trusthub.local', name: 'Bob Johnson', pass: 'changeme123' },
    { email: 'charlie@trusthub.local', name: 'Charlie Brown', pass: 'changeme123' },
  ]
  
  const createdUsers = []
  for (const u of users) {
    try { 
      const existing = await pb.collection('users').getFirstListItem(`email = "${u.email}"`)
      createdUsers.push(existing)
    } catch {
      const newUser = await pb.collection('users').create({ 
        email: u.email, 
        password: u.pass, 
        passwordConfirm: u.pass, 
        name: u.name 
      })
      createdUsers.push(newUser)
    }
  }

  // Insert sample reviews with varied verification data
  const appList = await pb.collection('apps').getFullList()
  const reviewData = [
    // Trust Wallet reviews
    { appSlug: 'trust-wallet', userIndex: 0, rating: 5, comment: 'Excellent wallet with great security features!', status: 'approved', walletAddress: '0x1234567890123456789012345678901234567890', signature: 'sig1', signatureMessage: 'I verify this review', signatureVerified: true, worldIdVerified: true },
    { appSlug: 'trust-wallet', userIndex: 1, rating: 4, comment: 'Good wallet, easy to use interface.', status: 'approved', walletAddress: '0x2345678901234567890123456789012345678901', signature: 'sig2', signatureMessage: 'I verify this review', signatureVerified: true, worldIdVerified: false },
    { appSlug: 'trust-wallet', userIndex: 2, rating: 5, comment: 'Best mobile wallet I have used so far.', status: 'approved' },
    
    // Safe reviews
    { appSlug: 'safe', userIndex: 0, rating: 5, comment: 'Multi-sig wallet is perfect for team funds management.', status: 'approved', walletAddress: '0x3456789012345678901234567890123456789012', signature: 'sig3', signatureMessage: 'I verify this review', signatureVerified: true, worldIdVerified: true },
    { appSlug: 'safe', userIndex: 1, rating: 4, comment: 'Great security but setup can be complex for beginners.', status: 'approved', walletAddress: '0x4567890123456789012345678901234567890123', signature: 'sig4', signatureMessage: 'I verify this review', signatureVerified: true, worldIdVerified: false },
    { appSlug: 'safe', userIndex: 3, rating: 3, comment: 'Good concept but UI could be improved.', status: 'pending' },
    
    // Lens Miniapp reviews
    { appSlug: 'lens-miniapp', userIndex: 2, rating: 4, comment: 'Innovative social features, love the decentralized approach.', status: 'approved', walletAddress: '0x5678901234567890123456789012345678901234', signature: 'sig5', signatureMessage: 'I verify this review', signatureVerified: true, worldIdVerified: true },
    { appSlug: 'lens-miniapp', userIndex: 3, rating: 5, comment: 'Amazing social experience on Web3!', status: 'approved' },
    { appSlug: 'lens-miniapp', userIndex: 0, rating: 4, comment: 'Great potential, still in early stages.', status: 'approved' },
    
    // Uniswap reviews
    { appSlug: 'uniswap', userIndex: 1, rating: 5, comment: 'The best DEX for token swapping, liquidity is always good.', status: 'approved', walletAddress: '0x6789012345678901234567890123456789012345', signature: 'sig6', signatureMessage: 'I verify this review', signatureVerified: true, worldIdVerified: true },
    { appSlug: 'uniswap', userIndex: 2, rating: 4, comment: 'Easy to use but gas fees can be high during peak times.', status: 'approved', walletAddress: '0x7890123456789012345678901234567890123456', signature: 'sig7', signatureMessage: 'I verify this review', signatureVerified: true, worldIdVerified: false },
    { appSlug: 'uniswap', userIndex: 3, rating: 5, comment: 'Revolutionary DeFi protocol, changed how we trade.', status: 'approved' },
    { appSlug: 'uniswap', userIndex: 0, rating: 3, comment: 'Good but interface could be more beginner-friendly.', status: 'rejected' },
    
    // Aave reviews
    { appSlug: 'aave', userIndex: 0, rating: 5, comment: 'Best lending protocol with competitive rates.', status: 'approved', walletAddress: '0x8901234567890123456789012345678901234567', signature: 'sig8', signatureMessage: 'I verify this review', signatureVerified: true, worldIdVerified: true },
    { appSlug: 'aave', userIndex: 1, rating: 4, comment: 'Solid DeFi platform, good yields on deposits.', status: 'approved' },
    { appSlug: 'aave', userIndex: 2, rating: 4, comment: 'Reliable protocol but liquidation risks need careful management.', status: 'approved', walletAddress: '0x9012345678901234567890123456789012345678', signature: 'sig9', signatureMessage: 'I verify this review', signatureVerified: true, worldIdVerified: false },
    
    // OpenSea reviews
    { appSlug: 'opensea', userIndex: 3, rating: 4, comment: 'Great NFT marketplace with huge selection.', status: 'approved', walletAddress: '0xa123456789012345678901234567890123456789', signature: 'sig10', signatureMessage: 'I verify this review', signatureVerified: true, worldIdVerified: true },
    { appSlug: 'opensea', userIndex: 0, rating: 3, comment: 'Good platform but fees are quite high.', status: 'approved' },
    { appSlug: 'opensea', userIndex: 1, rating: 4, comment: 'Easy to browse and buy NFTs, good user experience.', status: 'approved' },
    { appSlug: 'opensea', userIndex: 2, rating: 2, comment: 'Too many scam projects, needs better curation.', status: 'shadowbanned' },
  ]
  
  // Clear existing reviews first
  const existingReviews = await pb.collection('reviews').getFullList()
  for (const review of existingReviews) {
    await pb.collection('reviews').delete(review.id)
  }
  
  // Create new reviews
  for (const reviewInfo of reviewData) {
    const app = appList.find(a => a.slug === reviewInfo.appSlug)
    if (!app) continue
    
    const user = createdUsers[reviewInfo.userIndex]
    if (!user) continue
    
    const reviewData = {
      app: app.id,
      user: user.id,
      rating: reviewInfo.rating,
      comment: reviewInfo.comment,
      status: reviewInfo.status,
    }
    
    // Add wallet verification fields if present
    if (reviewInfo.walletAddress) {
      reviewData.walletAddress = reviewInfo.walletAddress
      reviewData.signature = reviewInfo.signature
      reviewData.signatureMessage = reviewInfo.signatureMessage
      reviewData.signatureVerified = reviewInfo.signatureVerified
      reviewData.worldIdVerified = reviewInfo.worldIdVerified
    }
    
    await pb.collection('reviews').create(reviewData)
  }

  console.log('Seed completed.')
}

main().catch(err => { console.error(err); process.exit(1) })

