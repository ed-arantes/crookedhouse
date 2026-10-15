import { COUNCIL_TAX_PER_PERSON_PER_NIGHT } from '../../../lib/booking'
import { calculateAnimalSurcharge, calculateBookingPrice, parseAnimalSurcharge, parseBaseFare, type PricingRule } from '../../../lib/pricing'
import { json, d1GetSetting, type AdminEnv } from '../../_lib/admin'

const COUNCIL_TAX_KEY = 'council_tax_per_person_per_night'
const ANIMAL_SURCHARGE_KEY = 'animal_surcharge'
const ANIMAL_SURCHARGE_ACTIVE_KEY = 'animal_surcharge_active'

type PagesContext = {
  request: Request
  env: AdminEnv
}

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const url = new URL(request.url)
  const checkIn = url.searchParams.get('check_in')
  const checkOut = url.searchParams.get('check_out')
  const adults = parseInt(url.searchParams.get('adults') || '2', 10)
  const hasAnimals = url.searchParams.get('pets') === 'true'

  if (!checkIn || !checkOut || !/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) {
    return json({ error: 'Invalid dates' }, 400)
  }

  const start = new Date(`${checkIn}T00:00:00.000Z`)
  const end = new Date(`${checkOut}T00:00:00.000Z`)
  const nights = Math.round((end.getTime() - start.getTime()) / 86400000)

  if (nights <= 0) return json({ error: 'Invalid stay' }, 400)

  const [pricingResult, baseFareSetting, councilTaxSetting, animalSurchargeSetting, animalSurchargeActiveSetting] =
    await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (env.DB as any)
        .prepare('SELECT id, name, type, start_date, end_date, price_per_night, min_nights, discount_percent, priority FROM pricing_rules ORDER BY priority DESC, start_date')
        .all(),
      d1GetSetting(env.DB, 'base_fare_per_night', ''),
      d1GetSetting(env.DB, COUNCIL_TAX_KEY, String(COUNCIL_TAX_PER_PERSON_PER_NIGHT)),
      d1GetSetting(env.DB, ANIMAL_SURCHARGE_KEY, '0'),
      d1GetSetting(env.DB, ANIMAL_SURCHARGE_ACTIVE_KEY, 'false'),
    ])
  const { results } = pricingResult
  const rules = ((results ?? []) as Array<Omit<PricingRule, 'type'> & { type: string }>).map((rule) => ({
    ...rule,
    type: (rule.type === 'date_range' ? 'date_adjustment' : rule.type) as PricingRule['type'],
    price_per_night: Number(rule.price_per_night ?? 0) / 100,
  }))
  const baseFare = parseBaseFare(baseFareSetting)
  if (baseFare === null) return json({ error: 'Base fare is not configured' }, 503)
  const price = calculateBookingPrice(checkIn, checkOut, baseFare, rules)
  const councilTaxRate = parseInt(councilTaxSetting, 10) || COUNCIL_TAX_PER_PERSON_PER_NIGHT
  const councilTax = nights * adults * councilTaxRate
  const animalSurchargeAmount = parseAnimalSurcharge(animalSurchargeSetting)
  const animalSurchargeActive = animalSurchargeActiveSetting === 'true'
  const animalSurcharge = calculateAnimalSurcharge(animalSurchargeAmount, animalSurchargeActive, hasAnimals)

  return json({
    nights,
    subtotal: price.subtotal,
    subtotalBeforeDiscount: price.subtotal_before_discount,
    discountPercent: price.discount_percent,
    discountAmount: price.discount_amount,
    councilTax,
    animalSurcharge,
    total: price.subtotal + councilTax + animalSurcharge,
    nightlyPrices: price.nightly_prices,
    averagePerNight: price.subtotal / nights,
  })
}
