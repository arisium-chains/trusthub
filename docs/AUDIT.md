# TrustHub Audit (Phase One)

## Stack & Structure (Detected)
- Next.js 14 App Router, TypeScript, Tailwind v3 + shadcn/ui
- Key pages: `/`, `/apps`, `/apps/[slug]`, `/apps/new`, `/dashboard`, `/reviews/new`, `/admin`, `/auth/login`, `/auth/signup`
- Server actions in `app/actions/*` for auth, apps, reviews, trust, admin, aggregates, me
- PocketBase SDK installed; ESM import; cookie bridge for SSR
- MiniKit wrapper with walletAuth placeholder; safe without SDK

## Done
- Landing shows recent approved reviews (PB‑backed)
- Apps list + detail with Trust Score aggregate
- Review submission (server action) → recalculates trust score → revalidate + redirect
- Admin queue (approve/reject + audit logs), offline‑safe
- Dashboard: My Reviews (current user), Recent Apps (batched trust scores), View All + Create App CTA
- Create App form with server‑side slug uniqueness + inline error + success toast
- Seed script (`npm run seed:pb`) and schema docs
- SWC fix script; Tailwind + shadcn setup

## Missing/Planned
- PocketBase import JSON + `npm run pb:import` (idempotent) — PLANNED in this phase
- Admin queue filters + pagination + shadowban — PARTIAL (approve/reject done; filters/pagination/shadowban pending)
- shadcn toasts + error banners — PARTIAL (inline + simple toast present)
- MiniKit Light+ (wallet + signature, review verified badge) — PARTIAL (wallet only)
- docs/demo.md (demo script) and docs/deploy.md (Vercel + PB) — PLANNED

## Risks
- Admin route security depends on PB rules + server action checks
- Batched aggregate uses OR filter string; PB size limits fine for small lists
