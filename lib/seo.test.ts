import assert from 'node:assert/strict'
import test from 'node:test'
import { getHomeMetadata, getLocalizedPageMetadata } from './seo'
import { locales, t, tArray } from './i18n'

test('home metadata is localized and exposes canonical locale alternates', () => {
  for (const locale of locales) {
    const metadata = getHomeMetadata(locale)
    const canonical = locale === 'it' ? '/' : `/${locale}`

    assert.equal(metadata.alternates?.canonical, canonical)
    assert.equal(metadata.alternates?.languages?.[locale], canonical)
    assert.equal(typeof metadata.description, 'string')
    assert.ok(metadata.openGraph)
    assert.ok(metadata.twitter)
  }
})

test('localized content pages use their language-specific canonical routes', () => {
  for (const locale of locales) {
    const metadata = getLocalizedPageMetadata(locale, 'services')
    const canonical = locale === 'it' ? '/servizi' : `/${locale}/servizi`

    assert.equal(metadata.alternates?.canonical, canonical)
    assert.equal(metadata.alternates?.languages?.[locale], canonical)
  }
})

test('localized homepage content is available for server rendering before API overrides load', () => {
  for (const locale of locales) {
    assert.notEqual(t(locale, 'about.headline'), 'about.headline')
  }

  assert.ok(tArray('en', 'amenities.list').length > 0)
})
