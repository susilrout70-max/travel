# Technology Stack Document
## TravelHub — Travel & Tourism Platform

---

## 1. Frontend

| Layer | Technology | Notes |
|---|---|---|
| Framework | React.js (Vite) | Vite for fast dev/build over CRA |
| Routing | React Router v6 | Code-split routes per feature |
| Server state / data fetching | React Query (TanStack Query) | Caching, retries, background refetch — key for the "live info" panel |
| Client/UI state | Zustand | Lightweight, avoids Redux boilerplate |
| Styling | Tailwind CSS | Utility-first, fast to build consistent, polished UI |
| Animations / transitions | Framer Motion | Smooth page/section transitions, micro-interactions |
| Forms & validation | React Hook Form + Zod | Type-safe, minimal re-renders |
| Maps | Google Maps JavaScript SDK (`@react-google-maps/api`) | Used across travel guide, location sharing, live traffic layer |
| Payments (client) | Razorpay Checkout.js | Hosted widget, keeps app out of PCI scope |
| Icons | Lucide React | Consistent icon set |
| HTTP client | Axios (or fetch wrapper) | Centralized API client with interceptors for auth refresh |

## 2. Backend

| Layer | Technology | Notes |
|---|---|---|
| Runtime | Node.js (LTS) | |
| Framework | Express.js | Modular routing, middleware-based |
| Validation | Zod (shared schemas with frontend where feasible) | |
| Auth | jsonwebtoken (JWT), bcrypt | RS256-signed access tokens |
| ORM | Prisma | Type-safe DB access, migrations |
| Database | PostgreSQL | Managed instance on Railway/Render |
| Caching / jobs (recommended) | Redis + BullMQ | Live-info caching, async email jobs, share-link expiry jobs |
| Payments | Razorpay Node SDK | Order creation, webhook verification |
| Security middleware | Helmet, cors, express-rate-limit | |
| Logging | Pino (or Winston) | Structured JSON logs |
| Testing | Jest + Supertest | Unit + integration tests for API routes |

## 3. Database

| Aspect | Choice |
|---|---|
| Engine | PostgreSQL (managed, e.g., Railway/Render Postgres) |
| ORM | Prisma (schema-first, auto-generated client, migration history) |
| Extensions (optional) | PostGIS — if precise proximity search (nearest hotel/vehicle) is needed beyond simple bounding-box queries |
| Migrations | Prisma Migrate, version-controlled in repo |

## 4. Third-Party Services & APIs

| Purpose | Service | Notes |
|---|---|---|
| Payments | Razorpay | Orders, checkout, webhooks, refunds |
| Maps, Places, Traffic | Google Maps Platform | Maps JS SDK (client), Traffic + Places (server-proxied) |
| Weather | OpenWeather API | Current + forecast, server-proxied and cached |
| Wildlife/species data | GBIF API | Region-based species occurrence data, server-proxied and cached |
| Transactional email | SendGrid / Resend / Amazon SES | Booking confirmations, OTP, password reset |
| SMS/OTP (optional) | Twilio / MSG91 | Phone verification, booking alerts |

## 5. DevOps & Hosting

| Aspect | Choice |
|---|---|
| Frontend hosting | Vercel | CDN, auto preview deployments, easy env var management |
| Backend hosting | Railway or Render | Container-based Node service, managed Postgres add-on |
| CI/CD | GitHub Actions | Lint → test → build → deploy pipeline |
| Environment management | `.env` per environment (local/staging/prod), secrets in platform dashboards |
| Monitoring/Error tracking | Sentry (frontend + backend) | |
| Uptime monitoring | Better Uptime / UptimeRobot | |

## 6. Development Tooling

| Aspect | Choice |
|---|---|
| Language | JavaScript or TypeScript (**TypeScript recommended** for both frontend and backend given the number of integrations and data models — catches errors early) |
| Linting/formatting | ESLint + Prettier |
| API documentation | OpenAPI/Swagger (auto-generated or hand-maintained) for the Express API |
| Version control | Git + GitHub, trunk-based or Git Flow depending on team size |
| Package manager | npm or pnpm |

## 7. Suggested TypeScript Adoption Note

Although the requested stack is React + Node/Express + PostgreSQL/Prisma without specifying a language, given the number of external integrations (Razorpay, Google Maps, OpenWeather, GBIF) and shared data contracts between frontend and backend, **TypeScript is strongly recommended** across both layers. Prisma generates fully-typed models automatically, which pairs naturally with a typed API layer and typed React components — this significantly reduces integration bugs on a project with this many moving parts. This is a recommendation, not a hard requirement — the architecture works identically in plain JavaScript if preferred.
