import {
  json,
  requireAdmin,
  d1GetSetting,
  d1SetSetting,
  type AdminEnv,
} from '../../_lib/admin'

type PagesContext = {
  request: Request
  env: AdminEnv
}

// GET — fetch R2 base URL
export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const url = await d1GetSetting(env.DB, 'r2_base_url', '')
  return json({ url })
}

// POST — save R2 base URL
export const onRequestPost = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const body = await request.json().catch(() => null) as { url?: string } | null
  if (!body?.url) {
    return json({ error: 'Missing url' }, 400)
  }

  await d1SetSetting(env.DB, 'r2_base_url', body.url.replace(/\/+$/, ''))
  return json({ ok: true })
}
