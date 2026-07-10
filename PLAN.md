# Real-Time Party Games — Implementation Plan

## 1. Project Goal

Build a mobile-first, full-stack web application that allows up to 12 participants to play three real-time party games:

- Trivia
- Pass the Parcel
- Truth or Dare

The application is designed for a single event and contains one global room only. There is no need for room creation, room codes, authentication accounts, or multiple concurrent sessions.

Every user who enters the application joins the same lobby.

Real-time communication must be implemented using WebSockets through Socket.IO, with the backend acting as the single authoritative source of truth for the entire application state.

## 2. Mandatory Principles

- The application must be written in Hebrew and use RTL layout.
- The application must be mobile-first.
- It must work properly on mobile browsers on both iOS and Android.
- It is a web application, not a native mobile application.
- The maximum number of users is 15, including the host.
- There is one global room only.
- There can be only one active host at any given time.
- The host controls game selection, game progression, and game termination.
- All game state must be managed by the backend.
- The frontend must never be trusted for roles, scores, timing, random selection, or game transitions.
- The live session state is stored in server memory only.
- Restarting the backend resets the entire lobby and active game.
- Game history does not need to be persisted.
- There is no permanent user registration or authentication system.
- Automated tests and Playwright are not required.
- Both projects must pass lint, typecheck, and build.
- Development must be divided into phases.
- The agent must not start the next phase until the current phase satisfies its acceptance criteria.

## 3. Technology Stack

### Frontend

React, TypeScript, Vite, React Router, Zustand, Socket.IO Client, Tailwind CSS, shadcn/ui, Framer Motion, canvas-confetti, react-i18next, Zod

### Backend

Node.js, Express, TypeScript, Socket.IO, Zod, dotenv, cors, helmet, pino

### Infrastructure

Docker, Docker Compose, Backend on Render, Frontend on Netlify

## 4. Repository Structure

Independent `frontend/` and `backend/` projects in one Git repository. No shared package.

## 5–47. Full Specification

See the original project brief for complete details on:

- Runtime architecture (authoritative Socket.IO server, in-memory session)
- Guest / Host roles
- Entry screen, avatars, localStorage reconnection
- Disconnection grace period (3 minutes) and host replacement
- Lobby, session state machine, player state, serializers
- Socket.IO protocol and error codes
- Trivia, Pass the Parcel, Truth or Dare game rules
- Backend and frontend folder structures
- Routing, Zustand, RTL/i18n, mobile-first, animations
- Environment variables, CORS, security, REST `/health`
- Docker Compose
- Implementation phases 1–7 and Definition of Done

## Implementation Phases

1. Project Foundation
2. Entry Screen and Single Lobby
3. Reconnection and Grace Period
4. Trivia
5. Pass the Parcel
6. Truth or Dare
7. UX, Mobile Support, and Production Readiness

Work phase-by-phase. Do not start the next phase until the current phase acceptance criteria are met.
