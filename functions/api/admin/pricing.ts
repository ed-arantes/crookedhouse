import { json, requireAdmin, d1GetSetting, d1SetSetting, type AdminEnv } from '../../_lib/admin'
import { parseAnimalSurcharge, parseBaseFare, type PricingRule } from '../../../lib/pricing'

const COUNCIL_TAX_KEY = 'council_tax_per_person_per_night'
const COUNCIL_TAX_DEFAULT = '2'
const BASE_FARE_KEY = 'base_fare_per_night'
const ANIMAL_SURCHARGE_KEY = 'animal_surcharge'
const ANIMAL_SURCHARGE_ACTIVE_KEY = 'animal_surcharge_active'

type PagesContext = {
  request: Request
  env: AdminEnv
}

function database(env: AdminEnv) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return env.DB as any
}

function isValidMonthDay(value: string): boolean {
  if (!/^\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`2000-${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(5, 10) === value
}

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const { results } = await database(env)
    .prepare('SELECT * FROM pricing_rules ORDER BY start_date, priority DESC')
    .all()

  const rules: PricingRule[] = ((results ?? []) as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    type: (row.type === 'date_range' ? 'date_adjustment' : row.type ?? 'date_adjustment') as PricingRule['type'],
    start_date: String(row.start_date ?? ''),
    end_date: String(row.end_date ?? ''),
    price_per_night: Number(row.price_per_night ?? 0) / 100,
    min_nights: Number(row.min_nights ?? 1),
    discount_percent: Number(row.discount_percent ?? 0),
    priority: Number(row.priority ?? 0),
  }))

  const councilTax = parseInt(await d1GetSetting(env.DB, COUNCIL_TAX_KEY, COUNCIL_TAX_DEFAULT), 10) || 2
  const baseFare = parseBaseFare(await d1GetSetting(env.DB, BASE_FARE_KEY, ''))
  const animalSurcharge = parseAnimalSurcharge(await d1GetSetting(env.DB, ANIMAL_SURCHARGE_KEY, '0'))
  const animalSurchargeActive = (await d1GetSetting(env.DB, ANIMAL_SURCHARGE_ACTIVE_KEY, 'false')) === 'true'

  return json({
    rules,
    council_tax_per_person_per_night: councilTax,
    base_fare_per_night: baseFare,
    animal_surcharge: animalSurcharge,
    animal_surcharge_active: animalSurchargeActive,
  })
}

export const onRequestPost = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const body = await request.json().catch(() => null) as Omit<PricingRule, 'id'> | null
  if (!body || !['date_adjustment', 'annual_adjustment', 'nights_discount'].includes(body.type)) {
    return json({ error: 'Invalid pricing condition' }, 400)
  }
  if (body.type === 'date_adjustment' &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(body.start_date) || !/^\d{4}-\d{2}-\d{2}$/.test(body.end_date) ||
      body.end_date < body.start_date || !Number.isInteger(body.price_per_night) ||
      body.price_per_night < 0 || body.price_per_night > 100000)) {
    return json({ error: 'Invalid date adjustment condition' }, 400)
  }
  if (body.type === 'annual_adjustment' &&
    (!isValidMonthDay(body.start_date) || !isValidMonthDay(body.end_date) ||
      !Number.isInteger(body.price_per_night) || body.price_per_night < 0 ||
      body.price_per_night > 100000)) {
    return json({ error: 'Invalid recurring date adjustment condition' }, 400)
  }
  if (body.type === 'nights_discount' &&
    (!Number.isInteger(body.min_nights) || body.min_nights < 1 ||
      !Number.isFinite(body.discount_percent) || body.discount_percent < 0 || body.discount_percent > 100)) {
    return json({ error: 'Invalid night discount condition' }, 400)
  }

  const id = crypto.randomUUID()
  await database(env).prepare(
    'INSERT INTO pricing_rules (id, name, type, start_date, end_date, price_per_night, adjustment_percent, min_nights, discount_percent, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    id,
    body.name || '',
    body.type,
    body.start_date || '',
    body.end_date || '',
    Math.round((body.price_per_night || 0) * 100),
    0,
    body.min_nights || 1,
    body.discount_percent || 0,
    body.priority || 0,
  ).run()

  return json({ id, ...body, min_nights: body.min_nights || 1, discount_percent: body.discount_percent || 0, priority: body.priority || 0 })
}

export const onRequestPut = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const body = await request.json().catch(() => null) as {
    id?: string
    council_tax?: number
    base_fare?: number
    animal_surcharge?: number
    animal_surcharge_active?: boolean
    name?: string
    type?: PricingRule['type']
    start_date?: string
    end_date?: string
    price_per_night?: number
    min_nights?: number
    discount_percent?: number
    priority?: number
  } | null

  if (body?.council_tax !== undefined) {
    if (!Number.isFinite(body.council_tax) || body.council_tax < 0 || body.council_tax > 1000) {
      return json({ error: 'Invalid council tax amount' }, 400)
    }
    await d1SetSetting(env.DB, COUNCIL_TAX_KEY, String(body.council_tax))
    return json({ ok: true })
  }

  if (body?.base_fare !== undefined) {
    if (!Number.isFinite(body.base_fare) || body.base_fare < 0 || body.base_fare > 100000) {
      return json({ error: 'Invalid base fare' }, 400)
    }
    await d1SetSetting(env.DB, BASE_FARE_KEY, String(body.base_fare))
    return json({ ok: true })
  }

  if (body?.animal_surcharge !== undefined || body?.animal_surcharge_active !== undefined) {
    if (body.animal_surcharge === undefined || typeof body.animal_surcharge_active !== 'boolean' ||
      !Number.isFinite(body.animal_surcharge) || body.animal_surcharge < 0 ||
      body.animal_surcharge > 100000) {
      return json({ error: 'Invalid animal surcharge' }, 400)
    }
    const amount = Math.round(body.animal_surcharge * 100) / 100
    if (body.animal_surcharge_active) {
      await d1SetSetting(env.DB, ANIMAL_SURCHARGE_KEY, String(amount))
      await d1SetSetting(env.DB, ANIMAL_SURCHARGE_ACTIVE_KEY, 'true')
    } else {
      await d1SetSetting(env.DB, ANIMAL_SURCHARGE_ACTIVE_KEY, 'false')
      await d1SetSetting(env.DB, ANIMAL_SURCHARGE_KEY, String(amount))
    }
    return json({ ok: true })
  }

  if (!body?.id) {
    return json({ error: 'Missing id' }, 400)
  }

  if (!body.type || !['date_adjustment', 'annual_adjustment', 'nights_discount'].includes(body.type)) {
    return json({ error: 'Invalid pricing condition' }, 400)
  }
  if (body.type === 'date_adjustment' &&
    (!body.start_date || !body.end_date || !/^\d{4}-\d{2}-\d{2}$/.test(body.start_date) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(body.end_date) || body.end_date < body.start_date ||
      !Number.isInteger(body.price_per_night) || body.price_per_night! < 0 ||
      body.price_per_night! > 100000)) {
    return json({ error: 'Invalid date adjustment condition' }, 400)
  }
  if (body.type === 'annual_adjustment' &&
    (!body.start_date || !body.end_date || !isValidMonthDay(body.start_date) ||
      !isValidMonthDay(body.end_date) || !Number.isInteger(body.price_per_night) ||
      body.price_per_night! < 0 || body.price_per_night! > 100000)) {
    return json({ error: 'Invalid recurring date adjustment condition' }, 400)
  }
  if (body.type === 'nights_discount' &&
    (!Number.isInteger(body.min_nights) || body.min_nights! < 1 ||
      !Number.isFinite(body.discount_percent) || body.discount_percent! < 0 ||
      body.discount_percent! > 100)) {
    return json({ error: 'Invalid night discount condition' }, 400)
  }

  await database(env).prepare(
    'UPDATE pricing_rules SET name = ?, type = ?, start_date = ?, end_date = ?, price_per_night = ?, adjustment_percent = 0, min_nights = ?, discount_percent = ?, priority = ? WHERE id = ?'
  ).bind(
    body.name || '',
    body.type,
    body.start_date || '',
    body.end_date || '',
    Math.round((body.price_per_night || 0) * 100),
    body.min_nights || 1,
    body.discount_percent || 0,
    body.priority || 0,
    body.id,
  ).run()

  return json({ ok: true })
}

export const onRequestDelete = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return json({ error: 'Missing id' }, 400)

  await database(env).prepare('DELETE FROM pricing_rules WHERE id = ?').bind(id).run()

  return json({ ok: true })
}
