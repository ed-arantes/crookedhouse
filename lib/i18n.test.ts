import test from 'node:test'
import assert from 'node:assert/strict'
import { t, locales, getLocaleFromPathname } from './i18n'

test('translation returns the expected prefixed keys', () => {
 assert.equal(t('en', 'nav.home'), 'Home')
 assert.equal(t('it', 'about.headline'), 'Una casa caratteristica nel cuore del Lago di Como')
 assert.deepEqual(locales, ['it', 'en', 'fr', 'de', 'es'])
})

test('locale detection reads a prefixed path', () => {
 assert.equal(getLocaleFromPathname('/it/about'), 'it')
 assert.equal(getLocaleFromPathname('/fr'), 'fr')
 assert.equal(getLocaleFromPathname('/'), 'it')
})
