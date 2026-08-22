CREATE TABLE IF NOT EXISTS pricing_rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'date_range',
  start_date TEXT NOT NULL DEFAULT '',
  end_date TEXT NOT NULL DEFAULT '',
  price_per_night INTEGER NOT NULL DEFAULT 0,
  min_nights INTEGER NOT NULL DEFAULT 1,
  discount_percent INTEGER NOT NULL DEFAULT 0,
  priority INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_pricing_dates ON pricing_rules (start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_pricing_type ON pricing_rules (type);
