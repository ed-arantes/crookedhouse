UPDATE pricing_rules
SET price_per_night = ROUND(
  CASE
    WHEN price_per_night = 0 THEN MAX(
      0,
      ROUND(
        CAST((SELECT value FROM settings WHERE key = 'base_fare_per_night') AS REAL)
        * (100 + adjustment_percent)
      )
    )
    ELSE price_per_night
  END / 100.0
) * 100
WHERE type IN ('date_adjustment', 'annual_adjustment');
