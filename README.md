# Clinic Front Desk

A full-stack app for clinic front-desk staff: sign in, manage a walk-in queue, and handle appointments. **Monorepo:** Node/Express/TypeScript API, React/Vite front end, MongoDB, shared design system.

---

## Features (at a glance)

| Area | What it does |
|------|----------------|
| **Auth** | Email + password login; JWT access + refresh tokens. Tokens are sent in **httpOnly cookies** (no tokens in response body or localStorage). Unauthenticated users are redirected to login. |
| **Refresh token** | When the access token expires, the app automatically gets a new one using the refresh token (sent in a cookie or body for compatibility). **Refresh token rotation:** each refresh issues a new refresh token and the old one is revoked in the DB, so tokens are one-time use. |
| **MFA (TOTP)** | Optional two-factor auth with an authenticator app (e.g. Google Authenticator). Users can enable it from the dashboard; at login they enter email/password then a 6-digit code. Not SMS (no Twilio)—uses time-based codes only. |
| **Dashboard** | Landing page after login; links to Queue and Appointments; logout; enable/disable MFA. |
| **Queue & Appointments** | Placeholder pages for walk-in queue and appointment booking—full features coming later. |
| **Design system** | Shared React components (Button, TextField) in `packages/design-system`, built on MUI. Used by the frontend via workspace link. |
| **CI** | GitHub Actions: backend tests, frontend unit tests, E2E (Playwright) against a production build. |

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
| **Backend** | `cd backend && yarn install && yarn dev` | `.env`: `PORT`, `MONGO_URI`, `JWT_SECRET`. Optional: `JWT_ACCESS_EXPIRY`, `JWT_REFRESH_EXPIRY`, `MFA_APP_NAME`. |
| **Frontend** | `cd frontend && yarn install && yarn dev` | `.env`: `VITE_API_URL=http://localhost:5000` |

Or from the repo root: `yarn install`, then `yarn workspace backend dev` (in one terminal) and `yarn workspace frontend dev` (in another). The backend dev script uses the root-installed `ts-node-dev`.

---

## Repo layout

| Path | Purpose |
|------|---------|
| `backend/` | Express API: auth (login, refresh, me), MFA (setup, enable, verify, disable), health. Mongoose + MongoDB. |
| `frontend/` | React SPA: login (with optional MFA step), dashboard, Queue/Appointments placeholders. React Router, auth context, protected routes. |
| `packages/design-system/` | Shared UI package: Button, TextField (MUI-based). Consumed by frontend. |

Nx is present for workspace tasks (e.g. `nx run backend:dev`); the main workflow is Yarn workspaces.

---

## How to test (auth, refresh, cookies, logout)

**Automated tests**

| What | Where | Command |
|------|--------|--------|
| Backend (health + auth) | `backend/` | `cd backend && yarn test` |
| Frontend unit tests | `frontend/` | `cd frontend && yarn test` |
| E2E (Playwright) | repo root | `yarn e2e` (or see `frontend/` for Playwright config) |

**Manual testing (enterprise auth: cookies + refresh rotation)**

1. **Start backend and frontend**
   - Backend: `cd backend && yarn dev` (ensure `.env` has `MONGO_URI`, `JWT_SECRET`).
   - Frontend: `cd frontend && yarn dev` (ensure `VITE_API_URL` points at backend, e.g. `http://localhost:5000`).

2. **Login and cookies**
   - Open the app in the browser (same origin or configured CORS; e.g. frontend on `http://localhost:5173`, backend on `http://localhost:5000` with `FRONTEND_URL=http://localhost:5173`).
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

**MFA testing** — See `docs/TESTING-REFRESH-AND-MFA.md` for enabling MFA, logging in with a code, and API-only flows.

---

## Docs

- **Testing refresh token & MFA** — `docs/TESTING-REFRESH-AND-MFA.md` (how to test manually and what enterprises use for MFA).
- **Architecture** — `docs/ARCHITECTURE-NOTES.md` (Module Federation vs Web Components vs the design-system library).
- **Publishing the design system** — `PUBLISHING.md` (if you publish to npm/GitHub Packages).

---

## Deploy

Backend: [Render](https://render.com) (or any Node host). Frontend: [Vercel](https://vercel.com) (or any static host). Set env vars in each; point frontend `VITE_API_URL` at the backend URL; allow the frontend origin in backend CORS (`FRONTEND_URL`).
