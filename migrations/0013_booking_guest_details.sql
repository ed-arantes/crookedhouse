CREATE TABLE IF NOT EXISTS booking_guest_details (
  booking_id TEXT PRIMARY KEY REFERENCES bookings(id) ON DELETE CASCADE,
  details_encrypted TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
