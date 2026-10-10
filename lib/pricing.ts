export type PricingRule = {
  id: string
  name: string
  type: 'date_adjustment' | 'annual_adjustment' | 'nights_discount'
  start_date: string
  end_date: string
  adjustment_percent: number
  min_nights: number
  discount_percent: number
  priority: number
}

export type BookingPrice = {
  nights: number
  subtotal_before_discount: number
  discount_percent: number
  discount_amount: number
  subtotal: number
  nightly_prices: Array<{ date: string; price: number }>
}

export function getNightDiscount(rules: PricingRule[], nights: number): number {
  const eligible = rules.filter((rule) =>
    rule.type === 'nights_discount' && nights >= rule.min_nights,
  )
  if (eligible.length === 0) return 0
  const highestThreshold = Math.max(...eligible.map((rule) => rule.min_nights))
  return Math.max(...eligible
    .filter((rule) => rule.min_nights === highestThreshold)
    .map((rule) => rule.discount_percent))
}

export function calculateBookingPrice(
  checkIn: string,
  checkOut: string,
  baseFare: number,
  rules: PricingRule[],
): BookingPrice {
  const start = new Date(`${checkIn}T00:00:00.000Z`)
  const end = new Date(`${checkOut}T00:00:00.000Z`)
  const nights = Math.round((end.getTime() - start.getTime()) / 86400000)
  const nightlyPrices: BookingPrice['nightly_prices'] = []
  let subtotalCents = 0

  for (let index = 0; index < nights; index++) {
    const date = new Date(start)
    date.setUTCDate(date.getUTCDate() + index)
    const dateString = date.toISOString().slice(0, 10)
    const monthDay = dateString.slice(5)
    const adjustment = rules
      .filter((rule) => {
        if (rule.type === 'date_adjustment') {
          return dateString >= rule.start_date && dateString <= rule.end_date
        }
        if (rule.type !== 'annual_adjustment') return false
        return rule.start_date <= rule.end_date
          ? monthDay >= rule.start_date && monthDay <= rule.end_date
          : monthDay >= rule.start_date || monthDay <= rule.end_date
      })
      .reduce((sum, rule) => sum + rule.adjustment_percent, 0)
    const priceCents = Math.max(0, Math.round(baseFare * 100 * (1 + adjustment / 100)))
    subtotalCents += priceCents
    nightlyPrices.push({ date: dateString, price: priceCents / 100 })
  }

  const subtotalBeforeDiscount = subtotalCents / 100
  const discountPercent = getNightDiscount(rules, nights)
  const discountAmount = Math.round(subtotalCents * discountPercent / 100) / 100
  const subtotal = Math.max(0, subtotalBeforeDiscount - discountAmount)
  return {
    nights,
    subtotal_before_discount: subtotalBeforeDiscount,
    discount_percent: discountPercent,
    discount_amount: discountAmount,
    subtotal,
    nightly_prices: nightlyPrices,
  }
}

export function parseBaseFare(value: string): number | null {
  if (!value.trim()) return null
  const fare = Number(value)
  if (!Number.isFinite(fare) || fare < 0) {
    throw new Error('Configured base fare is invalid')
  }
  return fare
}
