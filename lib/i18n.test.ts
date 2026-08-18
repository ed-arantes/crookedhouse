import test from 'node:test'
import assert from 'node:assert/strict'
import { t, tArray, locales, getLocaleFromPathname, setContentOverrides, defaultLocale } from './i18n'

test('t() returns the key itself when no translations are loaded', () => {
  assert.equal(t('en', 'nav.apartment'), 'nav.apartment')
  assert.equal(t('it', 'about.headline'), 'about.headline')
})

test('t() returns loaded translations', () => {
  setContentOverrides('en', { 'nav.apartment': 'The apartment', 'hero.title': 'Crooked House' })
  assert.equal(t('en', 'nav.apartment'), 'The apartment')
  assert.equal(t('en', 'hero.title'), 'Crooked House')
})

test('t() falls back to default locale, then English', () => {
  setContentOverrides('it', { 'nav.apartment': "L'appartamento" })
  setContentOverrides('en', { 'nav.apartment': 'The apartment' })
  assert.equal(t('it', 'nav.apartment'), "L'appartamento")
  assert.equal(t('fr', 'nav.apartment'), "L'appartamento")
  assert.equal(t('de', 'nav.apartment'), "L'appartamento")
})

test('t() falls back to key when no locale matches', () => {
  setContentOverrides('it', {})
  setContentOverrides('en', {})
  assert.equal(t('es', 'missing.key'), 'missing.key')
})

test('t() replaces placeholders', () => {
  setContentOverrides('en', { 'hero.badge': '{score} · {count} reviews' })
  assert.equal(t('en', 'hero.badge', { score: '9.8', count: 42 }), '9.8 · 42 reviews')
})

test('tArray() returns arrays from loaded translations', () => {
  setContentOverrides('en', { 'amenities.list': ['Oven', 'Dishwasher'] })
  assert.deepEqual(tArray('en', 'amenities.list'), ['Oven', 'Dishwasher'])
})

test('tArray() returns empty array when key is missing', () => {
  setContentOverrides('en', {})
  assert.deepEqual(tArray('en', 'missing'), [])
})

test('locale detection reads a prefixed path', () => {
  assert.equal(getLocaleFromPathname('/it/about'), 'it')
  assert.equal(getLocaleFromPathname('/fr'), 'fr')
  assert.equal(getLocaleFromPathname('/'), 'it')
})

test('defaultLocale is it', () => {
  assert.equal(defaultLocale, 'it')
})

test('locales array contains all expected locales', () => {
  assert.deepEqual(locales, ['it', 'en', 'fr', 'de', 'es'])
})
