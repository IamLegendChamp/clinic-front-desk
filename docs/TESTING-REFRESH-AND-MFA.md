# Testing refresh token and MFA (TOTP)

## Refresh token (cookies + rotation)

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

## MFA (TOTP)

**Not Twilio.** This app uses **speakeasy** (TOTP): a shared secret and time-based 6-digit codes. No SMS, no external provider. You need an authenticator app (e.g. Google Authenticator, Microsoft Authenticator, Authy) on your phone.

**Manual:**

1. **Enable MFA**
   - Log in to the app, go to the dashboard.
   - Under “Two-factor authentication”, click **Enable MFA**.
   - Scan the QR code with your authenticator app (or enter the secret manually if the app supports it).
   - Enter the 6-digit code shown in the app and click **Confirm**.

2. **Log in with MFA**
   - Log out, then go to the login page.
   - Enter email and password and submit.
   - You should see “Enter verification code”.
   - Enter the current 6-digit code from your authenticator app and submit.

3. **API-only**
   - `POST /api/auth/login` with `{ email, password }` → if MFA is enabled, response is `{ requiresMfa: true, tempToken, user }` (no cookies yet).
   - `POST /api/auth/mfa/verify` with `{ tempToken, code }` (code = 6-digit TOTP) → returns `{ user }` and sets access + refresh cookies.

**Optional env:** `MFA_APP_NAME` (default: “Clinic Front Desk”) – label shown in the authenticator app.

---

## What enterprises use for MFA

| Type | Examples | Used for |
|------|----------|----------|
| **TOTP (what we use)** | Google Authenticator, Microsoft Authenticator, Authy; libs: speakeasy, otplib | Free, no vendor; good balance of security and UX. |
| **SMS OTP** | Twilio, AWS SNS, Vonage | “Enter code we texted you”; paid, weaker (SIM swap). |
| **Push / WebAuthn / FIDO2** | Duo, Okta Verify, YubiKey | Strong; often via an identity provider. |
| **Full identity providers** | Auth0, Okta, Azure AD, AWS Cognito | Login + MFA + SSO; enterprises often use these and turn on MFA in the provider. |

So: **TOTP (speakeasy) = no Twilio.** Enterprises use a mix: many use TOTP and/or an IdP (Auth0/Okta/Azure AD) with MFA; some add SMS (e.g. Twilio) for certain flows.

---

## Module Federation vs Web Components (logic vs UI, where they run)

**Logic vs UI:** It’s not that MF = only logic and Web Components = only UI. Both can ship UI and behavior:

- **Module Federation (MF)** – Runtime sharing of **JavaScript modules** (React components, hooks, utils, routes). The host app loads “remotes” from URLs and runs their code. So you get shared **UI and logic** (e.g. shared design system or feature modules).
- **Web Components** – Custom elements (`<my-button>`) that encapsulate **markup, style, and script**. So they’re also **UI + behavior**, but in a framework-agnostic way (no React/Vue required in the host).

**Do enterprises “hoist” and use them? Where?**

- **MF:** Yes. Used for **micro-frontends**: host app loads remotes from a **CDN or internal app host** (e.g. `https://design-system.company.com/remoteEntry.js`). Built with Webpack 5 Module Federation, Nx, single-spa, or similar. “Hoisting” here = remotes are built and deployed to a **central (or per-team) URL**, and many apps reference that URL at runtime.
- **Web Components:** Yes. Used for **design systems** and **embeddable widgets**. Enterprises build a WC bundle and serve it from a **CDN or static host**; other apps (React, Vue, Angular, or plain HTML) include a script tag (or import) and use `<company-button>`, etc. Examples: Salesforce Lightning Web Components, Adobe Spectrum, Ionic.

So both are “hosted” in a central (or team-owned) place and **consumed at runtime** by many apps; they’re not “hoisted” in the npm/node_modules sense, but they are shared from a single deployed artifact/URL.
