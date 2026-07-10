# Render deployment notes

## Backend (Web Service)

Deploy the `backend` folder as a **Web Service** on Render.

### Critical

- Use **one instance only**. Do not enable horizontal scaling or multiple replicas.
- Live session state is in-memory; a restart resets the lobby and active game.

### Build / start

- Build: `npm install && npm run build`
- Start: `npm run start`

### Environment

Required:

```
HOST_PASSWORD=<secret>
```

Optional (have code defaults — set only to override):

```
NODE_ENV=production
PORT=<Render assigns this>
CORS_ORIGIN=*
MAX_PLAYERS=12
PLAYER_DISCONNECT_GRACE_MS=180000
```

## Frontend (Static Site) — optional

If you host the frontend on Render as a **Static Site** (root / publish: `frontend/dist`):

- Build command: `npm install && npm run build` (root directory: `frontend`)
- Publish directory: `dist`
- SPA rewrites come from [`frontend/public/_redirects`](../frontend/public/_redirects) (copied into `dist` on build)
- Set `VITE_API_URL` and `VITE_SOCKET_URL` to the backend Render URL at build time
