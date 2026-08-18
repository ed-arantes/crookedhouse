import { json, kvGet, kvSet, requireAdmin, type AdminEnv } from '../../_lib/admin'

type BlockedDate = {
  date: string
  reason?: string
}

const BLOCKED_DATES_KEY = 'blocked_dates'

type PagesContext = {
  request: Request
  env: AdminEnv
  params?: Promise<Record<string, unknown>>
}

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const dates = await kvGet<BlockedDate[]>(env.KV, BLOCKED_DATES_KEY, [])
  return json(dates)
}

export const onRequestPost = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const body = await request.json().catch(() => null) as { dates?: string[]; reason?: string } | null
  if (!body?.dates?.length) {
    return json({ error: 'Missing dates' }, 400)
  }

  const existing = await kvGet<BlockedDate[]>(env.KV, BLOCKED_DATES_KEY, [])
  const existingSet = new Set(existing.map((d) => d.date))

  for (const date of body.dates) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return json({ error: `Invalid date format: ${date}` }, 400)
    }
    if (!existingSet.has(date)) {
      existing.push({ date, reason: body.reason })
    }
  }

  await kvSet(env.KV, BLOCKED_DATES_KEY, existing)
  return json(existing, 201)
}

export const onRequestDelete = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const url = new URL(request.url)
  const date = url.searchParams.get('date')
  if (!date) return json({ error: 'Missing date' }, 400)

  const existing = await kvGet<BlockedDate[]>(env.KV, BLOCKED_DATES_KEY, [])
  const filtered = existing.filter((d) => d.date !== date)
  if (filtered.length === existing.length) return json({ error: 'Date not found' }, 404)

  await kvSet(env.KV, BLOCKED_DATES_KEY, filtered)
  return json({ ok: true })
}
