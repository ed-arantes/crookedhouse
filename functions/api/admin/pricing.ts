import { json, requireAdmin, d1GetSetting, d1SetSetting, type AdminEnv } from '../../_lib/admin'
import { defaultBaseFare, type PricingRule } from '../../../lib/pricing'

const COUNCIL_TAX_KEY = 'council_tax_per_person_per_night'
const COUNCIL_TAX_DEFAULT = '2'
const BASE_FARE_KEY = 'base_fare_per_night'

type PagesContext = {
  request: Request
  env: AdminEnv
}

function database(env: AdminEnv) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return env.DB as any
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
    adjustment_percent: Number(row.adjustment_percent ?? 0),
    min_nights: Number(row.min_nights ?? 1),
    discount_percent: Number(row.discount_percent ?? 0),
    priority: Number(row.priority ?? 0),
  }))

  const councilTax = parseInt(await d1GetSetting(env.DB, COUNCIL_TAX_KEY, COUNCIL_TAX_DEFAULT), 10) || 2
  const baseFare = defaultBaseFare(Number(await d1GetSetting(env.DB, BASE_FARE_KEY, '95')))

  return json({ rules, council_tax_per_person_per_night: councilTax, base_fare_per_night: baseFare })
}

export const onRequestPost = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const body = await request.json().catch(() => null) as Omit<PricingRule, 'id'> | null
  if (!body || !['date_adjustment', 'nights_discount'].includes(body.type)) {
    return json({ error: 'Invalid pricing condition' }, 400)
  }
  if (body.type === 'date_adjustment' &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(body.start_date) || !/^\d{4}-\d{2}-\d{2}$/.test(body.end_date) ||
      body.end_date < body.start_date || !Number.isFinite(body.adjustment_percent) ||
      body.adjustment_percent < -100 || body.adjustment_percent > 1000)) {
    return json({ error: 'Invalid date adjustment condition' }, 400)
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
    0,
    body.adjustment_percent || 0,
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
    name?: string
    type?: PricingRule['type']
    start_date?: string
    end_date?: string
    adjustment_percent?: number
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

  if (!body?.id) {
    return json({ error: 'Missing id' }, 400)
  }

  if (!body.type || !['date_adjustment', 'nights_discount'].includes(body.type)) {
    return json({ error: 'Invalid pricing condition' }, 400)
  }
  if (body.type === 'date_adjustment' &&
    (!body.start_date || !body.end_date || !/^\d{4}-\d{2}-\d{2}$/.test(body.start_date) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(body.end_date) || body.end_date < body.start_date ||
      !Number.isFinite(body.adjustment_percent) || body.adjustment_percent! < -100 ||
      body.adjustment_percent! > 1000)) {
    return json({ error: 'Invalid date adjustment condition' }, 400)
  }
  if (body.type === 'nights_discount' &&
    (!Number.isInteger(body.min_nights) || body.min_nights! < 1 ||
      !Number.isFinite(body.discount_percent) || body.discount_percent! < 0 ||
      body.discount_percent! > 100)) {
    return json({ error: 'Invalid night discount condition' }, 400)
  }

  await database(env).prepare(
    'UPDATE pricing_rules SET name = ?, type = ?, start_date = ?, end_date = ?, price_per_night = 0, adjustment_percent = ?, min_nights = ?, discount_percent = ?, priority = ? WHERE id = ?'
  ).bind(
    body.name || '',
    body.type,
    body.start_date || '',
    body.end_date || '',
    body.adjustment_percent || 0,
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
