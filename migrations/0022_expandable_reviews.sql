INSERT INTO translations (locale, key, value) VALUES
  ('it', 'reviews.readMore', 'Leggi tutto'),
  ('it', 'reviews.readLess', 'Mostra meno'),
  ('en', 'reviews.readMore', 'Read more'),
  ('en', 'reviews.readLess', 'Show less'),
  ('fr', 'reviews.readMore', 'Lire la suite'),
  ('fr', 'reviews.readLess', 'Réduire'),
  ('de', 'reviews.readMore', 'Mehr anzeigen'),
  ('de', 'reviews.readLess', 'Weniger anzeigen'),
  ('es', 'reviews.readMore', 'Leer más'),
  ('es', 'reviews.readLess', 'Mostrar menos'),
  ('ru', 'reviews.readMore', 'Читать далее'),
  ('ru', 'reviews.readLess', 'Свернуть')
ON CONFLICT(locale, key) DO UPDATE SET value = excluded.value;
