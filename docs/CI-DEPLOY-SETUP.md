# CI → Deploy (GitHub Actions triggers Render + Vercel)

**Flow:** Push to `main` → GitHub Actions runs (backend tests, frontend tests, E2E) → **only if all pass** → Actions triggers Render (backend) and Vercel (frontend) deploys. Fully automated; no deploy runs if CI fails.

---

## 1. Turn off auto-deploy so only CI can trigger deploys

### Render (backend)

1. Open **Render Dashboard** → your **backend service**.
2. Go to **Settings**.
3. Under **Build & Deploy**, set **Auto-Deploy** to **No** (or **Off**).
4. Save. Deploys will only run when the deploy hook is called (from GitHub Actions).

### Vercel (frontend)

The repo already has **`"git": { "deploymentEnabled": false }`** in the root **`vercel.json`**. That keeps the repo connected to Vercel but **disables** automatic deploys on every push.

- **If your Vercel project uses the repo root** (Root Directory = `.` or empty):  
  Commit and push the current `vercel.json`. After that, pushes to `main` will **not** start a Vercel deploy; only the deploy hook will.
- **If your Vercel project uses the `frontend` folder** (Root Directory = `frontend`):  
  Add the same setting to **`frontend/vercel.json`**:
  ```json
  "git": { "deploymentEnabled": false }
  ```
  Then push. Vercel will still be connected to Git; only the automatic “deploy on push” is turned off.

Result: one deploy for the frontend only when GitHub Actions calls the Vercel deploy hook (after CI passes).

---

## 2. Get the deploy hook URLs

### Render (backend)

1. **Render Dashboard** → your **backend service**.
2. **Settings** → find **Deploy Hook** (under Build & Deploy or similar).
3. Copy the **Deploy Hook URL** (e.g. `https://api.render.com/deploy/srv/xxxxx?key=yyyy`).

### Vercel (frontend)

1. **Vercel Dashboard** → your **frontend project**.
2. **Settings** → **Git** → **Deploy Hooks**.
3. Click **Create Hook**.
4. Name: e.g. `GitHub Actions`, branch: `main`.
5. **Create** and copy the generated **URL** (e.g. `https://api.vercel.com/v1/integrations/deploy/...`).

---

## 3. Add GitHub secrets

1. **GitHub** → your repo → **Settings** → **Secrets and variables** → **Actions**.
2. **New repository secret** for each:
   - **Name:** `RENDER_DEPLOY_HOOK_URL`  
     **Value:** the Render deploy hook URL from step 2.
   - **Name:** `VERCEL_DEPLOY_HOOK_URL`  
     **Value:** the Vercel deploy hook URL from step 2.

If a secret is missing, the workflow skips that deploy step (no failure).

---

## 4. Flow summary

| Step | What happens |
|------|----------------|
| 1 | You push to `main` (or merge a PR into `main`). |
| 2 | GitHub Actions runs: backend tests, frontend tests, E2E. |
| 3 | If any job fails → workflow stops, **no deploy**. |
| 4 | If all pass → **Deploy** job runs → POST to Render hook, GET to Vercel hook. |
| 5 | Render and Vercel start a new build/deploy. |

Everything stays automated; deploys run only after CI passes.
