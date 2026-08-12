import test from 'node:test'
import assert from 'node:assert/strict'
import { buildMonthGrid, nightsBetween, priceBreakdown } from './booking'

test('calculates nights and price from a valid range', () => {
  const checkIn = new Date(2026, 7, 5)
  const checkOut = new Date(2026, 7, 8)
  assert.equal(nightsBetween(checkIn, checkOut), 3)
  assert.deepEqual(priceBreakdown(3, 2), {
    nights: 3,
    subtotal: 285,
    councilTax: 12,
    total: 297,
  })
})

test('does not produce negative nights', () => {
  assert.equal(nightsBetween(new Date(2026, 7, 8), new Date(2026, 7, 5)), 0)
})

test('builds a Monday-first calendar grid', () => {
  const grid = buildMonthGrid(2026, 7)
  assert.equal(grid[0], null)
  assert.equal(grid.find((day) => day?.getDate() === 1)?.getDate(), 1)
})
