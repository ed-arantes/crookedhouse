import { json, requireAdmin, d1GetSetting, d1SetSetting, type AdminEnv } from '../../_lib/admin'

const ICAL_URL_KEY = 'ical_url'

type PagesContext = { request: Request; env: AdminEnv }

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const url = await d1GetSetting(env.DB, ICAL_URL_KEY, '')
  return json({ url })
}

export const onRequestPost = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const body = await request.json().catch(() => null) as { url?: string } | null
  if (!body?.url) return json({ error: 'Missing url' }, 400)

  await d1SetSetting(env.DB, ICAL_URL_KEY, body.url)
  return json({ ok: true, url: body.url })
}
