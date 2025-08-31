# TrustHub — Project Progress Report

## Overview
A mobile‑first Next.js 14 (App Router, TS, Tailwind + shadcn/ui) MVP with PocketBase backend is wired and demo‑ready. Server actions replace mocks; flows are resilient when PocketBase is offline.

## Implemented
- PB actions: auth, apps, reviews, trust recalculation, aggregates (batched), admin (moderation + stats), me (my reviews)
- Pages: `/`, `/apps`, `/apps/[slug]`, `/apps/new`, `/dashboard`, `/reviews/new`, `/admin`, `/auth/*`
- Dashboard: My Reviews + Recent Apps with scores, View All, Create App
- Create App: server validation (slug uniqueness), inline error, toast → redirect
- MiniKit Light+: wallet + signature pipeline (wrapper + UI), stored in user verification
- Seed + Import: `pb/schema.json`, `npm run pb:import`, `npm run seed:pb`

## Commands
```
npm install
PB_URL=... PB_ADMIN_EMAIL=... PB_ADMIN_PASSWORD=... npm run pb:import
PB_URL=... PB_ADMIN_EMAIL=... PB_ADMIN_PASSWORD=... npm run seed:pb
npm run build && npm start
```

## Next (Optional)
- Importable PB rules JSON; stricter rule enforcement
- Full MiniKit auth + on‑chain proof capture UX
- Moderation bulk UI improvements; pagination UX
