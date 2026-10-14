INSERT INTO translations (locale, key, value) VALUES
  ('it', 'widgets.reserve', 'Controlla disponibilità'),
  ('en', 'widgets.reserve', 'Check availability'),
  ('fr', 'widgets.reserve', 'Vérifier les disponibilités'),
  ('de', 'widgets.reserve', 'Verfügbarkeit prüfen'),
  ('es', 'widgets.reserve', 'Consultar disponibilidad'),
  ('ru', 'widgets.reserve', 'Проверить доступность')
ON CONFLICT(locale, key) DO UPDATE SET value = excluded.value;
