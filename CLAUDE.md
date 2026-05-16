# chatter-be

Express/TypeScript REST API with WebSocket support for the Chatter messaging app.

## What it does
Handles auth, user management, and real-time messaging. Users register and log in, then send messages in 1-on-1 or group conversations. When a message is sent, the server persists it to PostgreSQL and pushes a WebSocket notification to all other participants. Unseen message state is tracked per user per conversation in the DB.

## Stack
- **Runtime**: Node.js 20, TypeScript
- **Framework**: Express 4
- **ORM**: Prisma 6 + PostgreSQL
- **Auth**: JWT in httpOnly cookies (`auth-token`)
- **Real-time**: `ws` library — WebSocket server shares the HTTP server
- **Storage**: AWS S3 for user avatars (pre-signed URLs)

## Commands
```bash
npm start          # dev server (tsc --watch + ts-node-dev)
npm test           # unit + integration tests
npm run test:unit
npm run test:integration
npm run test:acceptance
```

Tests require a real PostgreSQL instance — no mocking the DB.

## Structure
```
src/
  index.ts              # entry point
  app.ts                # express setup, middleware, routes
  routes/
    authRoutes/         # POST /login, /register, /logout
    chatRoutes/         # GET /chats, POST /message, PATCH /readThread, etc.
    settingsRoutes/     # avatar + user settings
  middlewares/
    stripApi.ts         # strips /api, /ws/api, /api/test prefixes from incoming requests
    tokenVerification.ts
  websocket/            # WS server setup, per-user socket map, notify helpers
  queries/              # raw SQL for complex chat fetches
  storage/              # S3 accessors
prisma/schema.prisma    # source of truth for DB schema
```

## Testing
Three Jest projects, each with a distinct setup:

| Project | Command | DB | Notes |
|---|---|---|---|
| `unit` | `npm run test:unit` | mocked (Prisma mock) | utilities, WS validation, outage handling |
| `integration` | `npm run test:integration` | real (reseeded) | every route tested end-to-end via supertest |
| `acceptance` | `npm run test:acceptance` | real (reseeded) | full user flow from register → message |

`npm test` runs unit + integration together. Acceptance is run separately.

Coverage thresholds: 95% branches/lines/statements, 80% functions. Tests will fail if these aren't met.

## Key details
- `stripApiPrefix` middleware normalizes routes so the app works behind nginx without path rewriting
- WebSocket connections are authenticated during the HTTP upgrade handshake
- `Thread.unseenMessageId` tracks the first unread message per user per conversation
- Path aliases: `@src/`, `@test/`, `@openapi/`
- Jest coverage threshold: 95% lines/statements
