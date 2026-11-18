-- Luggage top-ups: a payment can now buy extra luggage for an existing booking.
ALTER TABLE payments ADD COLUMN kind text NOT NULL DEFAULT 'booking' CHECK (kind IN ('booking', 'luggage_topup'));
ALTER TABLE payments ADD COLUMN booking_id uuid REFERENCES bookings(id);
CREATE INDEX payments_booking_idx ON payments (booking_id);
