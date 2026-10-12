INSERT INTO translations (locale, key, value) VALUES
  ('it', 'widgets.animalSurcharge', 'Supplemento animali'),
  ('en', 'widgets.animalSurcharge', 'Pet surcharge'),
  ('fr', 'widgets.animalSurcharge', 'Supplément pour animaux'),
  ('de', 'widgets.animalSurcharge', 'Haustierzuschlag'),
  ('es', 'widgets.animalSurcharge', 'Suplemento por mascotas'),
  ('ru', 'widgets.animalSurcharge', 'Доплата за питомцев')
ON CONFLICT(locale, key) DO UPDATE SET value = excluded.value;
