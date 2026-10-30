# API Design

Base URL: `https://{host}/api/v1`. Full OpenAPI 3.1 spec is generated from the route annotations and served at `/api/docs` (disabled in production unless `SWAGGER_ENABLED=true`).

## Conventions

- JSON in and out. `Content-Type: application/json`.
- Authentication: `Authorization: Bearer <accessToken>` for API calls. Refresh and logout use the httpOnly cookie plus the `X-CSRF-Token` header.
- Errors use one shape:

```json
{
  "error": {
    "code": "BOOKING_SEATS_UNAVAILABLE",
    "message": "Only 2 seats remain for this departure.",
    "requestId": "9f1c2a7e-...",
    "details": [{ "field": "travelers", "issue": "exceeds_available" }]
  }
}
```

- Pagination: cursor-based for lists (`?cursor=...&limit=20`), response includes `nextCursor`. Admin tables may use offset (`?page=&pageSize=`).
- Sorting: `?sort=price_asc | price_desc | rating_desc | popularity_desc | date_asc`.
- Money: `{ "amountMinor": 129900, "currency": "INR" }`.
- Idempotency: `POST` endpoints that create payments or bookings accept `Idempotency-Key`.
- Versioning: `/v1`. Breaking changes ship as `/v2`; the old version is supported for 6 months.

## Roles

| Code | Role | Notes |
|---|---|---|
| `OWNER` | Owner | Everything, including role management |
| `ADMIN` | Admin | Everything except role and permission changes |
| `CUSTOMER` | Client | Own data only |
| anonymous | Guest | Public catalog, search, blogs, contact |

Permissions are checked against codes like `packages:write`, `bookings:read:any`, and `reviews:moderate`. Role-to-permission mapping is stored in the database and editable by OWNER.

## Endpoints

### Authentication

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Guest | Create customer account; sends verification email |
| POST | `/auth/verify-email` | Guest | Consume verification token |
| POST | `/auth/login` | Guest | Returns access token; sets refresh and CSRF cookies |
| POST | `/auth/refresh` | Refresh cookie + CSRF | Rotates refresh token, returns new access token |
| POST | `/auth/logout` | Refresh cookie + CSRF | Revokes token family |
| POST | `/auth/forgot-password` | Guest | Always returns 202 (no account enumeration) |
| POST | `/auth/reset-password` | Guest | Consume reset token |
| GET | `/auth/sessions` | CUSTOMER | List active sessions |
| DELETE | `/auth/sessions/:id` | CUSTOMER | Revoke one session |

### Users and Profile

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/users/me` | Any authenticated | Own profile |
| PATCH | `/users/me` | Any authenticated | Update name, phone, locale |
| PATCH | `/users/me/password` | Any authenticated | Change password (requires current password) |
| GET | `/users` | `users:read` | Admin list with filters |
| GET | `/users/:id` | `users:read` | Admin view, includes login activity |
| PATCH | `/users/:id/status` | `users:write` | Activate or deactivate |
| PUT | `/users/:id/role` | `roles:assign` (OWNER) | Assign role; writes audit log |

### Roles and Permissions

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/roles` | `roles:read` | List roles with permissions |
| POST | `/roles` | OWNER | Create custom role |
| PUT | `/roles/:id/permissions` | OWNER | Replace permission set |
| GET | `/permissions` | `roles:read` | Permission catalog |

### Destinations

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/destinations` | Guest | List active destinations; `?q=`, `?country=`, `?lang=` |
| GET | `/destinations/:slug` | Guest | Detail with coordinates and package count |
| GET | `/destinations/map` | Guest | Lightweight marker list for the map |
| POST | `/admin/destinations` | `destinations:write` | Create |
| PATCH | `/admin/destinations/:id` | `destinations:write` | Update |
| DELETE | `/admin/destinations/:id` | `destinations:write` | Soft delete; blocked if published packages exist |

### Packages

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/packages` | Guest | Catalog list with filters (see Search) |
| GET | `/packages/:slug` | Guest | Full detail: itinerary, inclusions, exclusions, media, rating |
| GET | `/packages/:id/departures` | Guest | Available dates and seats for a month: `?from=&to=` |
| POST | `/admin/packages` | `packages:write` | Create as DRAFT |
| PATCH | `/admin/packages/:id` | `packages:write` | Update; `If-Match` header with version for concurrency |
| POST | `/admin/packages/:id/publish` | `packages:publish` | DRAFT to PUBLISHED, validates required fields |
| POST | `/admin/packages/:id/archive` | `packages:write` | Stop sales |
| DELETE | `/admin/packages/:id` | `packages:delete` | Soft delete; blocked if future bookings exist |
| POST | `/admin/packages/:id/departures` | `packages:write` | Add dates with capacity |
| PATCH | `/admin/departures/:id` | `packages:write` | Change capacity or price; cannot go below seats booked |
| POST | `/admin/packages/:id/media/upload-url` | `packages:write` | Returns presigned S3 PUT URL |
| POST | `/admin/packages/:id/media` | `packages:write` | Register uploaded object (after upload) |
| DELETE | `/admin/media/:id` | `packages:write` | Remove media record and S3 object |

### Search

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/search/packages` | Guest | Advanced search |
| GET | `/search/suggest` | Guest | Autocomplete for destinations and packages (rate-limited) |

Query parameters for `/search/packages`:

| Param | Type | Example |
|---|---|---|
| `q` | string | `goa beach` |
| `destinationId` | uuid, repeatable | |
| `minPrice`, `maxPrice` | integer, minor units | `50000` |
| `minDays`, `maxDays` | integer | `3`, `7` |
| `departureFrom`, `departureTo` | date | `2026-12-01` |
| `travelType` | enum, repeatable | `BEACH` |
| `minRating` | number 0-5 | `4` |
| `sort` | enum | `popularity_desc` |

Facets (counts per destination, travel type, price band) are returned alongside results when `includeFacets=true`.

### Wishlist

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/wishlist` | CUSTOMER | Saved packages |
| PUT | `/wishlist/:packageId` | CUSTOMER | Add (idempotent) |
| DELETE | `/wishlist/:packageId` | CUSTOMER | Remove |

### Bookings

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/bookings` | CUSTOMER | Create hold: `{packageId, departureId, travelers, couponCode?}`. Returns `PENDING_PAYMENT` with `expiresAt`. Requires `Idempotency-Key` |
| GET | `/bookings` | CUSTOMER | Own booking history, filter by status |
| GET | `/bookings/:id` | CUSTOMER (own), `bookings:read:any` | Detail with payment and refund state |
| POST | `/bookings/:id/cancel` | CUSTOMER (own) | Request cancellation; policy applied server-side, returns refund quote |
| GET | `/bookings/:id/refund-quote` | CUSTOMER (own) | Preview refund amount before cancelling |
| GET | `/admin/bookings` | `bookings:read:any` | All bookings with filters and CSV export |
| PATCH | `/admin/bookings/:id/status` | `bookings:write` | Manual status change with reason |
| POST | `/admin/refunds/:id/approve` | `refunds:approve` | Approve requested refund |
| POST | `/admin/refunds/:id/reject` | `refunds:approve` | Reject with reason |

### Payments

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/bookings/:id/payments` | CUSTOMER (own) | Create gateway payment intent; returns client secret or redirect URL. Requires `Idempotency-Key` |
| POST | `/webhooks/stripe` | Provider signature | Payment events; verified and deduplicated |
| POST | `/webhooks/razorpay` | Provider signature | Payment events |

Webhook endpoints are excluded from the CSRF check and the JSON body parser runs on the raw body so signatures can be verified.

### Invoices

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/bookings/:id/invoice` | CUSTOMER (own), `invoices:read` | Returns a presigned download URL (valid 5 minutes) |

### Reviews

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/packages/:id/reviews` | Guest | Approved reviews, paginated, with rating histogram |
| POST | `/bookings/:id/review` | CUSTOMER (own, completed booking) | Create review; one per booking |
| PATCH | `/reviews/:id` | CUSTOMER (own, within 30 days) | Edit |
| GET | `/admin/reviews` | `reviews:moderate` | Moderation queue |
| PATCH | `/admin/reviews/:id/status` | `reviews:moderate` | Approve or reject; updates package rating |

### Notifications

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/notifications` | CUSTOMER | Notification center, paginated |
| GET | `/notifications/unread-count` | CUSTOMER | Badge count |
| PATCH | `/notifications/:id/read` | CUSTOMER (own) | Mark read |
| POST | `/notifications/read-all` | CUSTOMER | Mark all read |
| POST | `/admin/notifications/broadcast` | `notifications:send` | Targeted message; queued |

Real-time delivery to the open browser tab uses Server-Sent Events at `GET /notifications/stream`.

### Blogs

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/blogs` | Guest | Published posts |
| GET | `/blogs/:slug` | Guest | Post detail (sanitized HTML) |
| POST | `/admin/blogs` | `blogs:write` | Create draft |
| PATCH | `/admin/blogs/:id` | `blogs:write` | Update |
| POST | `/admin/blogs/:id/publish` | `blogs:publish` | Publish |

### Banners

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/banners?position=HOME_HERO` | Guest | Active banners in schedule window |
| POST | `/admin/banners` | `banners:write` | Create |
| PATCH | `/admin/banners/:id` | `banners:write` | Update, reorder, schedule |
| DELETE | `/admin/banners/:id` | `banners:write` | Delete |

### Contact

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/contact` | Guest | Submit message; rate-limited 3/hour per IP; honeypot field |
| GET | `/admin/contact-messages` | `contact:read` | Inbox |
| PATCH | `/admin/contact-messages/:id` | `contact:read` | Update status, assign |

### Analytics and Reports

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/admin/analytics/kpis?from=&to=` | `analytics:read` | Total users, packages, revenue, bookings, cancellation rate |
| GET | `/admin/analytics/revenue?from=&to=&groupBy=month` | `analytics:read` | Revenue time series for charts |
| GET | `/admin/analytics/bookings-by-destination` | `analytics:read` | Breakdown for charts |
| GET | `/admin/analytics/top-packages` | `analytics:read` | Ranked by bookings or revenue |
| GET | `/admin/reports/monthly?month=2026-10` | `reports:read` | Monthly report as JSON or `?format=csv` |
| GET | `/admin/audit-logs` | `audit:read` (OWNER, ADMIN) | Filter by actor, entity, action, date |
| GET | `/admin/login-activity` | `audit:read` | Login attempts and failed-login alerts |

Analytics queries run against the read replica (`reporting_ro`). KPI results are cached in Redis for 5 minutes.

### Health

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | None | Liveness |
| GET | `/ready` | None | Database and Redis connectivity |

### Later phases (not in v1)

| Area | Endpoints (planned) |
|---|---|
| Coupons | `POST /admin/coupons`, `POST /coupons/validate` |
| Referrals | `GET /referrals/me`, `POST /referrals/apply` |
| Loyalty | `GET /loyalty/balance`, `GET /loyalty/ledger`, `POST /bookings/:id/redeem-points` |
| Recommendations | `GET /recommendations/packages` |
| Weather | `GET /destinations/:id/weather` (cached 30 min) |
| Insurance | `GET /insurance/quotes`, `POST /bookings/:id/insurance` (partner API) |
| Chat | `WS /chat` (authenticated handshake), `GET /admin/chat/sessions` |

## Status Codes

| Code | Meaning |
|---|---|
| 200 / 201 / 204 | Success |
| 202 | Accepted for async processing (for example, password reset) |
| 400 | Validation failed |
| 401 | Missing or expired access token |
| 403 | Authenticated but not permitted |
| 404 | Not found, or hidden because the caller may not see it |
| 409 | Conflict (seats unavailable, version mismatch, duplicate review) |
| 422 | Business rule violated (for example, cancellation window passed) |
| 429 | Rate limited, with `Retry-After` |
| 500 | Unexpected error; body contains only `requestId` |
