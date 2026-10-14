INSERT INTO translations (locale, key, value) VALUES
  ('it', 'widgets.reserve', 'Cerca'),
  ('en', 'widgets.reserve', 'Search'),
  ('fr', 'widgets.reserve', 'Rechercher'),
  ('de', 'widgets.reserve', 'Suchen'),
  ('es', 'widgets.reserve', 'Buscar'),
  ('ru', 'widgets.reserve', 'Искать')
ON CONFLICT(locale, key) DO UPDATE SET value = excluded.value;
