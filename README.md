# Clinic Front Desk

Monorepo: backend (Node/Express/TS + MongoDB) + frontend (React/Vite).

## Live

- **Frontend:** https://clinic-frontend-phi-jade.vercel.app/
- **Backend API:** https://clinic-backend-9tkk.onrender.com/  
  - Health: https://clinic-backend-9tkk.onrender.com/health

**Demo login** (for recruiters / reviewers):

- **Email:** `staff@clinic.com`
- **Password:** `Staff123!`

## Run locally

**Backend**
- `cd backend && yarn install && yarn dev`
- Uses `.env`: `PORT`, `MONGO_URI`, `JWT_SECRET`

**Frontend**
- `cd frontend && yarn install && yarn dev`
- Uses `.env`: `VITE_API_URL=http://localhost:5000`
