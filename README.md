# Real-Time Party Games

Mobile-first Hebrew RTL party games (Trivia, Pass the Parcel, Truth or Dare) for a single shared lobby of up to 12 players. The backend is the authoritative source of truth over Socket.IO. Live session state is in-memory only.

## Stack

- **Frontend:** React, TypeScript, Vite, Tailwind, Zustand, Socket.IO Client, react-i18next
- **Backend:** Node.js, Express, TypeScript, Socket.IO, Zod, Pino
- **Infra:** Docker Compose (backend + frontend), Netlify (frontend), Render (backend)

## Local development (Docker)

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Health: http://localhost:3000/health

Default host password: `change-me` (override with `HOST_PASSWORD`).

## Local development (without Docker)

1. Backend:

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

2. Frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Scripts

Both projects support:

- `npm run dev`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Environment variables

### Backend

| Variable | Description |
| --- | --- |
| `HOST_PASSWORD` | **Required.** Password to join as host |
| `NODE_ENV` | Optional (default `development`) |
| `PORT` | Optional (default `3000`) |
| `CORS_ORIGIN` | Optional (default `*`) |
| `MAX_PLAYERS` | Optional (default `12`) |
| `PLAYER_DISCONNECT_GRACE_MS` | Optional (default `180000` — 3 minutes) |

### Frontend

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Backend HTTP base URL |
| `VITE_SOCKET_URL` | Socket.IO server URL |

## Production

- **Frontend (Netlify):** Connect the repo and set the base directory to `frontend` (or use root [`netlify.toml`](./netlify.toml)). Build: `npm run build`. Publish: `dist`. Set:
  - `VITE_API_URL=https://<your-backend>.onrender.com`
  - `VITE_SOCKET_URL=https://<your-backend>.onrender.com`
- **Backend (Render):** Deploy the `backend` service as a **single instance** (no autoscaling / multiple replicas). Start command: `npm run start` (after `npm run build`). Set `HOST_PASSWORD` (required). Other env vars are optional and have defaults.
- WebSockets work over Render HTTPS (WSS). Restarting the backend clears the live lobby and game state.
- Drop avatar `.webp` files into `frontend/public/avatars/` before production deploy.

## Avatars

Place `.webp` files under `frontend/public/avatars/` matching IDs in `frontend/src/features/entry/avatars.ts` and `backend/src/data/avatars.ts`.

## Spec

See [PLAN.md](./PLAN.md) for the full product and technical specification.
