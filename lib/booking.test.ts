import assert from 'node:assert/strict'
import test from 'node:test'
import { formatDateLocal, formatLong, formatShort } from './booking'

test('formats calendar dates without shifting them across time zones', () => {
  assert.equal(formatDateLocal(new Date(2027, 11, 1)), '2027-12-01')
})

test('formats booking dates day-first in every locale', () => {
  const date = new Date(2027, 11, 1)
  assert.match(formatShort(date, 'en-US'), /^1 Dec/)
  assert.match(formatLong(date, 'en-US'), /^Wed 1 Dec 2027$/)
})
