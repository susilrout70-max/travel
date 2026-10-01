# Security Architecture Document
## TravelHub — Travel & Tourism Platform

---

## 1. Authentication & Session Security

- **Password storage:** bcrypt (cost factor ≥ 12), never reversible encryption
- **Tokens:**
  - Access Token: JWT, short-lived (10–15 min), signed with RS256 (asymmetric — allows future multi-service verification without sharing the private key)
  - Refresh Token: opaque random string, stored hashed in DB (`RefreshToken` table), delivered as `httpOnly`, `Secure`, `SameSite=Strict` cookie — never accessible to JavaScript (mitigates XSS token theft)
- **Rotation:** refresh tokens rotate on each use; reuse of an old refresh token revokes the whole token family (detects token theft)
- **Login protections:** rate limiting on `/auth/login` (e.g., 5 attempts/15 min/IP+account), account lockout/backoff on repeated failures, generic error messages (don't reveal whether email exists)
- **Email verification & password reset:** time-limited (15–30 min), single-use tokens sent via email; reset invalidates all existing sessions/refresh tokens

## 2. Authorization

- Role-based access control (RBAC): `guest`, `user`, `admin`, `partner`
- Every protected route enforces role + ownership checks (e.g., a user can only cancel *their own* booking — checked server-side, never trust client-supplied `userId`)
- Admin endpoints isolated under `/api/v1/admin/*` with an additional admin-role middleware layer

## 3. Transport & Infrastructure Security

- TLS 1.2+ enforced everywhere (Vercel/Railway/Render provide managed TLS termination)
- HSTS header enabled
- CORS restricted to the known frontend origin(s) only — no wildcard `*` in production
- Security headers via `helmet` middleware (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- Environment secrets (DB URL, JWT keys, Razorpay keys, Google Maps/OpenWeather/GBIF keys) stored in platform secret managers (Vercel/Railway env vars), never committed to source control

## 4. Input Validation & Injection Prevention

- All incoming requests validated against strict schemas (Zod/Joi) before touching business logic
- Prisma's parameterized queries prevent SQL injection by default — raw queries (if any) must use Prisma's tagged-template `$queryRaw` (parameterized), never string concatenation
- Output encoding in React (default JSX escaping) mitigates stored/reflected XSS; any `dangerouslySetInnerHTML` usage (e.g., rich-text guide content) passes through a sanitizer (e.g., DOMPurify) first
- File/image uploads (if added later, e.g., review photos) restricted by MIME type, size limit, and re-encoded server-side before storage

## 5. Payment Security (Razorpay)

- Frontend never handles raw card data — Razorpay Checkout widget handles PCI-sensitive data entirely client-side within Razorpay's hosted UI (app stays out of PCI-DSS scope)
- Webhook signature verification mandatory (`X-Razorpay-Signature` HMAC check) before trusting any payment status update
- Payment amount is always recalculated/verified server-side against the actual booking price — never trust an amount passed from the client
- Idempotency keys prevent duplicate charge creation on retries

## 6. Location Sharing — Privacy-Specific Controls

Location data is the most sensitive data type in this product and gets dedicated controls:

- **Opt-in only:** location sharing is never automatic; explicit user action required to start a share session
- **Time-limited tokens:** every `TripShare` has a mandatory expiry (default 48h, user-configurable up to a max cap, e.g., 7 days) — no indefinite public share links
- **Revocable:** user can stop sharing at any time; the shareToken is immediately invalidated
- **Least exposure by default:** default visibility is "specific recipients" (via generated link shared privately), not indexed/public/searchable
- **No raw GPS from device without consent prompt:** browser Geolocation API permission is requested explicitly, with clear in-app copy on what is shared and for how long
- **Data minimization:** shared view exposes only pins/trip data for the active share window, not the user's full historical location trail
- **Retention:** pin/location history tied to an expired share is retained only as long as needed for the user's own trip history (per data retention policy), then purged or anonymized on a schedule

## 7. Third-Party API Key Handling

- All third-party API calls (Google Maps Traffic, OpenWeather, GBIF) are proxied through the backend — API keys never shipped to the frontend bundle
- Exception: Google Maps JS SDK requires a browser-restricted key for map rendering — that key is domain-restricted (HTTP referrer restriction) and scoped to only the Maps JavaScript API, not the sensitive Traffic/Places server APIs
- Per-provider rate limiting and caching (see Technical Architecture doc) also serves as a security control — reduces blast radius of key abuse if a client-side key were ever exposed

## 8. Data Protection

- PII (email, phone, payment references) encrypted at rest via the managed PostgreSQL provider's disk encryption; sensitive fields (if any beyond payment refs) can use application-level encryption (e.g., `pgcrypto`) if regulatory needs arise
- Backups encrypted, access-restricted, retention policy defined (e.g., 30-day rolling backups)
- Principle of least privilege for DB credentials: application DB user has only the permissions it needs (no superuser), separate read-only credentials for analytics/reporting if added later

## 9. Monitoring, Logging & Incident Response

- Centralized structured logging (request ID correlation across services) — logs must NOT contain passwords, tokens, or full payment details
- Audit log for sensitive actions: login, password reset, booking cancellation, location-share creation/revocation, admin actions
- Alerting on: repeated auth failures, webhook signature failures, unusual booking/payment patterns
- Documented incident response plan: detect → contain (revoke tokens/keys) → notify affected users if data exposure occurs → post-mortem

## 10. Security Checklist Before Launch

- [ ] Dependency vulnerability scanning (e.g., `npm audit`, Dependabot) in CI
- [ ] Penetration test or at minimum an OWASP Top 10 self-review on auth, booking, and payment flows
- [ ] Rate limiting verified on all public write endpoints
- [ ] Webhook endpoints tested against replay attacks (signature + timestamp check)
- [ ] Location-sharing expiry job tested (auto-revocation actually fires)
- [ ] Secrets rotation procedure documented
