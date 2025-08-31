#!/usr/bin/env node
// Idempotent PocketBase schema import
// Usage: PB_URL=http://127.0.0.1:8090 PB_ADMIN_EMAIL=... PB_ADMIN_PASSWORD=... node scripts/pb-import.mjs
import fs from 'node:fs'
import path from 'node:path'
import PocketBase from 'pocketbase'

const url = process.env.PB_URL || process.env.POCKETBASE_URL || 'http://127.0.0.1:8090'
const adminEmail = process.env.PB_ADMIN_EMAIL
const adminPassword = process.env.PB_ADMIN_PASSWORD
if (!adminEmail || !adminPassword) {
  console.error('Missing PB_ADMIN_EMAIL / PB_ADMIN_PASSWORD env')
  process.exit(1)
}

const schemaPath = path.join(process.cwd(), 'pb', 'schema.json')
if (!fs.existsSync(schemaPath)) {
  console.error('Schema file not found at pb/schema.json')
  process.exit(1)
}

const { collections } = JSON.parse(fs.readFileSync(schemaPath, 'utf8'))
const pb = new PocketBase(url)

async function upsertCollection(def) {
  const exist = (await pb.collections.getFullList()).find(c => c.name === def.name)
  if (!exist) {
    // create
    console.log('Create collection', def.name)
    return pb.collections.create({ name: def.name, type: def.type || 'base', schema: def.schema || [] })
  }
  // ensure fields
  const current = await pb.collections.getOne(exist.id)
  const existingFields = new Set(current.schema?.map(f => f.name) || [])
  const schema = [...current.schema]
  for (const f of def.schema || []) {
    if (!existingFields.has(f.name)) {
      console.log(`Add field ${def.name}.${f.name}`)
      schema.push(f)
    }
  }
  return pb.collections.update(exist.id, { schema })
}

async function main() {
  console.log('PB import — login', url)
  await pb.admins.authWithPassword(adminEmail, adminPassword)
  for (const col of collections) {
    await upsertCollection(col)
  }
  console.log('PB import — done')
}

main().catch(err => { console.error(err); process.exit(1) })

