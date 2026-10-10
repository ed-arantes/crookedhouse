ALTER TABLE bookings ADD COLUMN paid_amount REAL NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN credit_amount REAL NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN payment_requested_at TEXT;

UPDATE bookings
SET paid_amount = total_price
WHERE status = 'paid' AND paid_amount = 0;
