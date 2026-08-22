import { json, requireAdmin, type AdminEnv } from '../../_lib/admin'

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

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const { results } = await (env.DB as any)
    .prepare('SELECT * FROM pricing_rules ORDER BY start_date, priority DESC')
    .all()

  const rules: PricingRule[] = (results ?? []).map((r: any) => ({
    id: r.id,
    name: r.name ?? '',
    start_date: r.start_date,
    end_date: r.end_date,
    price_per_night: r.price_per_night,
    min_nights: r.min_nights ?? 1,
    priority: r.priority ?? 0,
  }))

  return json(rules)
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
    'INSERT INTO pricing_rules (id, name, start_date, end_date, price_per_night, min_nights, priority) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    id,
    body.name || '',
    body.start_date,
    body.end_date,
    body.price_per_night,
    body.min_nights || 1,
    body.priority || 0,
  ).run()

  return json({ id, ...body, min_nights: body.min_nights || 1, priority: body.priority || 0 })
}

export const onRequestPut = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const body = await request.json().catch(() => null) as PricingRule | null
  if (!body?.id) {
    return json({ error: 'Missing id' }, 400)
  }

  await (env.DB as any).prepare(
    'UPDATE pricing_rules SET name = ?, start_date = ?, end_date = ?, price_per_night = ?, min_nights = ?, priority = ? WHERE id = ?'
  ).bind(
    body.name || '',
    body.start_date,
    body.end_date,
    body.price_per_night,
    body.min_nights || 1,
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

  await (env.DB as any).prepare('DELETE FROM pricing_rules WHERE id = ?').bind(id).run()

  return json({ ok: true })
}
