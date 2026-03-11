# Architecture notes

## Current setup: Web Components + Module Federation

The app uses **MUIBook Web Components** for the view layer and a **federated shared remote** for auth and API logic. This follows the [Web Components + Module Federation implementation plan](../.cursor/plans/web_components_%2B_module_federation_e358e2bc.plan.md).

### View layer: MUIBook Web Components

- **Source:** `@muibook/components` — native custom elements (e.g. `mui-button`, `mui-input`).
- **Usage:** The frontend wraps them in React adapters under `frontend/src/components/ui/` (Button, TextField) so pages use a React-friendly API. Data is passed in via props; actions via events.
- **Rule:** **No business logic inside Web Components.** MUIBook components only display data and emit events. All form state, validation, API calls, and auth state live in React (pages/hooks) or in the shared remote.

### Logic layer: Federated shared remote

- **Package:** `packages/shared` — built with Vite and `@originjs/vite-plugin-federation` in **remote** mode.
- **Exposes:** API client (axios with credentials, 401/refresh handling), auth API (login, getMe, refreshTokens, logoutApi), and config (API base URL). No React components — only logic and types.
- **Consumption:** The host app (frontend) loads the remote at runtime via Module Federation (`import('shared/auth')` etc.). The host sets the API base URL on `globalThis` before any remote code runs (see `frontend/src/main.tsx`).

### Build and dev

- **Build order:** `yarn workspace shared build` then `yarn workspace frontend build`. Root script: `yarn build`.
- **Dev:** Run the shared remote (build + preview on port 5174) and the frontend (Vite dev on 5173). From root: `yarn dev` runs both via concurrently; or run `yarn dev:shared` and `yarn dev:frontend` in two terminals.
- **Production:** Set `VITE_SHARED_REMOTE_URL` when building the frontend so the host loads the remote from the deployed URL (e.g. same origin under `/shared/` or a separate CDN).

### Future-proofing

- **Shell + MFE:** If the app is later split into a Shell (router, auth, layout) and a separate clinic MFE (Dashboard, Queue, Appointments), the same shared remote can be consumed by both; MUIBook remains the view layer.
- **No Webpack:** The stack stays on Vite + SWC; Module Federation is provided by `@originjs/vite-plugin-federation` only.

---

## Library vs Module Federation vs Web Components (historical)

**Can Module Federation + Web Components replace the design-system library?**

- **Module Federation (MF)** can replace the library as the *way you ship React components* to your own apps. Instead of publishing a design-system package to npm and installing it in the frontend, you can build a remote and have the host load it at runtime. Same idea applies to *logic*: we now ship auth/API via a federated remote instead of a local `frontend/src/api` folder.

- **Web Components** are custom elements (e.g. MUIBook’s `mui-button`). They are used here as the view layer with a thin React adapter layer; all logic stays in React and the shared remote.

**Current choice:** View = MUIBook Web Components (with React wrappers); logic = federated shared remote. No business logic inside Web Components.
