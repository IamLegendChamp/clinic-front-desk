# Clinic Front Desk

A full-stack app for clinic front-desk staff: sign in, manage a walk-in queue, and handle appointments. **Monorepo:** Node/Express/TypeScript API, React/Vite front end, MongoDB. **View:** MUIBook Web Components (React wrappers). **Shared logic:** Module Federation remote (`packages/shared`).

---

## Features (at a glance)

| Area | What it does |
|------|----------------|
| **Auth** | Email + password login; JWT access + refresh tokens. No built-in MFA (TOTP removed); when you add an IdP (e.g. Microsoft Entra), MFA is handled there. Tokens are sent in **httpOnly cookies** (no tokens in response body or localStorage). Unauthenticated users are redirected to login. |
| **Refresh token** | When the access token expires, the app automatically gets a new one using the refresh token (sent in a cookie or body for compatibility). **Refresh token rotation:** each refresh issues a new refresh token and the old one is revoked in the DB, so tokens are one-time use. |
| **Dashboard** | Landing page after login; links to Queue and Appointments; logout. |
| **Queue & Appointments** | Placeholder pages for walk-in queue and appointment booking—full features coming later. |
| **View layer** | MUIBook Web Components (`@muibook/components`) with thin React wrappers in `frontend/src/components/ui/`. No business logic in components. |
| **Shared logic** | Auth/API live in a federated remote (`packages/shared`); the frontend (host) loads them at runtime via Module Federation. |
| **CI** | GitHub Actions: backend tests, frontend unit tests, E2E (Playwright). E2E runs with shared remote served on 5174. |

---

## Try the app

| | |
|---|---|
| **Live app** | [clinic-frontend-phi-jade.vercel.app](https://clinic-frontend-phi-jade.vercel.app/) |
| **Demo login** | Email: `staff@clinic.com` · Password: `Staff123!` |

**API health:** [clinic-backend-9tkk.onrender.com/health](https://clinic-backend-9tkk.onrender.com/health)

---

## Run locally

**Prerequisites:** Node.js, Yarn, MongoDB (local or [Atlas](https://www.mongodb.com/atlas)).

| Step | Command | Env |
|------|--------|-----|
| **Backend** | `cd backend && yarn install && yarn dev` | `.env`: `PORT`, `MONGO_URI`, `JWT_SECRET`. Optional: `JWT_ACCESS_EXPIRY`, `JWT_REFRESH_EXPIRY`. |
| **Shared remote** | From root: `yarn dev:shared` (builds and serves on **5174**) | — |
| **Frontend** | From root: `yarn dev:frontend` (Vite dev on **5173**) | `.env`: `VITE_API_URL=http://localhost:5001` |

**One command from root:** `yarn install` then `yarn dev` runs both shared (5174) and frontend (5173) via concurrently. For backend, run `yarn workspace backend dev` in a separate terminal.

---

## Repo layout

| Path | Purpose |
|------|---------|
| `backend/` | Express API: auth (login, refresh, me), health. Mongoose + MongoDB. |
| `frontend/` | React SPA (host): login, dashboard, Queue/Appointments placeholders. Consumes shared remote at runtime; uses MUIBook via React wrappers. |
| `packages/shared/` | Federated remote: auth API, axios client, config. Built with Vite + Module Federation; served at dev on 5174. |

---

## How to test (auth, refresh, cookies, logout)

**Automated tests**

| What | Where | Command |
|------|--------|--------|
| Backend (health + auth) | `backend/` | `cd backend && yarn test` |
| Frontend unit tests | `frontend/` | `cd frontend && yarn test` |
| E2E (Playwright) | repo root | Build shared + frontend, serve shared on 5174, then `yarn workspace frontend e2e`. CI does this automatically. |

**Manual testing (enterprise auth: cookies + refresh rotation)**

1. **Start backend, shared remote, and frontend**
   - Backend: `cd backend && yarn dev` (ensure `.env` has `MONGO_URI`, `JWT_SECRET`).
   - From root: `yarn dev` (shared on 5174 + frontend on 5173), or run `yarn dev:shared` and `yarn dev:frontend` in two terminals.
   - Ensure frontend `.env` has `VITE_API_URL` pointing at backend (e.g. `http://localhost:5001`).

2. **Login and cookies**
   - Open the app in the browser (same origin or configured CORS; e.g. frontend on `http://localhost:5173`, backend on `http://localhost:5001` with `FRONTEND_URL=http://localhost:5173`).
   - Log in with valid credentials (e.g. demo: `staff@clinic.com` / `Staff123!`).
   - In DevTools → Application → Cookies, confirm `accessToken` and `refreshToken` are set (httpOnly, so not visible to JS). Response body should contain only `{ user }` (no tokens).

3. **Protected routes**
   - Navigate to Dashboard, Queue, Appointments. You should stay signed in. If you open DevTools → Network, authenticated requests should send the cookie (no `Authorization` header needed when using cookies).

4. **Refresh (rotation)**
   - Shorten access expiry for testing: in backend `.env` set `JWT_ACCESS_EXPIRY=30s`, restart backend.
   - Log in again, then wait ~30 seconds and trigger any authenticated request (e.g. reload Dashboard or click around). The app should call `POST /api/auth/refresh` (with the refresh cookie), get new access + refresh cookies, and continue without redirecting to login.
   - Optional: call refresh twice with the same refresh token (e.g. via a second tab or API client); the second call should 401 (token already used/revoked).

5. **Logout**
   - Click Logout. Cookies should be cleared and you should be redirected to login. The refresh token should be revoked in the DB (so that token cannot be used again).

---

## Docs

- **Architecture** — `docs/ARCHITECTURE-NOTES.md` (Web Components + Module Federation, shared remote, no logic in components).
- **Testing refresh token** — `docs/TESTING-REFRESH-AND-MFA.md` (manual testing, cookies, refresh rotation; MFA removed, doc notes IdP-based MFA later).
- **CI → Deploy** — `docs/CI-DEPLOY-SETUP.md` (GitHub Actions, Render + Vercel hooks).

---

## Deploy

Backend: [Render](https://render.com) (or any Node host). Frontend: [Vercel](https://vercel.com) (or any static host). Set env vars in each; point frontend `VITE_API_URL` at the backend URL; allow the frontend origin in backend CORS (`FRONTEND_URL`). For the frontend build, set `VITE_SHARED_REMOTE_URL` to the URL where the shared remote is served (e.g. same origin `/shared/` or a CDN). The shared remote must be built (`yarn workspace shared build`) and deployed so its `remoteEntry.js` is available at that URL.
