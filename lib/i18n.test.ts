import assert from 'node:assert/strict'
import test from 'node:test'
import { locales, setContentOverrides, t } from './i18n'

test('localized UI fallbacks remain overridable by translated content', () => {
  assert.equal(t('fr', 'errors.checkout'), 'Le paiement n’a pas pu être lancé. Veuillez réessayer.')
  assert.equal(t('de', 'gallery.openPhoto', { index: 2 }), 'Foto 2 öffnen')
  for (const locale of locales) {
    assert.notEqual(t(locale, 'widgets.increase', { label: 'guests' }), 'widgets.increase')
    assert.notEqual(t(locale, 'widgets.decrease', { label: 'guests' }), 'widgets.decrease')
    assert.notEqual(t(locale, 'errors.guestLogin'), 'errors.guestLogin')
  }

  setContentOverrides('fr', { 'errors.checkout': 'Traduction personnalisée' })
  assert.equal(t('fr', 'errors.checkout'), 'Traduction personnalisée')
  setContentOverrides('fr', {})
})
