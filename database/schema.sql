-- Travel & Tourism Booking Platform: PostgreSQL reference schema (v1)
--
-- Conventions:
--   * Primary keys are UUID (gen_random_uuid) except lookup tables (SMALLSERIAL) and append-only logs (BIGSERIAL).
--   * Money is stored as BIGINT in minor units (paise, cents). Never FLOAT or NUMERIC for amounts shown to users.
--   * Enumerated values are VARCHAR with CHECK constraints so a migration can extend them without a type change.
--   * Timestamps are TIMESTAMPTZ, stored in UTC.
--   * Soft delete (deleted_at) on user-facing content; bookings, payments, and audit rows are never deleted.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Identity and access control
-- ---------------------------------------------------------------------------

CREATE TABLE roles (
    id          SMALLSERIAL PRIMARY KEY,
    name        VARCHAR(32)  NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE permissions (
    id          SMALLSERIAL PRIMARY KEY,
    code        VARCHAR(64)  NOT NULL UNIQUE,      -- e.g. 'packages:write', 'bookings:read:any'
    description VARCHAR(255)
);

CREATE TABLE role_permissions (
    role_id       SMALLINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id SMALLINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id            SMALLINT     NOT NULL REFERENCES roles(id),
    email              VARCHAR(254) NOT NULL CHECK (email = lower(email)),
    password_hash      VARCHAR(100) NOT NULL,         -- bcrypt output, cost 12
    first_name         VARCHAR(100) NOT NULL,
    last_name          VARCHAR(100) NOT NULL,
    phone_encrypted    BYTEA,                         -- AES-256-GCM envelope, see docs/ARCHITECTURE.md section 6
    preferred_locale   VARCHAR(10)  NOT NULL DEFAULT 'en',
    is_active          BOOLEAN      NOT NULL DEFAULT TRUE,
    email_verified_at  TIMESTAMPTZ,
    failed_login_count SMALLINT     NOT NULL DEFAULT 0 CHECK (failed_login_count >= 0),
    locked_until       TIMESTAMPTZ,
    last_login_at      TIMESTAMPTZ,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at         TIMESTAMPTZ
);
CREATE UNIQUE INDEX users_email_active_uq ON users (email) WHERE deleted_at IS NULL;
CREATE INDEX users_role_idx ON users (role_id);

CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    family_id   UUID         NOT NULL,                -- one login session; reuse revokes the family
    token_hash  CHAR(64)     NOT NULL UNIQUE,         -- SHA-256 hex of the opaque token
    replaced_by UUID        REFERENCES refresh_tokens(id),
    user_agent  VARCHAR(512),
    ip_address  INET,
    expires_at  TIMESTAMPTZ  NOT NULL,
    revoked_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CHECK (expires_at > created_at)
);
CREATE INDEX refresh_tokens_user_idx   ON refresh_tokens (user_id);
CREATE INDEX refresh_tokens_family_idx ON refresh_tokens (family_id);

CREATE TABLE login_activity (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    email_attempted VARCHAR(254) NOT NULL,
    success         BOOLEAN      NOT NULL,
    failure_reason  VARCHAR(64),                       -- 'BAD_PASSWORD', 'LOCKED', 'INACTIVE', ...
    ip_address      INET         NOT NULL,
    user_agent      VARCHAR(512),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX login_activity_user_time_idx ON login_activity (user_id, created_at DESC);
CREATE INDEX login_activity_ip_time_idx   ON login_activity (ip_address, created_at DESC) WHERE success = FALSE;

-- ---------------------------------------------------------------------------
-- Catalog: destinations, packages, media
-- ---------------------------------------------------------------------------

CREATE TABLE destinations (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug             VARCHAR(120) NOT NULL UNIQUE,
    name             VARCHAR(150) NOT NULL,
    country          VARCHAR(100) NOT NULL,
    region           VARCHAR(100),
    description      TEXT,                              -- sanitized before storage
    latitude         NUMERIC(9,6) CHECK (latitude BETWEEN -90 AND 90),
    longitude        NUMERIC(9,6) CHECK (longitude BETWEEN -180 AND 180),
    cover_image_key  VARCHAR(512),                      -- S3 object key
    popularity_score INTEGER      NOT NULL DEFAULT 0,
    is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at       TIMESTAMPTZ
);
CREATE INDEX destinations_country_idx ON destinations (country);

CREATE TABLE destination_translations (
    destination_id UUID        NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    locale         VARCHAR(10) NOT NULL,
    name           VARCHAR(150) NOT NULL,
    description    TEXT,
    PRIMARY KEY (destination_id, locale)
);

CREATE TABLE packages (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug             VARCHAR(160) NOT NULL UNIQUE,
    destination_id   UUID         NOT NULL REFERENCES destinations(id),
    created_by       UUID         REFERENCES users(id) ON DELETE SET NULL,
    name             VARCHAR(200) NOT NULL,
    description      TEXT,
    travel_type      VARCHAR(20)  NOT NULL CHECK (travel_type IN
                       ('ADVENTURE','BEACH','CULTURAL','CRUISE','FAMILY','HONEYMOON','BUSINESS','WILDLIFE','CUSTOM')),
    duration_days    SMALLINT     NOT NULL CHECK (duration_days BETWEEN 1 AND 365),
    nights           SMALLINT     NOT NULL CHECK (nights >= 0 AND nights <= duration_days),
    base_price_minor BIGINT       NOT NULL CHECK (base_price_minor >= 0),
    currency         CHAR(3)      NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
    discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (discount_percent BETWEEN 0 AND 100),
    max_travelers    SMALLINT     NOT NULL CHECK (max_travelers > 0),
    itinerary        JSONB        NOT NULL DEFAULT '[]'::jsonb,   -- [{day, title, description, meals[], activities[]}]
    inclusions       JSONB        NOT NULL DEFAULT '[]'::jsonb,
    exclusions       JSONB        NOT NULL DEFAULT '[]'::jsonb,
    status           VARCHAR(12)  NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
    average_rating   NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (average_rating BETWEEN 0 AND 5),
    review_count     INTEGER      NOT NULL DEFAULT 0 CHECK (review_count >= 0),
    booking_count    INTEGER      NOT NULL DEFAULT 0 CHECK (booking_count >= 0),  -- popularity signal
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at       TIMESTAMPTZ
);
CREATE INDEX packages_destination_idx   ON packages (destination_id);
CREATE INDEX packages_status_price_idx  ON packages (status, base_price_minor);
CREATE INDEX packages_travel_type_idx   ON packages (travel_type) WHERE status = 'PUBLISHED';
CREATE INDEX packages_rating_idx        ON packages (average_rating DESC, review_count DESC) WHERE status = 'PUBLISHED';
CREATE INDEX packages_popularity_idx    ON packages (booking_count DESC) WHERE status = 'PUBLISHED';
CREATE INDEX packages_fts_idx ON packages
    USING GIN (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, '')));

CREATE TABLE package_media (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id  UUID         NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    media_type  VARCHAR(5)   NOT NULL CHECK (media_type IN ('IMAGE','VIDEO')),
    s3_key      VARCHAR(512) NOT NULL UNIQUE,
    alt_text    VARCHAR(255),
    sort_order  SMALLINT     NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX package_media_package_idx ON package_media (package_id, sort_order);

-- Seat inventory. One row per departure date. The CHECK constraint is the last line of defense
-- against overbooking; the booking service also locks the row (SELECT ... FOR UPDATE).
CREATE TABLE package_departures (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id            UUID        NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    departure_date        DATE        NOT NULL,
    capacity              SMALLINT    NOT NULL CHECK (capacity > 0),
    seats_booked          SMALLINT    NOT NULL DEFAULT 0,
    price_override_minor  BIGINT      CHECK (price_override_minor >= 0),
    version               INTEGER     NOT NULL DEFAULT 0,         -- optimistic lock for admin edits
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT departures_package_date_uq UNIQUE (package_id, departure_date),
    CONSTRAINT departures_seats_within_capacity CHECK (seats_booked >= 0 AND seats_booked <= capacity)
);
CREATE INDEX departures_date_idx ON package_departures (departure_date);

-- ---------------------------------------------------------------------------
-- Commerce: coupons, bookings, payments, refunds, invoices
-- ---------------------------------------------------------------------------

CREATE TABLE coupons (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(40)  NOT NULL UNIQUE CHECK (code = upper(code)),
    discount_type   VARCHAR(7)   NOT NULL CHECK (discount_type IN ('PERCENT','FIXED')),
    discount_value  BIGINT       NOT NULL CHECK (discount_value > 0),  -- percent points or minor units
    min_amount_minor BIGINT      NOT NULL DEFAULT 0 CHECK (min_amount_minor >= 0),
    max_redemptions INTEGER,
    redeemed_count  INTEGER      NOT NULL DEFAULT 0 CHECK (redeemed_count >= 0),
    valid_from      TIMESTAMPTZ  NOT NULL,
    valid_until     TIMESTAMPTZ  NOT NULL,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    CHECK (valid_until > valid_from),
    CHECK (max_redemptions IS NULL OR redeemed_count <= max_redemptions)
);

CREATE TABLE bookings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference   VARCHAR(12)  NOT NULL UNIQUE,          -- human-readable, e.g. TRV-7K2Q9M
    user_id             UUID         NOT NULL REFERENCES users(id),
    package_id          UUID         NOT NULL REFERENCES packages(id),
    departure_id        UUID         NOT NULL REFERENCES package_departures(id),
    coupon_id           UUID         REFERENCES coupons(id),
    travelers           SMALLINT     NOT NULL CHECK (travelers > 0),
    currency            CHAR(3)      NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
    subtotal_minor      BIGINT       NOT NULL CHECK (subtotal_minor >= 0),
    discount_minor      BIGINT       NOT NULL DEFAULT 0 CHECK (discount_minor >= 0),
    tax_minor           BIGINT       NOT NULL DEFAULT 0 CHECK (tax_minor >= 0),
    total_minor         BIGINT       NOT NULL CHECK (total_minor >= 0),
    status              VARCHAR(20)  NOT NULL DEFAULT 'PENDING_PAYMENT' CHECK (status IN
                          ('PENDING_PAYMENT','CONFIRMED','CANCELLATION_REQUESTED','CANCELLED','COMPLETED','EXPIRED')),
    cancellation_reason VARCHAR(500),
    expires_at          TIMESTAMPTZ,                           -- unpaid holds are released at this time
    confirmed_at        TIMESTAMPTZ,
    cancelled_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CHECK (total_minor = subtotal_minor - discount_minor + tax_minor),
    CHECK (status <> 'PENDING_PAYMENT' OR expires_at IS NOT NULL)
);
CREATE INDEX bookings_user_created_idx      ON bookings (user_id, created_at DESC);
CREATE INDEX bookings_departure_status_idx  ON bookings (departure_id, status);
CREATE INDEX bookings_status_expiry_idx     ON bookings (status, expires_at) WHERE status = 'PENDING_PAYMENT';
CREATE INDEX bookings_package_idx           ON bookings (package_id);

CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id          UUID         NOT NULL REFERENCES bookings(id),
    provider            VARCHAR(20)  NOT NULL CHECK (provider IN ('STRIPE','RAZORPAY','PAYPAL')),
    provider_payment_id VARCHAR(128) NOT NULL UNIQUE,         -- gateway reference only; no card data stored
    idempotency_key     VARCHAR(64)  NOT NULL UNIQUE,
    amount_minor        BIGINT       NOT NULL CHECK (amount_minor > 0),
    currency            CHAR(3)      NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
    status              VARCHAR(12)  NOT NULL DEFAULT 'PENDING' CHECK (status IN
                          ('PENDING','SUCCEEDED','FAILED','REFUNDED','PARTIALLY_REFUNDED')),
    failure_code        VARCHAR(64),
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX payments_booking_idx ON payments (booking_id);

CREATE TABLE payment_webhook_events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider    VARCHAR(20)  NOT NULL,
    event_id    VARCHAR(128) NOT NULL,                        -- provider event ID, for idempotent processing
    event_type  VARCHAR(64)  NOT NULL,
    payload     JSONB        NOT NULL,
    processed_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE (provider, event_id)
);

CREATE TABLE refunds (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id         UUID         NOT NULL REFERENCES payments(id),
    booking_id         UUID         NOT NULL REFERENCES bookings(id),
    requested_by       UUID         REFERENCES users(id) ON DELETE SET NULL,
    provider_refund_id VARCHAR(128) UNIQUE,
    amount_minor       BIGINT       NOT NULL CHECK (amount_minor > 0),
    reason             VARCHAR(500),
    status             VARCHAR(12)  NOT NULL DEFAULT 'REQUESTED' CHECK (status IN
                         ('REQUESTED','APPROVED','PROCESSED','FAILED','REJECTED')),
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    processed_at       TIMESTAMPTZ
);
CREATE INDEX refunds_booking_idx ON refunds (booking_id);
CREATE INDEX refunds_status_idx  ON refunds (status) WHERE status IN ('REQUESTED','APPROVED');

CREATE TABLE invoices (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id       UUID         NOT NULL UNIQUE REFERENCES bookings(id),
    invoice_number   VARCHAR(20)  NOT NULL UNIQUE,            -- sequential per fiscal year, e.g. INV-2026-000231
    total_minor      BIGINT       NOT NULL CHECK (total_minor >= 0),
    tax_minor        BIGINT       NOT NULL DEFAULT 0 CHECK (tax_minor >= 0),
    currency         CHAR(3)      NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
    pdf_s3_key       VARCHAR(512),
    issued_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Engagement: reviews, wishlist, notifications, blogs, banners, contact
-- ---------------------------------------------------------------------------

CREATE TABLE reviews (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id  UUID         NOT NULL UNIQUE REFERENCES bookings(id),   -- one review per completed booking
    package_id  UUID         NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating      SMALLINT     NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title       VARCHAR(150),
    body        TEXT CHECK (char_length(body) <= 4000),
    status      VARCHAR(10)  NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED')),
    moderated_by UUID        REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX reviews_package_approved_idx ON reviews (package_id) WHERE status = 'APPROVED';
CREATE INDEX reviews_status_created_idx   ON reviews (status, created_at);

CREATE TABLE wishlists (
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    package_id UUID        NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, package_id)
);
CREATE INDEX wishlists_package_idx ON wishlists (package_id);

CREATE TABLE notifications (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       VARCHAR(40)  NOT NULL,                          -- 'BOOKING_CONFIRMED', 'REFUND_PROCESSED', ...
    title      VARCHAR(150) NOT NULL,
    body       VARCHAR(1000),
    data       JSONB        NOT NULL DEFAULT '{}'::jsonb,
    read_at    TIMESTAMPTZ,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_unread_idx ON notifications (user_id, created_at DESC) WHERE read_at IS NULL;

CREATE TABLE blogs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            VARCHAR(180) NOT NULL UNIQUE,
    author_id       UUID         NOT NULL REFERENCES users(id),
    title           VARCHAR(200) NOT NULL,
    excerpt         VARCHAR(500),
    body            TEXT         NOT NULL,                      -- sanitized HTML or Markdown
    cover_image_key VARCHAR(512),
    status          VARCHAR(10)  NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CHECK (status <> 'PUBLISHED' OR published_at IS NOT NULL)
);
CREATE INDEX blogs_published_idx ON blogs (published_at DESC) WHERE status = 'PUBLISHED';

CREATE TABLE banners (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       VARCHAR(150) NOT NULL,
    image_key   VARCHAR(512) NOT NULL,
    link_url    VARCHAR(512),
    position    VARCHAR(20)  NOT NULL DEFAULT 'HOME_HERO' CHECK (position IN ('HOME_HERO','HOME_MID','SEARCH_TOP')),
    sort_order  SMALLINT     NOT NULL DEFAULT 0,
    starts_at   TIMESTAMPTZ,
    ends_at     TIMESTAMPTZ,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at)
);
CREATE INDEX banners_position_active_idx ON banners (position, sort_order) WHERE is_active;

CREATE TABLE contact_messages (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(150) NOT NULL,
    email        VARCHAR(254) NOT NULL,
    subject      VARCHAR(200),
    message      TEXT         NOT NULL CHECK (char_length(message) <= 5000),
    status       VARCHAR(12)  NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW','IN_PROGRESS','RESOLVED')),
    handled_by   UUID         REFERENCES users(id) ON DELETE SET NULL,
    ip_address   INET,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX contact_messages_status_idx ON contact_messages (status, created_at);

-- ---------------------------------------------------------------------------
-- Later phases: referrals and loyalty
-- ---------------------------------------------------------------------------

CREATE TABLE referrals (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_user_id  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_user_id  UUID        UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    referral_code     VARCHAR(20) NOT NULL UNIQUE,
    status            VARCHAR(10) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','REWARDED','VOID')),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (referrer_user_id <> referred_user_id)
);

CREATE TABLE loyalty_ledger (
    id          BIGSERIAL PRIMARY KEY,                       -- append-only; balance = SUM(points)
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points      INTEGER     NOT NULL CHECK (points <> 0),
    reason      VARCHAR(40) NOT NULL,                        -- 'BOOKING_COMPLETED', 'REFERRAL', 'REDEEMED', ...
    booking_id  UUID        REFERENCES bookings(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX loyalty_ledger_user_idx ON loyalty_ledger (user_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- Audit: append-only
-- ---------------------------------------------------------------------------

CREATE TABLE audit_logs (
    id            BIGSERIAL PRIMARY KEY,
    actor_user_id UUID         REFERENCES users(id) ON DELETE SET NULL,
    action        VARCHAR(64)  NOT NULL,                     -- 'PACKAGE_UPDATED', 'ROLE_ASSIGNED', ...
    entity_type   VARCHAR(40)  NOT NULL,
    entity_id     VARCHAR(64)  NOT NULL,
    ip_address    INET,
    user_agent    VARCHAR(512),
    metadata      JSONB        NOT NULL DEFAULT '{}'::jsonb,  -- before/after values, never secrets
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_entity_idx ON audit_logs (entity_type, entity_id, created_at DESC);
CREATE INDEX audit_logs_actor_idx  ON audit_logs (actor_user_id, created_at DESC);
CREATE INDEX audit_logs_time_idx   ON audit_logs (created_at);

-- Enforce append-only for the application role. Run as the schema owner during setup.
-- REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs, login_activity FROM app_user;
