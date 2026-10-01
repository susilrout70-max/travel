# System Workflow Document
## TravelHub — Travel & Tourism Platform

---

## 1. User Authentication Flow

```
User → [Login Page] → enters credentials
     → POST /api/v1/auth/login
     → Backend validates credentials (bcrypt compare)
     → Issues Access Token (JWT, short-lived ~15min) + Refresh Token (httpOnly cookie, ~7 days)
     → Frontend stores access token in memory (not localStorage) + refresh cookie handled by browser
     → Subsequent requests: Authorization: Bearer <access_token>
     → On 401 (expired access token): frontend calls /api/v1/auth/refresh silently
     → On refresh failure: redirect to Login Page
```

**Signup flow:** same as above, plus email verification (OTP or link) before first login is fully "trusted" (unverified users can browse but not book).

## 2. Hotel Booking Workflow

```
1. User searches: destination + dates + guests
   → GET /api/v1/hotels/search?...
   → Backend queries Hotel + HotelRoom (availability check against existing HotelBooking date ranges)
2. User selects hotel → views room options, price breakdown
3. User selects room → clicks "Book"
   → Frontend shows booking summary (sticky panel, no page reload)
4. User confirms → POST /api/v1/bookings/hotel (status: PENDING, idempotency key attached)
5. Backend creates Razorpay order → returns order ID to frontend
6. Frontend opens Razorpay checkout widget
7. User completes payment
8. Razorpay sends webhook → POST /api/v1/payments/webhook/razorpay
   → Backend verifies signature → marks Payment as SUCCESS → HotelBooking status: CONFIRMED
9. Backend triggers confirmation email/e-voucher (async job)
10. Frontend polls or receives status via webhook-triggered socket/notification → shows confirmation screen
```

**Cancellation:** User → Booking History → Cancel → backend checks cancellation policy window → initiates Razorpay refund → updates booking status to CANCELLED/REFUNDED.

## 3. Car / Bike Booking Workflow

```
1. User selects "Car/Bike" tab → enters pickup location, date/time range, vehicle type
   → GET /api/v1/vehicles/search?...
2. Map shows available vehicles near pickup location (Google Maps + Places)
3. User selects vehicle → sees price breakdown (base + duration + optional driver)
4. Booking + payment flow mirrors hotel booking (steps 4–9 above), using VehicleBooking entity
5. On confirmation: pickup instructions + vehicle owner/agent contact surfaced to user
6. Trip lifecycle: CONFIRMED → ONGOING (auto on pickup time) → COMPLETED (auto on drop-off time or manual)
```

## 4. Recommendation Workflow

```
1. Triggered on: homepage load, post-booking, or explicit "Explore" action
   → GET /api/v1/recommendations?userId=
2. Backend Recommendation Service scores destinations using:
   - User's past bookings (category affinity)
   - Wishlist entries
   - Season/current month
   - Trending score (aggregate bookings across all users, rolling 30 days)
3. v1: weighted rule-based scoring (no ML infra needed)
4. Returns ranked list of Destination objects with "reason" tag (e.g., "Because you liked Hill Stations")
5. Frontend renders as a horizontally scrollable card carousel with smooth scroll-snap
```

## 5. Travel Guide + Location Sharing Workflow

```
Travel Guide:
1. User opens a Destination page → GET /api/v1/destinations/:id/guide
2. Backend returns curated content (highlights, best time, tips, sample itinerary) — pulled from
   an admin-managed content table, not generated live

Location Sharing:
1. User starts a trip → clicks "Share my trip"
   → POST /api/v1/trips/:tripId/share → backend generates unique shareToken + expiry (e.g., 48h)
2. User shares the generated link (or in-app with specific friends/contacts)
3. Recipient opens link → GET /api/v1/trips/share/:shareToken (public, read-only, expiry-checked)
4. As the traveling user moves / drops pins:
   → POST /api/v1/trips/:tripId/pins (lat, lng, label, timestamp)
   → Recipients' map view polls or subscribes (WebSocket/SSE) for live pin updates
5. On expiry or manual "Stop sharing": shareToken invalidated, historical pins remain visible only to the owner
```

## 6. Live Destination Info ("Pulse") Workflow

```
1. User opens a Destination's "Live Info" tab
   → GET /api/v1/live-info/:destinationId
2. Backend Live-Info Service checks cache (Redis) per sub-feature:
   a. Weather: if cache stale (>10 min) → call OpenWeather → update cache
   b. Traffic: if cache stale (>2–5 min) → call Google Maps Traffic → update cache
   c. Wildlife: if cache stale (>24h) → call GBIF → update cache
   d. Landscape imagery: served from pre-curated static asset set (CDN), no live call
3. Backend aggregates all four into a single response payload
4. Frontend renders as a tabbed/segmented panel (Traffic | Weather | Landscape | Wildlife)
   with independent skeleton loaders per section so one slow API doesn't block the others
5. If any single source fails: that section shows a graceful fallback ("Data temporarily
   unavailable — last updated at HH:MM") while other sections render normally
```

## 7. End-to-End Booking Sequence (Simplified)

```
User → Frontend → API Gateway → Auth Middleware (verify JWT)
     → Booking Controller → Booking Service → Prisma → PostgreSQL (check availability, create PENDING booking)
     → Payments Service → Razorpay (create order)
     ← order details returned to Frontend
Frontend → Razorpay Checkout (client-side) → User pays
Razorpay → Webhook → Payments Controller → verify signature → update Payment + Booking status
     → Notification Service → Email/SMS queued (async worker)
Frontend → polls booking status or listens for update → shows final confirmation UI
```

## 8. Error & Retry Handling (cross-cutting)

- All booking/payment mutation endpoints are idempotent (client-generated idempotency key)
- Third-party API calls wrapped with timeout + single retry + circuit breaker (fail fast to cached/fallback data after N consecutive failures)
- Frontend: React Query automatic retry (max 2) with exponential backoff for transient network errors; user-facing errors are actionable ("Retry" button), not raw stack traces
