# Testing refresh token (cookies + rotation)

## Refresh token

**Behavior:** Access and refresh tokens are set in **httpOnly cookies** on login and refresh. The API does not return tokens in the response body. Refresh uses **rotation:** each refresh issues a new refresh token and the old one is revoked in the DB (one-time use).

**Automated:** Backend tests in `backend/src/auth.test.ts` cover login (returns `user`, sets cookies), `POST /api/auth/refresh` (401 when missing/invalid, 200 with new cookies when valid, rotation), and logout (clears cookies, revokes refresh).

**Manual:**

1. **Login** – `POST /api/auth/login` with `{ email, password }`. Response: `{ user }` only; check `Set-Cookie` for `accessToken` and `refreshToken` (httpOnly).
2. **Use access** – Call a protected route (e.g. `GET /api/auth/me`) with the cookie (browser sends automatically with `credentials: 'include'`) or `Authorization: Bearer <accessToken>`.
3. **Refresh** – Either wait for access to expire (e.g. `JWT_ACCESS_EXPIRY=30s`) and let the app refresh automatically, or call:
   - `POST /api/auth/refresh` with the `refreshToken` cookie, or with body `{ "refreshToken": "<token>" }` (body supported for compatibility).
   - Response: `{ user }` and new `Set-Cookie` headers (new access + refresh). Old refresh token is revoked.
4. **In the app** – Log in, wait for access expiry (or shorten it); the next API call may 401, the client calls refresh and retries; the app should keep working without redirecting to login.
5. **Logout** – `POST /api/auth/logout` (with refresh cookie). Response: cookies cleared; that refresh token is revoked in the DB.

---

## What enterprises use for MFA (when you add an IdP later)

| Type | Examples | Used for |
|------|----------|----------|
| **TOTP** | Google Authenticator, Microsoft Authenticator, Authy | Time-based codes; often via identity provider. |
| **SMS OTP** | Twilio, AWS SNS | “Enter code we texted you”; paid, weaker (SIM swap). |
| **Push / WebAuthn / FIDO2** | Duo, Okta Verify, YubiKey | Strong; often via an identity provider. |
| **Full identity providers** | Auth0, Okta, Azure AD (Entra), AWS Cognito | Login + MFA + SSO; enterprises use these and turn on MFA in the provider. |

This app currently has no built-in MFA; when you integrate an IdP (e.g. Microsoft Entra ID), MFA is handled there.

---

## Module Federation vs Web Components (logic vs UI, where they run)

**Logic vs UI:** It’s not that MF = only logic and Web Components = only UI. Both can ship UI and behavior:

- **Module Federation (MF)** – Runtime sharing of **JavaScript modules** (React components, hooks, utils, routes). The host app loads “remotes” from URLs and runs their code. So you get shared **UI and logic** (e.g. shared design system or feature modules).
- **Web Components** – Custom elements (`<my-button>`) that encapsulate **markup, style, and script**. So they’re also **UI + behavior**, but in a framework-agnostic way (no React/Vue required in the host).

**Do enterprises “hoist” and use them? Where?**

- **MF:** Yes. Used for **micro-frontends**: host app loads remotes from a **CDN or internal app host** (e.g. `https://design-system.company.com/remoteEntry.js`). Built with Webpack 5 Module Federation, Nx, single-spa, or similar. “Hoisting” here = remotes are built and deployed to a **central (or per-team) URL**, and many apps reference that URL at runtime.
- **Web Components:** Yes. Used for **design systems** and **embeddable widgets**. Enterprises build a WC bundle and serve it from a **CDN or static host**; other apps (React, Vue, Angular, or plain HTML) include a script tag (or import) and use `<company-button>`, etc. Examples: Salesforce Lightning Web Components, Adobe Spectrum, Ionic.

So both are “hosted” in a central (or team-owned) place and **consumed at runtime** by many apps; they’re not “hoisted” in the npm/node_modules sense, but they are shared from a single deployed artifact/URL.
