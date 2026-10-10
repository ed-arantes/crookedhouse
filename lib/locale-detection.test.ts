import assert from 'node:assert/strict'
import test from 'node:test'
import { onRequest } from '../functions/_middleware'
import {
  getLocaleForCountry,
  getLocaleFromAcceptLanguage,
  getLocalePreference,
} from './locale-detection'

test('chooses the corresponding language for supported-language countries', () => {
  assert.equal(getLocaleForCountry('IT', 'en-US,en;q=0.9'), 'it')
  assert.equal(getLocaleForCountry('ES', 'fr-FR,fr;q=0.9'), 'es')
  assert.equal(getLocaleForCountry('FR', 'en-US,en;q=0.9'), 'fr')
  assert.equal(getLocaleForCountry('DE', 'en-US,en;q=0.9'), 'de')
  assert.equal(getLocaleForCountry('RU', 'en-US,en;q=0.9'), 'ru')
})

test('uses browser language among a country’s supported official languages', () => {
  assert.equal(getLocaleForCountry('CH', 'it-CH,it;q=0.9,de;q=0.8'), 'it')
  assert.equal(getLocaleForCountry('CA', 'fr-CA,fr;q=0.9,en;q=0.8'), 'fr')
  assert.equal(getLocaleForCountry('CA', 'en-CA,en;q=0.9,fr;q=0.8'), 'en')
})

test('uses the browser language without geolocation and English as the default', () => {
  assert.equal(getLocaleForCountry(undefined, 'es-ES,es;q=0.9,en;q=0.8'), 'es')
  assert.equal(getLocaleFromAcceptLanguage('ru-RU,ru;q=0.9,en;q=0.8'), 'ru')
  assert.equal(getLocaleForCountry('US', 'fr-FR,fr;q=0.9'), 'en')
  assert.equal(getLocaleFromAcceptLanguage('nl-NL,nl;q=0.9'), 'en')
})

test('ignores zero-quality language preferences', () => {
  assert.equal(getLocaleFromAcceptLanguage('fr;q=0,en;q=0.8,de;q=0.5'), 'en')
})

test('accepts only a supported saved language preference', () => {
  assert.equal(getLocalePreference('theme=dark; crookedhouse_locale=fr'), 'fr')
  assert.equal(getLocalePreference('crookedhouse_locale=xx'), null)
  assert.equal(getLocalePreference(null), null)
})

test('redirects unlocalized pages using Cloudflare country and preserves the query', async () => {
  const request = Object.assign(new Request('https://crookedhouse.it/?source=ad'), {
    cf: { country: 'IT' },
  })
  const response = await onRequest({ request, next: async () => new Response('served') })
  assert.equal(response.status, 307)
  assert.equal(response.headers.get('Location'), 'https://crookedhouse.it/it?source=ad')
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store')
})

test('respects the saved locale and localizes the unprefixed services page', async () => {
  const request = Object.assign(new Request('https://crookedhouse.it/servizi?source=ad', {
    headers: { Cookie: 'crookedhouse_locale=fr' },
  }), { cf: { country: 'IT' } })
  const response = await onRequest({ request, next: async () => new Response('served') })
  assert.equal(response.headers.get('Location'), 'https://crookedhouse.it/fr/servizi?source=ad')
})

test('does not redirect explicit locales or unrelated routes', async () => {
  let nextCalls = 0
  const next = async () => {
    nextCalls++
    return new Response('served')
  }
  const localeRequest = new Request('https://crookedhouse.it/es')
  const adminRequest = new Request('https://crookedhouse.it/admin')

  assert.equal((await onRequest({ request: localeRequest, next })).status, 200)
  assert.equal((await onRequest({ request: adminRequest, next })).status, 200)
  assert.equal(nextCalls, 2)
})
