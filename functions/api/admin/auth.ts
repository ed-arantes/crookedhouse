import { json, type AdminEnv } from '../../_lib/admin'

type PagesContext = { request: Request; env: AdminEnv }

export const onRequestPost = async ({ request, env }: PagesContext): Promise<Response> => {
  const password = env.ADMIN_PASSWORD
  if (!password) return json({ error: 'Admin not configured' }, 500)

  const body = await request.json().catch(() => null) as { password?: string }
  if (!body?.password || body.password !== password) {
    return json({ error: 'Invalid password' }, 401)
  }

  return json({ ok: true })
}
