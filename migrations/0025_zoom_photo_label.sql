INSERT INTO translations (locale, key, value) VALUES
  ('it', 'gallery.zoomPhoto', 'Ingrandisci foto'),
  ('en', 'gallery.zoomPhoto', 'Zoom photo'),
  ('fr', 'gallery.zoomPhoto', 'Agrandir la photo'),
  ('de', 'gallery.zoomPhoto', 'Foto vergrößern'),
  ('es', 'gallery.zoomPhoto', 'Ampliar foto'),
  ('ru', 'gallery.zoomPhoto', 'Увеличить фото')
ON CONFLICT(locale, key) DO UPDATE SET value = excluded.value;
