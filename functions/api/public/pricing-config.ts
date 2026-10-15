import { COUNCIL_TAX_PER_PERSON_PER_NIGHT } from '../../../lib/booking'
import { parseAnimalSurcharge, parseBaseFare, type PricingRule } from '../../../lib/pricing'
import { json, d1GetSetting, type AdminEnv } from '../../_lib/admin'

const COUNCIL_TAX_KEY = 'council_tax_per_person_per_night'
const ANIMAL_SURCHARGE_KEY = 'animal_surcharge'
const ANIMAL_SURCHARGE_ACTIVE_KEY = 'animal_surcharge_active'

type PagesContext = {
  env: AdminEnv
}

export const onRequestGet = async ({ env }: PagesContext): Promise<Response> => {
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
  const rules: PricingRule[] = ((results ?? []) as Array<Omit<PricingRule, 'type'> & { type: string }>).map((rule) => ({
    ...rule,
    type: (rule.type === 'date_range' ? 'date_adjustment' : rule.type) as PricingRule['type'],
    price_per_night: Number(rule.price_per_night ?? 0) / 100,
  }))
  const baseFare = parseBaseFare(baseFareSetting)
  if (baseFare === null) return json({ error: 'Base fare is not configured' }, 503)

  return json({
    rules,
    baseFare,
    councilTaxRate: parseInt(councilTaxSetting, 10) || COUNCIL_TAX_PER_PERSON_PER_NIGHT,
    animalSurcharge: parseAnimalSurcharge(animalSurchargeSetting),
    animalSurchargeActive: animalSurchargeActiveSetting === 'true',
  })
}
