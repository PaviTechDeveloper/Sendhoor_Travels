# Development Roadmap

Estimates assume a team of about 5: 2 backend, 2 frontend, 1 full-stack or DevOps. They are planning figures and will move once the open decisions in [ARCHITECTURE.md section 11](ARCHITECTURE.md#11-decisions-needed-before-build) are settled.

## Phase Overview

| Phase | Scope | Duration | Exit criteria |
|---|---|---|---|
| 0. Foundation | Repo, Docker Compose, CI, env validation, Prisma baseline, Swagger skeleton, logging | 1.5 weeks | `docker compose up` runs API, web, DB, Redis, MinIO; CI green |
| 1. Identity and RBAC | Register, verify email, login, refresh rotation, lockout, roles and permissions, guards | 2.5 weeks | Auth flow passes security test cases; RBAC matrix enforced in integration tests |
| 2. Catalog | Destinations, packages, departures, media uploads to S3, publish workflow, admin CRUD | 3 weeks | Admin can create and publish a package with dates and images |
| 3. Search and Discovery | Advanced search, filters, facets, suggestions, wishlist, destination map | 2.5 weeks | Search p95 under 300 ms on 50k packages (load test) |
| 4. Booking and Payments | Seat holds, expiry job, checkout, gateway integration, webhooks, cancellation, refunds, invoices | 4 weeks | End-to-end booking with test payments; no overbooking under concurrent load test |
| 5. Engagement | Reviews and moderation, notifications (in-app, email, SMS), contact form, blogs, banners | 3 weeks | Review updates rating; notifications delivered and retried on failure |
| 6. Admin Dashboard | KPI cards, charts (Recharts), revenue and booking analytics, monthly reports, audit and login views | 2.5 weeks | Dashboard numbers match SQL reference queries |
| 7. Customer Experience | Home page (hero, video, counters, testimonials, FAQ, map), account area, booking history, profile | 4 weeks | Lighthouse performance 85+ on mobile; accessibility checks pass |
| 8. Security and Ops Hardening | Penetration test, dependency audit, backup and restore drill, alert tuning, runbooks | 2 weeks | Pen test findings closed or accepted; restore drill passes |
| 9. Launch | Staging sign-off, production deploy, monitoring, support handover | 1 week | Go-live checklist complete |
| 10. Extended features | See below. Each is a separate release | Ongoing | Each feature has its own exit criteria |

Phases 1 to 3 can overlap with frontend work once the API contract in [API.md](API.md) is agreed. Parallel tracks reduce the overall calendar time to about 6 months to the phase 9 launch.

Total to launch: about 24 weeks with the parallel tracks.

## Phase Details

### Phase 0: Foundation

- Monorepo with workspaces (`apps/web`, `services/api`, `packages/shared`)
- ESLint, Prettier, TypeScript strict mode, Husky pre-commit hooks
- `env.ts` with Zod validation, fails at startup on missing secrets
- Prisma baseline migration generated from [schema.sql](../database/schema.sql); a CI check compares the two
- Express skeleton: helmet, CORS allowlist, rate limiter, request ID, pino logging, error handler
- Swagger generated from annotations
- Docker images for API and web; Compose for local
- CI pipeline (section 9 of ARCHITECTURE.md)

### Phase 1: Identity and RBAC

- bcrypt hashing (cost 12), password policy (length 12 or more, breached-password check via k-anonymity API)
- JWT access and rotating refresh tokens with reuse detection
- Cookie and CSRF setup
- Lockout and login activity logging
- Email verification and password reset (single-use tokens)
- RBAC: roles, permissions, `authorize()` middleware, OWNER-only role management
- Frontend: login, register, session slice, RTK Query re-auth on 401, route guards
- Security test cases: token reuse, CSRF rejection, brute force lockout, privilege escalation attempts

### Phase 2: Catalog

- Destination CRUD and map markers
- Package CRUD with all fields from the brief (name, description, duration, price, discount, images, videos, destination, itinerary, inclusions, exclusions, available dates, max travelers)
- Departures with capacity and per-date price override
- Presigned S3 uploads with size and MIME validation; images processed to web sizes in the worker
- Publish validation (required fields, at least one future departure, at least one image)
- Audit log for every admin change

### Phase 3: Search and Discovery

- Search endpoint with destination, budget, duration, date, travel type, rating, and popularity filters
- Facet counts
- Full-text search with typo tolerance added through a search engine if relevance tuning needs it
- Wishlist
- Destination map with clustering (Google Maps)
- Frontend filter panel synced to the URL, so filtered views can be shared

### Phase 4: Booking and Payments

- Seat hold with 15-minute expiry
- Checkout flow with price recomputed on the server
- Gateway integration (chosen provider) with hosted payment fields
- Webhook handler with signature check and idempotency
- Booking confirmation email and in-app notification
- Cancellation policy engine: refund percentage by days before departure, configured per package
- Refund requests, approval by ADMIN, processing through gateway
- Invoice PDF generated by worker, stored in S3, downloadable via presigned URL
- Booking status tracking timeline in the UI

### Phase 5: Engagement

- Review submission after a completed booking, moderation queue, rating recalculation
- In-app notifications with SSE, email and SMS via providers, retry with exponential backoff, dead-letter queue
- Contact form with spam protection (honeypot, rate limit, optional CAPTCHA)
- Blog CMS with sanitized rich text
- Banner scheduling

### Phase 6: Admin Dashboard

- KPI cards: total users, packages, revenue, bookings
- Charts: revenue by month, bookings by destination, top packages, cancellation rate
- Monthly report export (CSV and PDF)
- Audit log and login activity views with failed-login alerts

### Phase 7: Customer Experience

- Home page: full-screen video hero, destination showcase, trending packages, animated counters, testimonials, interactive map, blog teaser, FAQ accordion, contact section
- Motion: Framer Motion fade and scroll reveals, hover and micro-interactions, skeleton loaders
- Motion respects `prefers-reduced-motion`; hero video is replaced by a poster image on slow connections and mobile data saver
- Smooth scroll with native CSS `scroll-behavior` plus a fallback
- Responsive layouts tested at 360, 768, 1024, and 1440 px
- Account area: profile, booking history, invoices, reviews, wishlist, notification center
- Design reference: Airbnb, Booking.com, MakeMyTrip, Expedia patterns (search bar, card grid, filter drawer, sticky booking summary)

### Phase 8: Security and Operations Hardening

- External penetration test against staging
- Review of all findings from [ARCHITECTURE.md section 6](ARCHITECTURE.md#6-security-architecture)
- Dependency and image scan clean or accepted with an expiry date
- Restore drill performed and documented
- Alerts tuned; runbooks reviewed by on-call

### Phase 9: Launch

- Data migration (none expected; greenfield)
- Production environment provisioned by Terraform
- Smoke test checklist
- Support handover and first-week watch

### Phase 10: Extended Features

Each feature is independent and can be reordered.

| Feature | Approach | Dependency | Rough effort |
|---|---|---|---|
| Multi-language | i18next on frontend; translation tables for content; locale-aware formatting | Locales confirmed | 3 weeks |
| Coupons | Coupon module, validation at checkout, redemption counts in transaction | Phase 4 | 1.5 weeks |
| Referral system | Referral codes, reward on referee's first completed booking | Coupons | 1.5 weeks |
| Loyalty points | Append-only ledger, earn on completion, redeem as discount | Phase 4 | 2 weeks |
| Weather API | Server-side proxy with 30-minute cache; shown on destination page | Provider key | 1 week |
| Google Maps | Already partially in Phase 3; add directions and place search | Maps key and billing | 1 week |
| AI recommendations | Phase A: rules and popularity ranking. Phase B: collaborative filtering on booking history | Enough booking data for Phase B | 2 weeks (A), 4 weeks (B) |
| Chat support | WebSocket gateway, agent console, handoff from contact form. Consider a hosted provider first | Staffing model | 3 weeks |
| Travel insurance | Partner API integration, quote and purchase, policy document in invoice bundle | Licensed insurance partner | 3 weeks plus partner onboarding |

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Payment provider onboarding takes longer than expected | Phase 4 slips | Start merchant onboarding in Phase 0; use sandbox and mock adapter until live keys arrive |
| Seat overbooking under concurrency | Customer harm, refunds | Row lock plus DB constraint; concurrency integration test in CI |
| Scope creep into extended features before launch | Launch delay | Phase 10 items are out of v1 unless the product owner moves them |
| Video hero performance on mobile | Poor Core Web Vitals | Compressed WebM and MP4 sources, poster image, lazy load after first paint |
| Multi-language content effort underestimated | Late-stage rework | Decide locales now; design translation tables in v1 (already in schema) |
| Insurance partner not available | Phase 10 blocked | Not on launch critical path |
| Key-person dependency on payments or infrastructure | Delivery risk | Pair on integrations; runbooks in Phase 8 |

## Definition of Done (every story)

- Code reviewed by one engineer who did not write it
- Unit tests for service logic; integration test for each new endpoint
- OpenAPI annotation updated
- RBAC check present and tested
- Audit log entry for any admin mutation
- Input validation schema present
- No new `npm audit` high or critical finding
- Accessibility check on any new UI (keyboard, labels, contrast)
- Feature flag set if the feature is not ready for users
