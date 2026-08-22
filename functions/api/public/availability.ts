import { json, d1ListBlockedDates, d1GetSetting, type AdminEnv } from '../../_lib/admin'
import { parseICalDates } from '../../../lib/ical-parser'

const ICAL_URL_KEY = 'ical_url'

type PagesContext = { request: Request; env: AdminEnv }

export const onRequestGet = async ({ env }: PagesContext): Promise<Response> => {
  const blocked = await d1ListBlockedDates(env.DB)
  const blockedSet = new Set(blocked.map((d) => d.date))

  // Fetch iCal feed if a URL is configured
  const icalUrl = await d1GetSetting(env.DB, ICAL_URL_KEY, '')
  let icalDates: string[] = []
  if (icalUrl) {
    try {
      const res = await fetch(icalUrl, { signal: AbortSignal.timeout(8000) })
      if (res.ok) {
        const text = await res.text()
        icalDates = parseICalDates(text)
      }
    } catch {
      // iCal fetch failed — return only blocked dates
    }
  }

  // Merge: blocked dates take priority (may have reasons), iCal dates are just dates
  const merged = new Map<string, { date: string; reason?: string; source: 'admin' | 'ical' }>()
  for (const d of blocked) {
    merged.set(d.date, { date: d.date, reason: d.reason, source: 'admin' })
  }
  for (const d of icalDates) {
    if (!merged.has(d)) {
      merged.set(d, { date: d, source: 'ical' })
    }
  }

  return json({
    dates: Array.from(merged.values()).sort((a, b) => a.date.localeCompare(b.date)),
  })
}
