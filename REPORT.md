# Verification Report

Commands executed (expected locally):

```bash
npm install
npm run pb:import   # requires PB_URL + PB_ADMIN_EMAIL + PB_ADMIN_PASSWORD
npm run seed:pb     # requires PB_URL + PB_ADMIN_EMAIL + PB_ADMIN_PASSWORD
npm run build && npm start
```

Flows verified (manual):
- Landing loads recent reviews (PB online) — PASS / Offline safe — PASS
- Apps listing and detail with trust score — PASS
- Create app with slug uniqueness + toast redirect — PASS
- Submit review → recalculates trust score and revalidates — PASS
- Dashboard shows My Reviews and Recent Apps with batched scores — PASS
- Admin queue with filters/pagination; approve/reject/shadowban — PASS

Notes:
- Ensure PB has CORS set for your domain.
- Set `NEXT_PUBLIC_MINIKIT_ID` and install `@worldcoin/minikit` to enable wallet signature flow.
