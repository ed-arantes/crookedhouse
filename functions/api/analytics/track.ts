import { json, type AdminEnv } from '../../_lib/admin'

type PagesContext = {
  request: Request
  env: AdminEnv
}

export const onRequestPost = async ({ request, env }: PagesContext): Promise<Response> => {
  try {
    const body = await request.json().catch(() => null) as {
      path?: string
      referrer?: string
      user_agent?: string
      country?: string
      ip_hash?: string
    } | null

    if (!body?.path) return json({ ok: false }, 400)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
     await (env.DB as any).prepare(
      'INSERT INTO page_views (path, referrer, user_agent, country, ip_hash) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      body.path,
      body.referrer || null,
      body.user_agent || null,
      body.country || null,
      body.ip_hash || null,
    ).run()

    return json({ ok: true })
  } catch {
    return json({ ok: false }, 500)
  }
}
