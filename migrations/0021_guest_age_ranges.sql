INSERT INTO translations (locale, key, value) VALUES
  ('it', 'widgets.adultsHint', 'Dai 14 anni'),
  ('it', 'widgets.childrenHint', 'Età 0–13'),
  ('en', 'widgets.adultsHint', 'Ages 14 and up'),
  ('en', 'widgets.childrenHint', 'Ages 0–13'),
  ('fr', 'widgets.adultsHint', 'À partir de 14 ans'),
  ('fr', 'widgets.childrenHint', 'Âge : 0–13 ans'),
  ('de', 'widgets.adultsHint', 'Ab 14 Jahren'),
  ('de', 'widgets.childrenHint', 'Alter 0–13 Jahre'),
  ('es', 'widgets.adultsHint', 'A partir de 14 años'),
  ('es', 'widgets.childrenHint', 'De 0 a 13 años'),
  ('ru', 'widgets.adultsHint', 'С 14 лет'),
  ('ru', 'widgets.childrenHint', 'От 0 до 13 лет')
ON CONFLICT(locale, key) DO UPDATE SET value = excluded.value;
