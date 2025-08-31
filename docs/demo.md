# TrustHub Demo Guide

## Prerequisites
- Node 18+
- PocketBase running (local or remote)
- Admin credentials for PocketBase

## Setup
```bash
npm install
PB_URL=http://127.0.0.1:8090 PB_ADMIN_EMAIL=admin@example.com PB_ADMIN_PASSWORD=secret npm run pb:import
PB_URL=http://127.0.0.1:8090 PB_ADMIN_EMAIL=admin@example.com PB_ADMIN_PASSWORD=secret npm run seed:pb
```

## Env (.env.local)
```
POCKETBASE_URL=http://127.0.0.1:8090
NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
# Optional when using @worldcoin/minikit
NEXT_PUBLIC_MINIKIT_ID=your_project_id
```

## Run
```bash
npm run build && npm start
# Or dev with Turbopack
npm run dev
```

## Flows
- Browse apps: /apps → click any to view detail and reviews.
- Sign up/login: /auth/signup → /auth/login.
- Connect wallet: header → WalletConnect.
- Write review: /reviews/new (select app) → submit → redirected to app page; trust score updates.
- Create app: /apps/new (slug uniqueness validated, toast on success).
- Admin: /admin
  - Filter queue by status/search.
  - Approve/Reject/Shadowban; actions logged to audit_logs.

## Notes
- Safe when PocketBase offline: pages show empty states.
- To add MiniKit: `npm i @worldcoin/minikit` and set `NEXT_PUBLIC_MINIKIT_ID`.
