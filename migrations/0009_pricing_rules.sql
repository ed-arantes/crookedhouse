CREATE TABLE IF NOT EXISTS pricing_rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  price_per_night INTEGER NOT NULL,
  min_nights INTEGER NOT NULL DEFAULT 1,
  priority INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_pricing_dates ON pricing_rules (start_date, end_date);
