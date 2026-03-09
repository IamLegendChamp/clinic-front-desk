# Clinic Front Desk

A full-stack app for clinic front-desk staff: sign in, manage a walk-in queue, and handle appointments. Built as a **monorepo** — **Node/Express/TypeScript** API + **React/Vite** front end, **MongoDB** for data, **JWT** for auth.

**Right now:** Login, dashboard, and placeholder pages for Queue and Appointments. Queue and appointment features are in progress.

---

## Try the app (users & reviewers)

| | |
|---|---|
| **Live app** | [clinic-frontend-phi-jade.vercel.app](https://clinic-frontend-phi-jade.vercel.app/) |
| **Demo login** | Email: `staff@clinic.com` · Password: `Staff123!` |

Open the link above, log in with the demo credentials, and use the dashboard and placeholder Queue / Appointments pages.

**API (for checking health):** [clinic-backend-9tkk.onrender.com/health](https://clinic-backend-9tkk.onrender.com/health)

---

## Development (run locally & stack)

**Prerequisites:** Node.js, Yarn, MongoDB (local or Atlas).

| Step | Command | Notes |
|------|--------|--------|
| **Backend** | `cd backend && yarn install && yarn dev` | Needs `.env`: `PORT`, `MONGO_URI`, `JWT_SECRET` |
| **Frontend** | `cd frontend && yarn install && yarn dev` | Needs `.env`: `VITE_API_URL=http://localhost:5000` |

**Repo layout:** `backend/` (Express API, auth, MongoDB) and `frontend/` (React SPA). Backend serves `/api/auth/login`, `/api/auth/me`; frontend uses React Router and an auth context with protected routes.

**Deploy:** Backend on [Render](https://render.com), frontend on [Vercel](https://vercel.com); env vars set in each dashboard.
