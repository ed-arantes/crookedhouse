import assert from 'node:assert/strict'
import test from 'node:test'
import { formatDateTimeEU, formatEU, parseEUDate } from './format-date'

test('formats date-only and date-time values in European order', () => {
  assert.equal(formatEU('2026-10-11'), '11/10/2026')
  assert.equal(formatDateTimeEU('2026-10-11T00:26:19.789Z'), '11/10/2026 00:26')
})

test('parses valid European date input and rejects invalid dates', () => {
  assert.equal(parseEUDate('01/12/2026'), '2026-12-01')
  assert.equal(parseEUDate('31/02/2026'), null)
  assert.equal(parseEUDate('2026-12-01'), null)
})
