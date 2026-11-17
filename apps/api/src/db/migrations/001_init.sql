-- MOVA initial schema.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE companies (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE,
  is_demo     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TYPE user_role AS ENUM ('student', 'driver', 'operator', 'super_admin');

CREATE TABLE users (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name      text NOT NULL,
  email          text NOT NULL,
  phone          text NOT NULL,
  student_id     text,
  password_hash  text NOT NULL,
  role           user_role NOT NULL DEFAULT 'student',
  company_id     uuid REFERENCES companies(id) ON DELETE SET NULL,
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX users_email_unique ON users (lower(email));

CREATE TABLE buses (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  plate        text NOT NULL,
  capacity     integer NOT NULL CHECK (capacity > 0 AND capacity <= 90),
  -- Seat layout: array of rows; each cell is a seat number (string) or null for the aisle/gap.
  layout       jsonb NOT NULL,
  driver_id    uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX buses_plate_unique ON buses (upper(plate));

CREATE TYPE trip_type AS ENUM ('inter_regional', 'campus_shuttle');

CREATE TABLE trips (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  bus_id          uuid NOT NULL REFERENCES buses(id) ON DELETE RESTRICT,
  origin          text NOT NULL,
  destination     text NOT NULL,
  departure_at    timestamptz NOT NULL,
  fare_pesewas    integer NOT NULL CHECK (fare_pesewas > 0),
  trip_type       trip_type NOT NULL,
  is_cancelled    boolean NOT NULL DEFAULT false,
  is_demo         boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX trips_departure_idx ON trips (departure_at);

CREATE TYPE luggage_category AS ENUM ('none', 'standard', 'large');
CREATE TYPE payment_status AS ENUM ('pending', 'successful', 'failed', 'refunded', 'flagged');

CREATE TABLE payments (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference          text NOT NULL UNIQUE,
  user_id            uuid NOT NULL REFERENCES users(id),
  trip_id            uuid NOT NULL REFERENCES trips(id),
  seat_number        text NOT NULL,
  luggage            luggage_category NOT NULL DEFAULT 'none',
  fare_pesewas       integer NOT NULL,
  luggage_pesewas    integer NOT NULL,
  amount_pesewas     integer NOT NULL,
  status             payment_status NOT NULL DEFAULT 'pending',
  status_reason      text,
  provider           text NOT NULL,           -- 'paystack' or 'test'
  authorization_url  text,
  paid_at            timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX payments_user_idx ON payments (user_id);

CREATE TYPE booking_status AS ENUM ('confirmed', 'boarded', 'cancelled');

CREATE TABLE bookings (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id        uuid NOT NULL REFERENCES trips(id),
  user_id        uuid NOT NULL REFERENCES users(id),
  payment_id     uuid NOT NULL UNIQUE REFERENCES payments(id),
  seat_number    text NOT NULL,
  luggage        luggage_category NOT NULL DEFAULT 'none',
  qr_token       text NOT NULL UNIQUE,
  status         booking_status NOT NULL DEFAULT 'confirmed',
  boarded_at     timestamptz,
  boarded_by     uuid REFERENCES users(id),
  created_at     timestamptz NOT NULL DEFAULT now()
);
-- One active booking per trip and seat.
CREATE UNIQUE INDEX bookings_active_seat_unique
  ON bookings (trip_id, seat_number) WHERE status IN ('confirmed', 'boarded');

CREATE TABLE webhook_events (
  id           bigserial PRIMARY KEY,
  provider     text NOT NULL,
  event        text NOT NULL,
  reference    text,
  received_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_log (
  id          bigserial PRIMARY KEY,
  actor_id    uuid REFERENCES users(id),
  action      text NOT NULL,
  target      text,
  details     jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);
