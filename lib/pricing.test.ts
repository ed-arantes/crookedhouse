import assert from 'node:assert/strict'
import test from 'node:test'
import {
  calculateAnimalSurcharge,
  calculateBookingPrice,
  parseAnimalSurcharge,
  parseBaseFare,
  type PricingRule,
} from './pricing'

function rule(overrides: Partial<PricingRule>): PricingRule {
  return {
    id: 'rule',
    name: '',
    type: 'date_adjustment',
    start_date: '',
    end_date: '',
    price_per_night: 0,
    min_nights: 1,
    discount_percent: 0,
    priority: 0,
    ...overrides,
  }
}

test('more specific date prices override broader date prices before duration discount', () => {
  const rules = [
    rule({ id: 'december', start_date: '2026-12-01', end_date: '2026-12-31', price_per_night: 150 }),
    rule({ id: 'holiday', start_date: '2026-12-24', end_date: '2026-12-26', price_per_night: 170 }),
    rule({ id: 'five-night', type: 'nights_discount', min_nights: 5, discount_percent: 10 }),
    rule({ id: 'ten-night', type: 'nights_discount', min_nights: 10, discount_percent: 15 }),
  ]

  const price = calculateBookingPrice('2026-12-23', '2026-12-28', 100, rules)

  assert.deepEqual(price.nightly_prices.map((night) => night.price), [150, 170, 170, 170, 150])
  assert.equal(price.subtotal_before_discount, 810)
  assert.equal(price.discount_percent, 10)
  assert.equal(price.discount_amount, 81)
  assert.equal(price.subtotal, 729)
})

test('uses the discount with the highest qualifying night threshold for the entire stay', () => {
  const rules = [
    rule({ id: 'five-night', type: 'nights_discount', min_nights: 5, discount_percent: 20 }),
    rule({ id: 'ten-night', type: 'nights_discount', min_nights: 10, discount_percent: 12 }),
  ]

  const price = calculateBookingPrice('2026-01-01', '2026-01-11', 100, rules)

  assert.equal(price.discount_percent, 12)
  assert.equal(price.subtotal, 880)
})

test('applies annual date adjustments regardless of year', () => {
  const price = calculateBookingPrice('2027-12-30', '2028-01-03', 100, [
    rule({
      type: 'annual_adjustment',
      start_date: '12-31',
      end_date: '01-01',
      price_per_night: 120,
    }),
  ])

  assert.deepEqual(price.nightly_prices.map((night) => night.price), [100, 120, 120, 100])
})

test('applies the recurring increase on the first day of an inclusive date range', () => {
  const price = calculateBookingPrice('2027-12-01', '2027-12-02', 100, [
    rule({
      type: 'annual_adjustment',
      start_date: '12-01',
      end_date: '12-31',
      price_per_night: 110,
    }),
  ])

  assert.deepEqual(price.nightly_prices, [{ date: '2027-12-01', price: 110 }])
  assert.equal(price.subtotal, 110)
})

test('applies annual date adjustments within the same calendar year', () => {
  const price = calculateBookingPrice('2028-05-30', '2028-06-03', 100, [
    rule({
      type: 'annual_adjustment',
      start_date: '06-01',
      end_date: '06-02',
      price_per_night: 90,
    }),
  ])

  assert.deepEqual(price.nightly_prices.map((night) => night.price), [100, 100, 90, 90])
})

test('counts annual date ranges across the New Year boundary without overestimating their length', () => {
  const price = calculateBookingPrice('2027-12-31', '2028-01-03', 100, [
    rule({
      type: 'annual_adjustment',
      start_date: '12-31',
      end_date: '01-02',
      price_per_night: 120,
    }),
  ])

  assert.deepEqual(price.nightly_prices.map((night) => night.price), [120, 120, 120])
})

test('handles zero-night and invalid date ranges without returning negative prices', () => {
  const empty = calculateBookingPrice('2026-01-02', '2026-01-02', 100, [])
  assert.deepEqual(empty, {
    nights: 0,
    subtotal_before_discount: 0,
    discount_percent: 0,
    discount_amount: 0,
    subtotal: 0,
    nightly_prices: [],
  })
  assert.deepEqual(calculateBookingPrice('invalid', '2026-01-03', 100, []), {
    nights: 0,
    subtotal_before_discount: 0,
    discount_percent: 0,
    discount_amount: 0,
    subtotal: 0,
    nightly_prices: [],
  })
})

test('uses the higher-priority price when matching date ranges have equal specificity', () => {
  const price = calculateBookingPrice('2026-01-01', '2026-01-02', 100, [
    rule({
      id: 'lower-priority',
      start_date: '2026-01-01',
      end_date: '2026-01-01',
      price_per_night: 80,
      priority: 1,
    }),
    rule({
      id: 'higher-priority',
      start_date: '2026-01-01',
      end_date: '2026-01-01',
      price_per_night: 90,
      priority: 2,
    }),
  ])

  assert.equal(price.nightly_prices[0].price, 90)
  assert.equal(price.subtotal, 90)
})

test('rounds fixed nightly prices to whole currency units', () => {
  const price = calculateBookingPrice('2026-01-01', '2026-01-02', 100, [
    rule({
      start_date: '2026-01-01',
      end_date: '2026-01-01',
      price_per_night: 110.5,
    }),
  ])

  assert.equal(price.nightly_prices[0].price, 111)
})

test('requires a configured base fare instead of falling back to a hardcoded rate', () => {
  assert.equal(parseBaseFare(''), null)
  assert.equal(parseBaseFare('125.50'), 125.5)
  assert.throws(() => parseBaseFare('-1'), /base fare is invalid/i)
})

test('charges the fixed animal surcharge only when enabled and animals are selected', () => {
  const amount = parseAnimalSurcharge('10.005')
  assert.equal(amount, 10.01)
  assert.equal(calculateAnimalSurcharge(amount, true, true), 10.01)
  assert.equal(calculateAnimalSurcharge(amount, false, true), 0)
  assert.equal(calculateAnimalSurcharge(amount, true, false), 0)
  assert.throws(() => parseAnimalSurcharge('-1'), /animal surcharge is invalid/i)
})
