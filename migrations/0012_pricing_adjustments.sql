ALTER TABLE pricing_rules ADD COLUMN adjustment_percent REAL NOT NULL DEFAULT 0;

UPDATE pricing_rules
SET adjustment_percent = ROUND(((price_per_night - 9500) * 100.0) / 9500, 2),
    type = 'date_adjustment'
WHERE type = 'date_range';

INSERT INTO settings (key, value)
VALUES ('base_fare_per_night', '95')
ON CONFLICT(key) DO NOTHING;
