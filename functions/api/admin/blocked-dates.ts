import { json, requireAdmin, d1ListBlockedDates, d1AddBlockedDates, d1DeleteBlockedDate, type AdminEnv } from '../../_lib/admin'

type PagesContext = {
  request: Request
  env: AdminEnv
  params?: Promise<Record<string, unknown>>
}

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const dates = await d1ListBlockedDates(env.DB)
  return json(dates)
}

export const onRequestPost = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const body = await request.json().catch(() => null) as { dates?: string[]; reason?: string } | null
  if (!body?.dates?.length) {
    return json({ error: 'Missing dates' }, 400)
  }

  for (const date of body.dates) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return json({ error: `Invalid date format: ${date}` }, 400)
    }
  }

  await d1AddBlockedDates(env.DB, body.dates.map((date) => ({ date, reason: body.reason })))
  const all = await d1ListBlockedDates(env.DB)
  return json(all, 201)
}

export const onRequestDelete = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const url = new URL(request.url)
  const date = url.searchParams.get('date')
  if (!date) return json({ error: 'Missing date' }, 400)

  const deleted = await d1DeleteBlockedDate(env.DB, date)
  if (!deleted) return json({ error: 'Date not found' }, 404)

  return json({ ok: true })
}
