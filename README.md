# Objects

A PHP + React app for managing dynamic objects grouped into spaces, backed by MongoDB.

## Stack

- **PHP 8.3** — REST API with FastRoute, no framework
- **MongoDB** — `users`, `spaces`, `objects` collections
- **React 18 + Vite 5** — SPA frontend; Vite proxies `/api/*` to PHP so everything is same-origin
- **Google OIDC** — server-side auth flow, file-based PHP sessions
- **Docker Compose** — `mongo`, `php`, `frontend` services

## Setup

**1. Create your `.env` file:**

```bash
cp .env.example .env
# fill in GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
```

**2. In Google Cloud Console**, add this as an authorized redirect URI:

```
http://localhost:5173/api/auth/callback
```

**3. Start everything:**

```bash
docker compose up --build
```

App is at `http://localhost:5173`.

## How it works

- Vite proxies all `/api/*` requests to the PHP container — no CORS needed, session cookies just work
- The OIDC flow is entirely server-side: login → Google → callback → session set → redirect to frontend
- Objects have base fields (`_id`, `spaceId`, `userId`, `createdAt`, `updatedAt`) plus any dynamic fields you provide as JSON; reserved fields are stripped from user input before saving

## Key files

| Path | Purpose |
|------|---------|
| `backend/src/Controllers/` | All API business logic |
| `backend/src/Serializer.php` | Converts BSON types (ObjectId, UTCDateTime) to JSON |
| `frontend/src/api.ts` | Typed API client |
| `frontend/vite.config.ts` | Proxy config pointing to `http://php:8080` |

## API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/auth/login` | Redirect to Google |
| `GET` | `/api/auth/callback` | Google callback, sets session |
| `POST` | `/api/auth/logout` | Destroy session |
| `GET` | `/api/auth/me` | Current user |
| `GET` | `/api/spaces` | List your spaces |
| `POST` | `/api/spaces` | Create a space `{ name }` |
| `GET` | `/api/spaces/:id` | Get a space |
| `PATCH` | `/api/spaces/:id` | Update a space `{ name }` |
| `DELETE` | `/api/spaces/:id` | Delete a space and its objects |
| `GET` | `/api/spaces/:id/objects` | List objects in a space |
| `POST` | `/api/spaces/:id/objects` | Create an object (body = dynamic fields as JSON) |
| `GET` | `/api/objects/:id` | Get an object |
| `PATCH` | `/api/objects/:id` | Update an object's dynamic fields |
| `DELETE` | `/api/objects/:id` | Delete an object |
