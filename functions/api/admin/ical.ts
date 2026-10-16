import { json, requireAdmin, d1GetSetting, d1SetSetting, type AdminEnv } from '../../_lib/admin'
import { parseICalEvents } from '../../../lib/ical-parser'
import { fetchICalFeed, getICalFeeds, type ICalSource } from '../../_lib/ical-feeds'

type PagesContext = { request: Request; env: AdminEnv }

async function getExportUrl(db: AdminEnv['DB']): Promise<string> {
  let token = await d1GetSetting(db, 'ical_export_token', '')
  if (!token) {
    const bytes = crypto.getRandomValues(new Uint8Array(32))
    const newToken = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).prepare(
      'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
    ).bind('ical_export_token', newToken).run()
    token = await d1GetSetting(db, 'ical_export_token', '')
  }
  if (!/^[a-f0-9]{64}$/.test(token)) {
    throw new Error('The stored iCal export token is invalid')
  }
  return `https://ical.crookedhouse.it/api/export.ics?token=${token}`
}

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const preview = new URL(request.url).searchParams.get('preview')
  const feeds = await getICalFeeds(env.DB)
  if (preview) {
    const previews = await Promise.all(
      feeds.map(async (feed) => {
        try {
          const events = parseICalEvents(await fetchICalFeed(feed.url))
          return { ...feed, events }
        } catch (error) {
          console.error(`Unable to load ${feed.source} iCal feed`, error)
          return {
            ...feed,
            events: [],
            error: 'Impossibile caricare il feed iCal',
          }
        }
      }),
    )
    return json({ feeds: previews })
  }

  return json({
    airbnbUrl: feeds.find((feed) => feed.source === 'airbnb')?.url ?? '',
    bookingUrl: feeds.find((feed) => feed.source === 'booking')?.url ?? '',
    exportUrl: await getExportUrl(env.DB),
  })
}

export const onRequestPost = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const body = await request.json().catch(() => null) as {
    airbnbUrl?: unknown
    bookingUrl?: unknown
  } | null
  if (typeof body?.airbnbUrl !== 'string' || typeof body.bookingUrl !== 'string') {
    return json({ error: 'Missing calendar URLs' }, 400)
  }

  const urls: Array<{ source: ICalSource; key: string; url: string }> = [
    { source: 'airbnb', key: 'airbnb_ical_url', url: body.airbnbUrl.trim() },
    { source: 'booking', key: 'ical_url', url: body.bookingUrl.trim() },
  ]
  for (const { source, url } of urls) {
    if (!url) continue
    try {
      const parsed = new URL(url)
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error()
    } catch {
      return json({ error: `Invalid ${source} calendar URL` }, 400)
    }
  }

  await Promise.all(urls.map(({ key, url }) => d1SetSetting(env.DB, key, url)))
  return json({ ok: true })
}
