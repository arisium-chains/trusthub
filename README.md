# TrustHub — Next.js + Tailwind (Turbopack)

Local dev

- Install deps: `npm install`
- Run dev (Turbopack): `npm run dev`
- Build: `npm run build` → `npm start`

UI stack

- Tailwind CSS configured in `tailwind.config.ts` and `app/globals.css`.
- shadcn/ui components under `components/ui/*` (button, card, input, textarea, badge, avatar).
- Utility `cn()` in `lib/utils.ts` (clsx + tailwind-merge).

Notes

- Reference images live under `design/` in repo; to serve them in-app, copy into `public/design/`.
- Optional PocketBase backend: set `POCKETBASE_URL` in `.env.local` and `npm i pocketbase`.
- To add more shadcn components later: configure CLI via `components.json` and run `npx shadcn add component-name`.

Troubleshooting

- Ports in use: Next auto-increments (3000 → 3001 → …). To pin a port, run `PORT=3010 npm run dev`.
- SWC binary missing (darwin/arm64, x64, etc.):
  - Auto-fix: `npm run fix:swc`
  - Manual (pick one):
    - Apple Silicon: `npm i -D @next/swc-darwin-arm64@14.2.5`
    - Intel macOS: `npm i -D @next/swc-darwin-x64@14.2.5`
    - Linux x64: `npm i -D @next/swc-linux-x64-gnu@14.2.5`
    - Windows x64: `npm i -D @next/swc-win32-x64-msvc@14.2.5`
  - If issues persist: `rm -rf node_modules package-lock.json .next && npm install`
- World App MiniKit
  - Install: `npm i @worldcoin/minikit`
  - Env: add `NEXT_PUBLIC_MINIKIT_ID` to `.env.local`
  - Use: wallet connect in UI calls MiniKit `walletAuth()` and saves the address to PocketBase user profile.
