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
  ]
  for (const a of apps) {
    try { await pb.collection('apps').getFirstListItem(`slug = "${a.slug}"`) }
    catch { await pb.collection('apps').create(a) }
  }

  // Upsert demo user
  const email = 'demo@trusthub.local'
  const pass = 'changeme123'
  try { await pb.collection('users').getFirstListItem(`email = "${email}"`) }
  catch {
    await pb.collection('users').create({ email, password: pass, passwordConfirm: pass, name: 'Demo User', verification:{ wallet:'0xabc...' } })
  }
  const user = await pb.collection('users').getFirstListItem(`email = "${email}"`)

  // Insert sample reviews (approved)
  const list = await pb.collection('apps').getFullList()
  for (const app of list) {
    await pb.collection('reviews').create({ app: app.id, user: user.id, rating: 5, comment: `Great ${app.name}!`, status:'approved' })
  }

  console.log('Seed completed.')
}

main().catch(err => { console.error(err); process.exit(1) })

