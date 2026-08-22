import { json, requireAdmin, d1GetSetting, d1SetSetting, type AdminEnv } from '../../_lib/admin'

const COUNCIL_TAX_KEY = 'council_tax_per_person_per_night'
const COUNCIL_TAX_DEFAULT = '2'

type PricingRule = {
  id: string
  name: string
  type: 'date_range' | 'nights_discount'
  start_date: string
  end_date: string
  price_per_night: number
  min_nights: number
  discount_percent: number
  priority: number
}

type PagesContext = {
  request: Request
  env: AdminEnv
}

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const { results } = await (env.DB as any)
    .prepare('SELECT * FROM pricing_rules ORDER BY start_date, priority DESC')
    .all()

  const rules: PricingRule[] = (results ?? []).map((r: any) => ({
    id: r.id,
    name: r.name ?? '',
    type: r.type ?? 'date_range',
    start_date: r.start_date ?? '',
    end_date: r.end_date ?? '',
    price_per_night: r.price_per_night ?? 0,
    min_nights: r.min_nights ?? 1,
    discount_percent: r.discount_percent ?? 0,
    priority: r.priority ?? 0,
  }))

  const councilTax = parseInt(await d1GetSetting(env.DB, COUNCIL_TAX_KEY, COUNCIL_TAX_DEFAULT), 10) || 2

  return json({ rules, council_tax_per_person_per_night: councilTax })
}

export const onRequestPost = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const body = await request.json().catch(() => null) as Omit<PricingRule, 'id'> | null
  if (!body?.start_date || !body?.end_date || !body?.price_per_night) {
    return json({ error: 'Missing required fields' }, 400)
  }

  const id = crypto.randomUUID()
  await (env.DB as any).prepare(
    'INSERT INTO pricing_rules (id, name, type, start_date, end_date, price_per_night, min_nights, discount_percent, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    id,
    body.name || '',
    body.type || 'date_range',
    body.start_date || '',
    body.end_date || '',
    body.price_per_night || 0,
    body.min_nights || 1,
    body.discount_percent || 0,
    body.priority || 0,
  ).run()

  return json({ id, ...body, type: body.type || 'date_range', min_nights: body.min_nights || 1, discount_percent: body.discount_percent || 0, priority: body.priority || 0 })
}

export const onRequestPut = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const body = await request.json().catch(() => null) as { id?: string; council_tax?: number } | null

  if (body?.council_tax !== undefined) {
    await d1SetSetting(env.DB, COUNCIL_TAX_KEY, String(body.council_tax))
    return json({ ok: true })
  }

  if (!body?.id) {
    return json({ error: 'Missing id' }, 400)
  }

  const rule = body as PricingRule
  await (env.DB as any).prepare(
    'UPDATE pricing_rules SET name = ?, type = ?, start_date = ?, end_date = ?, price_per_night = ?, min_nights = ?, discount_percent = ?, priority = ? WHERE id = ?'
  ).bind(
    rule.name || '',
    rule.type || 'date_range',
    rule.start_date || '',
    rule.end_date || '',
    rule.price_per_night || 0,
    rule.min_nights || 1,
    rule.discount_percent || 0,
    rule.priority || 0,
    rule.id,
  ).run()

  return json({ ok: true })
}

export const onRequestDelete = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return json({ error: 'Missing id' }, 400)

  await (env.DB as any).prepare('DELETE FROM pricing_rules WHERE id = ?').bind(id).run()

  return json({ ok: true })
}
