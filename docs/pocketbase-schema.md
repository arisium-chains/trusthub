# PocketBase Schema & Rules (MVP)

Base URL: `${POCKETBASE_URL}` (e.g., http://127.0.0.1:8090)

Collections

- users (auth)
  - email: email (auth)
  - password: password (auth)
  - name: text, optional
  - verification: json, optional (keys: wallet, worldId, twitter)
  - Rules
    - list/view: @request.auth.id != "" (or open if preferred)
    - create: allow (auth registration)
    - update: @request.auth.id = @request.data.id

- apps
  - name: text (required)
  - slug: text unique (required)
  - category: text
  - chain: text
  - Rules
    - list/view: allow
    - create: @request.auth.id != ""
    - update/delete: admin only

- reviews
  - app: relation -> apps (required)
  - user: relation -> users (required)
  - rating: number 1..5 (required)
  - comment: text (required)
  - txHash: text
  - status: select [pending, approved, rejected] (default pending)
  - created: (built-in)
  - Rules
    - list/view: status = "approved" OR @request.auth.id != ""
    - create: @request.auth.id != "" AND @request.data.user = @request.auth.id
    - update/delete: admin only

- aggregates
  - app: relation -> apps (unique)
  - score: number (0..100)
  - updated: (built-in)
  - Rules
    - list/view: allow
    - create/update: admin only (or backend-only token)

- audit_logs
  - type: text
  - ref: text
  - status: text
  - reason: text
  - Rules
    - list/view: admin only
    - create: admin only

Admin creation

- Create an admin in PocketBase UI, or promote a user.

Environment

- POCKETBASE_URL=http://127.0.0.1:8090
- NEXT_PUBLIC_POCKETBASE_URL=…

