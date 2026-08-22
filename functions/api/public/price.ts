import { COUNCIL_TAX_PER_PERSON_PER_NIGHT, NIGHTLY_RATE } from '../../../lib/booking'
import { json, type AdminEnv } from '../../_lib/admin'

type PricingRule = {
  id: string
  name: string
  start_date: string
  end_date: string
  price_per_night: number
  min_nights: number
  priority: number
}

type PagesContext = {
  request: Request
  env: AdminEnv
}

function calculateNightlyPrice(rules: PricingRule[], dateStr: string): number {
  for (const rule of rules) {
    if (dateStr >= rule.start_date && dateStr <= rule.end_date) {
      return rule.price_per_night
    }
  }
  return NIGHTLY_RATE * 100
}

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const url = new URL(request.url)
  const checkIn = url.searchParams.get('check_in')
  const checkOut = url.searchParams.get('check_out')
  const guests = parseInt(url.searchParams.get('guests') || '2', 10)

  if (!checkIn || !checkOut || !/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) {
    return json({ error: 'Invalid dates' }, 400)
  }

  const start = new Date(`${checkIn}T00:00:00.000Z`)
  const end = new Date(`${checkOut}T00:00:00.000Z`)
  const nights = Math.round((end.getTime() - start.getTime()) / 86400000)

  if (nights <= 0) return json({ error: 'Invalid stay' }, 400)

  let rules: PricingRule[] = []
  try {
    const { results } = await (env.DB as any)
      .prepare('SELECT * FROM pricing_rules ORDER BY priority DESC, start_date')
      .all()
    rules = (results ?? []).map((r: any) => ({
      id: r.id,
      name: r.name ?? '',
      start_date: r.start_date,
      end_date: r.end_date,
      price_per_night: r.price_per_night,
      min_nights: r.min_nights ?? 1,
      priority: r.priority ?? 0,
    }))
  } catch { /* use fallback */ }

  let subtotalCents = 0
  const nightlyPrices: { date: string; price: number }[] = []
  let cursor = new Date(start)
  for (let i = 0; i < nights; i++) {
    const iso = cursor.toISOString().slice(0, 10)
    const nightlyPrice = calculateNightlyPrice(rules, iso)
    subtotalCents += nightlyPrice
    nightlyPrices.push({ date: iso, price: nightlyPrice / 100 })
    cursor.setDate(cursor.getDate() + 1)
  }

  const subtotal = subtotalCents / 100
  const councilTax = nights * guests * COUNCIL_TAX_PER_PERSON_PER_NIGHT

  return json({
    nights,
    subtotal,
    councilTax,
    total: subtotal + councilTax,
    nightlyPrices,
    averagePerNight: subtotal / nights,
  })
}
