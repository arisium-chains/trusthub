# Deploy Pack (Vercel + PocketBase)

## PocketBase
- Option 1: PocketBase Cloud (recommended for demo)
- Option 2: Self-host via Docker

### Docker Compose
```yaml
version: '3.9'
services:
  pocketbase:
    image: ghcr.io/pocketbase/pocketbase:latest
    command: serve --http=0.0.0.0:8090
    volumes:
      - ./pb_data:/pb_data
    ports:
      - "8090:8090"
```

### Import schema and seed
```bash
PB_URL=http://your-pb.example.com:8090 PB_ADMIN_EMAIL=admin@example.com PB_ADMIN_PASSWORD=secret npm run pb:import
PB_URL=http://your-pb.example.com:8090 PB_ADMIN_EMAIL=admin@example.com PB_ADMIN_PASSWORD=secret npm run seed:pb
```

## Vercel (Next.js)
- Set environment variables in Vercel Project:
  - `POCKETBASE_URL` (server-only)
  - `NEXT_PUBLIC_POCKETBASE_URL`
  - `NEXT_PUBLIC_MINIKIT_ID` (optional)
- Build Command: `npm run build`
- Output: default

## DNS/CORS
- Add your Vercel domain to PocketBase CORS allowlist.

## Post-deploy checks
- Visit `/` → recent reviews load.
- Visit `/apps` → list shows.
- Visit `/apps/new` → create app and redirect.
- Visit `/admin` → moderation queue accessible to admins.
