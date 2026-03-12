# MERN Security Practices — Enterprise Norm (2026+) and Future-Proofing

Use this as the reference for security review and implementation. When ready to implement, create an implementation plan from the checklist at the end.

---

## 1. Authentication

| Practice | What | Why | Your status / note |
|----------|------|-----|--------------------|
| **No tokens in response body** | Access/refresh only in httpOnly cookies (or backend-set headers). Never return tokens in JSON for the SPA to store. | Avoids XSS stealing tokens from DOM/localStorage. | Done (cookies only). |
| **Cookie flags** | `httpOnly`, `secure` (in prod), `sameSite` (e.g. `lax` or `strict`), `path: '/'`. | Limits script and cross-site access to cookies. | Done: httpOnly, secure in prod, sameSite lax. Consider `strict` if frontend is always same-origin. |
| **Short-lived access token** | 5–15 minutes. | Limits damage from a single stolen access token. | Done (15m). |
| **Refresh token rotation** | Every refresh issues a new refresh token; previous one revoked (one-time use). | Detects reuse (e.g. theft) and limits lifetime of a stolen refresh token. | Done (rotation + revoke). |
| **JWT algorithm** | Use only `RS256` or `HS256`; explicitly set `alg` in verify; reject `none` and unknown alg. | Prevents algorithm confusion and key substitution. | Verify in `backend/src/utils/jwt.ts`. |
| **JWT payload** | No secrets; only minimal claims (e.g. id, email, role). Validate types and shape on verify. | Reduces exposure and prevents injection into app logic. | You already use minimal payload; add strict validation on verify. |
| **Password storage** | Bcrypt (cost ≥10) or Argon2id. No plaintext or weak hashing. | Industry standard; resistant to brute force. | Confirm bcrypt cost in User model. |
| **Password policy** | Min length (e.g. 8–12), complexity or allowlist, optional breach check (e.g. HIBP). | Reduces weak and breached passwords. | Add validation on register/login (or at least register). |
| **Generic login error** | Same message for "user not found" and "wrong password". | Avoids user enumeration. | Done ("Invalid credentials"). |
| **Future: IdP / passwordless** | Move to OAuth2/OIDC (e.g. Entra, Okta); consider WebAuthn/Passkeys. | Centralized identity, MFA, passwordless; aligns with "no built-in MFA, IdP later". | Plan: Entra migration (you already have a doc). |

---

## 2. Authorization

| Practice | What | Why | Your status / note |
|----------|------|-----|--------------------|
| **Server-side only** | Every protected route checks auth (and role) on the backend. Never trust client for "am I admin?". | Client can be tampered with. | Ensure all API routes that need auth use auth middleware. |
| **Resource-level checks** | For "user X can access resource Y", check ownership or permission on the server for that resource. | Prevents horizontal privilege escalation. | Add when you introduce resources (e.g. appointments, queue). |
| **Role-based (RBAC)** | Roles (e.g. staff, admin) and middleware or helpers that enforce "role in [allowed]". | Clear, auditable access model. | You have `role` in JWT; add middleware that enforces role per route. |
| **Least privilege** | Backend and DB users have minimum permissions needed. | Limits blast radius of compromise. | Apply to MongoDB user and any service accounts. |

---

## 3. Input validation and injection

| Practice | What | Why | Your status / note |
|----------|------|-----|--------------------|
| **Schema validation** | Validate all request body, query, params with a schema (e.g. Zod, Joi, express-validator). Reject unknown fields or strip them. | Prevents malformed data, mass assignment, and type confusion. | Add for login (email format, password presence/length), refresh, and every future endpoint. |
| **No raw user input in queries** | Never concatenate or interpolate user input into MongoDB queries. Use parameterized APIs (Mongoose methods with objects). | Prevents NoSQL injection. | Audit all `find`, `findOne`, `aggregate`, `$where` for user input. |
| **No `eval` / `Function(userInput)`** | Never run user-controlled input as code. | Prevents code execution. | Grep for eval, new Function, vm. |
| **MongoDB `$where` / `$regex`** | Avoid `$where` with user input. If using `$regex`, escape user input or use allowlisted patterns. | `$where` is executable; `$regex` can be abused (ReDoS). | Avoid $where; sanitize/limit regex from user. |
| **Body size limit** | `express.json({ limit: '…' })` (e.g. 100KB–1MB). | Mitigates DoS via huge payloads. | Add limit in app.ts / jsonBody middleware. |
| **Content-Type** | Reject non-JSON bodies for JSON endpoints (or validate Content-Type). | Reduces deserialization and logic bugs. | Optional: strict Content-Type check for /api/*. |

---

## 4. XSS (Cross-Site Scripting)

| Practice | What | Why | Your status / note |
|----------|------|-----|--------------------|
| **React default escaping** | Rely on React's default escaping; avoid `dangerouslySetInnerHTML` unless necessary. | Prevents stored/reflected XSS in UI. | Audit any dangerouslySetInnerHTML. |
| **If HTML needed** | Use a sanitizer (e.g. DOMPurify) with a strict config; keep CSP tight. | Limits XSS if you must render HTML. | Add when/if you introduce rich content. |
| **CSP (Content-Security-Policy)** | Deploy a strict CSP (script-src, style-src, etc.). Start restrictive and relax only when needed. | Mitigates XSS and data exfiltration. | Add via Helmet or server headers. |
| **Headers** | X-Content-Type-Options: nosniff, X-Frame-Options, Referrer-Policy, etc. | Defense in depth. | Add via Helmet. |

---

## 5. CSRF (Cross-Site Request Forgery)

| Practice | What | Why | Your status / note |
|----------|------|-----|--------------------|
| **SameSite cookies** | `sameSite: 'lax'` or `'strict'`. | Most CSRF from other sites are not sent. | Done (lax). |
| **Same-origin / CORS** | CORS whitelist only your frontend origin(s); use `credentials: true` only with specific origin (no `*`). | Ensures only your frontend can trigger credentialed requests. | Done (origin whitelist, credentials true). |
| **Custom header** | For state-changing requests, require a header that only your JS can set (e.g. X-Requested-With or a custom name). Optional if SameSite + CORS are strict. | Extra assurance for sensitive actions. | Optional for 2026; add for high-sensitivity actions if needed. |
| **Double-submit cookie** | Alternative: CSRF token in cookie + same value in header/body. | Classic CSRF mitigation. | Usually unnecessary with SameSite + CORS. |

---

## 6. Rate limiting and DoS

| Practice | What | Why | Your status / note |
|----------|------|-----|--------------------|
| **Global rate limit** | Limit requests per IP (e.g. 100–300/min) for the API. | Mitigates brute force and DoS. | Add express-rate-limit (or similar) on API. |
| **Auth endpoints** | Stricter limit on /api/auth/login and /api/auth/refresh (e.g. 5–10/min per IP). | Slows credential stuffing and token abuse. | Add separate rate limit for auth routes. |
| **Slow down** | Optional: delay response on repeated failures (e.g. login). | Makes brute force slower. | Optional. |
| **Timeout** | Set server and proxy timeouts so hung requests don't pile up. | Mitigates slowloris-style DoS. | Configure in Express and reverse proxy (e.g. Render). |

---

## 7. Secure headers and HTTPS

| Practice | What | Why | Your status / note |
|----------|------|-----|--------------------|
| **Helmet** | Use `helmet()` (or equivalent) with safe defaults; tune CSP separately. | Sets a bundle of security headers. | Add Helmet in app.ts. |
| **HTTPS only in prod** | Redirect HTTP → HTTPS; set HSTS (Strict-Transport-Security). | Prevents downgrade and sniffing. | Ensure Render/Vercel use HTTPS and HSTS. |
| **HSTS** | max-age ≥ 1 year in prod; includeSubDomains if applicable. | Browsers enforce HTTPS. | Often set by host; confirm in response headers. |

---

## 8. Secrets and configuration

| Practice | What | Why | Your status / note |
|----------|------|-----|--------------------|
| **No secrets in code** | No API keys, JWT secrets, or DB URIs in repo. Use env vars or a secret manager. | Prevents leakage via repo or build. | You use env; ensure .env in .gitignore and not in images. |
| **Strong JWT secret** | High entropy (e.g. 256-bit); rotate periodically and support multiple valid keys during rotation. | Reduces brute force and limits impact of leak. | Document rotation procedure; consider key version in JWT. |
| **MongoDB URI** | Strong password; not in logs or errors. Use separate DB user per app with least privilege. | Limits impact of credential leak. | Verify MONGO_URI not logged. |
| **Rotation** | Plan for rotating JWT secret, DB password, and any API keys without downtime. | Standard practice for 2026+. | Document steps; use secret manager (e.g. Render/Vercel env). |
| **.env and .gitignore** | .env*, *.pem, and local overrides in .gitignore. | Prevents accidental commit of secrets. | Confirm .env in .gitignore. |

---

## 9. Logging and monitoring

| Practice | What | Why | Your status / note |
|----------|------|-----|--------------------|
| **No secrets in logs** | Never log passwords, tokens, or full request bodies that might contain secrets. | Prevents leakage to log aggregation (e.g. Splunk, Grafana). | Audit all console.log and logger calls. |
| **Structured logging** | JSON logs with level, timestamp, request id, user id (if auth), path, method, status. | Enables search and alerting (e.g. Grafana, Splunk). | Add when you introduce observability. |
| **Audit trail** | Log auth events (login success/failure, logout, refresh, lockout) with user/id, IP, timestamp. | Compliance and incident response. | Add to auth controller; send to Splunk/audit log. |
| **Alerting** | Alerts on repeated auth failures, spike in 5xx, or anomaly. | Fast detection of abuse or outages. | With Grafana/Splunk; define thresholds. |

---

## 10. MongoDB security

| Practice | What | Why | Your status / note |
|----------|------|-----|--------------------|
| **Authentication** | MongoDB auth enabled (SCRAM-SHA-256); strong password. | No anonymous access. | Required in prod (Atlas or self-hosted). |
| **Authorization** | DB user with minimal roles (readWrite on app DB only, or finer). | Least privilege. | Create app-specific user; avoid root. |
| **Network** | DB not publicly reachable; VPC/peering or allowlist IPs. | Reduces attack surface. | Atlas: IP allowlist; self-hosted: firewall. |
| **TLS** | Encrypt connections to MongoDB (Atlas default). | Prevents sniffing. | Ensure TLS in prod. |
| **Injection** | Same as §3: no user input in $where; sanitize $regex; prefer typed queries. | NoSQL injection and ReDoS. | Code review all queries. |

---

## 11. Frontend (React) security

| Practice | What | Why | Your status / note |
|----------|------|-----|--------------------|
| **No secrets in bundle** | No API keys that must stay secret in frontend code or env that is bundled. Use backend proxy for sensitive calls. | Bundles are visible to users. | You proxy API; ensure no secret keys in VITE_* that get bundled. |
| **Dependencies** | Regular `npm audit` / `yarn audit`; fix or accept risk. Use Renovate/Dependabot. | Reduces known-vuln supply chain risk. | Add to CI; you have Renovate plan. |
| **SRI** | Subresource Integrity for scripts loaded from CDN (if any). | Prevents tampered CDN from compromising the app. | Add if you load external scripts. |
| **CSP** | Align frontend with backend CSP (e.g. no inline scripts if CSP forbids them). | Avoids breaking the app while keeping CSP strict. | When you add CSP, test frontend. |

---

## 12. API design and errors

| Practice | What | Why | Your status / note |
|----------|------|-----|--------------------|
| **Generic error messages** | Don't leak stack traces or DB errors to client in prod. Return stable codes and generic messages. | Reduces information disclosure. | Ensure errorHandler doesn't send internal errors to client in prod. |
| **Stable status codes** | Use correct HTTP status (401 for auth, 403 for forbidden, 400 for validation). | Clear contracts and safer client handling. | You already use 401/400; keep 403 for "forbidden". |
| **No sensitive data in URL** | Avoid tokens or secrets in query params (use cookies or headers). | URLs are logged and cached. | You use cookies; keep it that way. |
| **Idempotency** | For critical mutations (e.g. payment, booking), support idempotency key. | Prevents duplicate actions on retry. | Add when you have such endpoints. |

---

## 13. Dependency and supply chain

| Practice | What | Why | Your status / note |
|----------|------|-----|--------------------|
| **Lockfile** | Commit yarn.lock (and use in CI with --frozen-lockfile). | Reproducible builds; fewer surprise vulnerabilities. | You use lockfile; CI should use it. |
| **Audit in CI** | Run `yarn audit` (or npm audit) in CI; fail or warn on high/critical. | Catches known vulns before merge. | Add to GitHub Actions. |
| **Renovate / Dependabot** | Automated dependency updates; monthly or per-advisory. | Keeps deps current; you have a plan. | Implement Renovate as planned. |
| **SBOM** | Generate Software Bill of Materials (e.g. cyclonedx, npm sbom). | Required in many 2026+ / regulated contexts. | Add when targeting compliance. |
| **Minimal deps** | Prefer fewer, well-maintained packages; review new deps. | Smaller attack surface. | Policy: review before adding. |

---

## 14. DevOps, CI/CD, and deployment

| Practice | What | Why | Your status / note |
|----------|------|-----|--------------------|
| **Secrets in CI** | Use GitHub Secrets (or vault); never log secrets. | Prevents leakage in logs and forks. | You already use secrets for deploy hooks. |
| **Branch protection** | Require PR review, status checks (tests, CodeQL, Sonar), no force-push to main. | Protects main from mistakes and backdoors. | Align with your observability/quality plan. |
| **Containers** | If you use Docker: non-root user, minimal image, no secrets in image; scan (e.g. Trivy). | Reduces container escape and secret leak. | Apply when/if you containerize. |
| **Build from clean env** | CI installs from lockfile; no implicit cache of deps from other branches. | Reproducible and secure builds. | You use frozen-lockfile; keep it. |

---

## 15. Compliance and privacy (clinic / 2026+)

| Practice | What | Why | Your status / note |
|----------|------|-----|--------------------|
| **PII handling** | Identify PII (e.g. name, email, health-related); encrypt at rest and in transit; restrict access. | GDPR, HIPAA, etc. | Plan for patient/staff PII; document where it lives. |
| **Retention** | Define and implement retention for logs and user data; delete when no longer needed. | Compliance and minimization. | Add to policy and implement where applicable. |
| **Right to deletion** | Support user/patient data deletion and account deletion where required. | GDPR and similar. | Add endpoint and process when you store more PII. |
| **Audit trail** | As in §9: who did what, when; store in tamper-aware or append-only log. | HIPAA/SOC2/auditors. | Splunk/audit log as in your plan. |
| **BAA / contracts** | If using third-party SaaS for PHI (e.g. DB, hosting), have BAA or equivalent. | HIPAA if US healthcare. | When you handle PHI, ensure BAAs with providers. |

---

## 16. Future-proofing (2026 and beyond)

| Practice | What | Why | Your status / note |
|----------|------|-----|--------------------|
| **Identity via IdP** | Move auth to OAuth2/OIDC (Entra, Okta, Auth0). MFA and password policy in IdP. | Aligns with "MFA from IdP"; reduces custom auth surface. | You have Entra migration plan. |
| **Passwordless** | Plan for WebAuthn/Passkeys as primary or second factor. | Phishing-resistant; future norm. | When IdP supports it, enable. |
| **Crypto agility** | Design for rotating signing/encryption keys and algorithm updates (e.g. post-quantum later). | Future algorithms and compliance. | Document key versioning; avoid hardcoding single alg everywhere. |
| **Zero trust** | Verify every request (auth + context); assume breach; least privilege. | Enterprise trend. | Enforce auth and RBAC on every API route; no "internal only" without auth. |
| **OWASP alignment** | Map controls to OWASP Top 10 and OWASP API Security Top 10. | Standard checklist. | Use this doc and OWASP as the map. |
| **Security testing** | SAST (CodeQL, Sonar), dependency scan, optional DAST/pen tests. | Catch issues before production. | You have CodeQL + Sonar in plan. |

---

## 17. Checklist summary (implementation order)

When ready to implement, use this order (foundations first):

1. **Helmet + security headers** (app.ts).
2. **Body size limit** (express.json / jsonBody).
3. **Rate limiting** (global + auth routes).
4. **Request validation** (Zod/Joi/express-validator for auth and all new endpoints).
5. **JWT** (algorithm restriction, strict payload validation, no sensitive data).
6. **Error handler** (no stack/internal details to client in prod).
7. **Logging** (no secrets; structured logs; auth audit events).
8. **.gitignore** (confirm .env and secrets).
9. **MongoDB** (auth, network, least privilege).
10. **RBAC middleware** (per-route role checks).
11. **CI** (audit, CodeQL, Sonar as planned).
12. **Compliance** (PII, retention, deletion, BAA when handling PHI).
