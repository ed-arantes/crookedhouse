import { json, requireAdmin, d1GetSetting, d1SetSetting, type AdminEnv } from '../../_lib/admin'
import { parseICalEvents } from '../../../lib/ical-parser'

const ICAL_URL_KEY = 'ical_url'

type PagesContext = { request: Request; env: AdminEnv }

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const url = await d1GetSetting(env.DB, ICAL_URL_KEY, '')

  const preview = new URL(request.url).searchParams.get('preview')
  if (preview && url) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
      if (!res.ok) return json({ url, events: [], error: `HTTP ${res.status}` })
      const text = await res.text()
      const events = parseICalEvents(text)
      return json({ url, events })
    } catch {
      return json({ url, events: [], error: 'Impossibile caricare il feed iCal' })
    }
  }

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
