# Technical Architecture Document
## TravelHub — Travel & Tourism Platform

---

## 1. Architecture Style

**Client-server, layered monolith (modular) for v1**, designed so modules (booking, recommendations, live-info) can be split into microservices later if scale demands it.

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React SPA)                     │
│  - React Router  - React Query  - Zustand/Redux (state)       │
│  - Map component (Google Maps JS SDK)                          │
└───────────────────────────┬─────────────────────────────────┘
                             │ HTTPS (REST, JWT in Authorization header)
┌───────────────────────────▼─────────────────────────────────┐
│                     API GATEWAY LAYER                          │
│           Express.js app (routing, auth middleware,            │
│           rate limiting, request validation)                   │
└───────────────────────────┬─────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┬───────────────┐
        ▼                    ▼                    ▼               ▼
┌───────────────┐   ┌────────────────┐   ┌────────────────┐ ┌────────────────┐
│ Auth Service   │   │ Booking Service│   │ Recommendation │ │ Live-Info      │
│ (users, JWT,   │   │ (hotel, car/   │   │ Service        │ │ Service        │
│ sessions)      │   │ bike, payments)│   │ (destinations, │ │ (weather,      │
│                │   │                │   │ wishlist)      │ │ traffic,       │
│                │   │                │   │                │ │ wildlife proxy)│
└───────┬────────┘   └───────┬────────┘   └───────┬────────┘ └───────┬────────┘
        │                    │                    │                  │
        └────────────────────┴────────────────────┴──────────────────┘
                             │
                     ┌───────▼────────┐
                     │  Prisma ORM     │
                     └───────┬────────┘
                             │
                     ┌───────▼────────┐
                     │ PostgreSQL DB   │
                     └────────────────┘

        External Integrations (called from Booking / Live-Info services):
        - Razorpay (payments)
        - Google Maps Platform (Maps, Places, Traffic)
        - OpenWeather API (weather)
        - GBIF API (wildlife/species data)
        - Email/SMS provider (OTP, booking confirmations)
```

## 2. Frontend Architecture (React)

```
src/
├── app/                  # App shell, routing, providers
├── features/
│   ├── auth/             # Login, signup, password reset
│   ├── hotels/           # Search, listing, detail, booking
│   ├── vehicles/         # Car/bike search, listing, booking
│   ├── recommendations/  # Recommended spots, wishlist
│   ├── travel-guide/     # Destination guides, itinerary
│   ├── location-sharing/ # Live location share, map pins
│   └── live-info/        # Traffic, weather, landscape, wildlife panel
├── components/           # Shared UI components (buttons, cards, modals)
├── hooks/                # Shared React hooks
├── lib/                  # API client, map utils, formatters
├── store/                # Global state (auth, cart/booking-in-progress)
└── styles/               # Design tokens, theme
```

- **State management:** React Query (server state/caching) + lightweight client state (Zustand) for UI/session state — avoids over-fetching and gives built-in caching/retry for API calls.
- **Routing:** React Router v6, code-split by feature (lazy loading) for fast initial load.
- **Map layer:** single `<MapProvider>` wrapping Google Maps JS SDK, reused by travel-guide, location-sharing, live-info (traffic layer toggle).
- **Design system:** shared component library (buttons, inputs, cards, skeleton loaders) for visual consistency and to support the "smooth interaction" requirement (shared transition/animation primitives, e.g., Framer Motion for page/section transitions).

## 3. Backend Architecture (Node.js + Express)

```
src/
├── config/               # env, constants, third-party client configs
├── middleware/           # auth (JWT verify), validation, rate-limit, error handler
├── modules/
│   ├── auth/             # controller, service, routes
│   ├── users/
│   ├── hotels/
│   ├── vehicles/
│   ├── bookings/         # unified booking logic (hotel + vehicle)
│   ├── payments/         # Razorpay integration
│   ├── recommendations/
│   ├── travelGuide/
│   ├── locationSharing/
│   └── liveInfo/         # weather/traffic/wildlife adapters
├── integrations/
│   ├── razorpay.client.js
│   ├── googleMaps.client.js
│   ├── openWeather.client.js
│   └── gbif.client.js
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── utils/
└── server.js
```

- **Pattern:** Controller → Service → Repository(Prisma) per module, keeping business logic out of route handlers.
- **Validation:** Zod or Joi schemas at the controller boundary for every request.
- **Error handling:** centralized error middleware returning a consistent error shape `{ code, message, details }`.
- **Background jobs:** a lightweight job runner (BullMQ + Redis, optional but recommended) for: booking-confirmation emails, location-share link expiry, periodic cache refresh of weather/traffic data.
- **Caching:** Redis (or in-memory LRU for v1 if Redis is deferred) for live-info responses (weather ~10 min TTL, traffic ~2–5 min TTL, wildlife species list ~24h TTL) to avoid hammering third-party APIs and to keep the "live" panel fast.

## 4. Data Layer (PostgreSQL + Prisma)

Core entities (see also Security doc for sensitive-field handling):

- `User` (id, email, passwordHash, name, role, createdAt, ...)
- `RefreshToken` (id, userId, tokenHash, expiresAt, revoked)
- `Hotel`, `HotelRoom`, `HotelBooking`
- `Vehicle` (type: car/bike), `VehicleBooking`
- `Payment` (bookingId, provider, providerRefId, status, amount)
- `Destination` (name, category, geo coordinates, description)
- `Recommendation` (userId, destinationId, score, reason)
- `Wishlist` (userId, destinationId)
- `TripShare` (userId, shareToken, expiresAt, isActive, visibility)
- `TripSharePin` (tripShareId, lat, lng, label, timestamp)
- `WildlifeCache`, `WeatherCache`, `TrafficCache` (destinationId, payload JSON, fetchedAt)

Prisma manages schema migrations; PostgreSQL provides relational integrity (foreign keys between bookings, users, payments) plus PostGIS extension (optional) if precise geo-queries (nearest hotel/vehicle) are needed at scale.

## 5. API Design

- RESTful JSON API under `/api/v1/...`
- Consistent resource naming: `/api/v1/hotels`, `/api/v1/hotels/:id/bookings`, `/api/v1/vehicles`, `/api/v1/live-info/:destinationId`, `/api/v1/trips/:id/share`
- Pagination via `?page=&limit=`, filtering via query params
- Idempotency keys on booking/payment-creation endpoints to prevent double-booking on retry

## 6. Deployment Architecture

- **Frontend:** Vercel (static build + edge CDN, automatic preview deployments per PR)
- **Backend:** Railway/Render (containerized Node/Express service, autoscaling within plan limits)
- **Database:** Managed PostgreSQL on Railway/Render with automated backups
- **Environments:** `local` → `staging` → `production`, each with isolated DB and API keys
- **CI/CD:** GitHub Actions — lint/test on PR, build + deploy on merge to `main` (staging), manual promote to production

## 7. Third-Party Integration Points

| Integration | Purpose | Failure Handling |
|---|---|---|
| Razorpay | Payments for bookings | Retry + webhook reconciliation; booking stays "pending" until webhook confirms |
| Google Maps Platform | Maps, places autocomplete, traffic layer | Cache last-known traffic; show "unavailable" state gracefully |
| OpenWeather | Current weather + forecast | Serve cached value with "last updated" timestamp if API fails |
| GBIF | Wildlife/species data per region | Long cache TTL (24h) since this data changes rarely; fallback to static curated list |

## 8. Scalability Considerations

- Stateless Express instances behind a load balancer → horizontal scaling
- Read-heavy endpoints (hotel/vehicle search, destination guides) benefit from Redis caching and DB indexes on search fields (location, date, price)
- Live-info endpoints decoupled via caching layer so third-party rate limits don't bottleneck user requests
- Future path: split `bookings` and `live-info` into separate services if traffic patterns diverge significantly
