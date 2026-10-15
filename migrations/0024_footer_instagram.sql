INSERT INTO translations (locale, key, value) VALUES ('it', 'footer.instagramUrl', '')
ON CONFLICT(locale, key) DO NOTHING;
