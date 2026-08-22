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

  // Fetch confirmed bookings (paid) and block their nights
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = env.DB as any
  let bookingDates: string[] = []
  try {
    const { results } = await db.prepare(
      "SELECT check_in, check_out FROM bookings WHERE status = 'paid'"
    ).all()
    for (const row of results as { check_in: string; check_out: string }[]) {
      const start = new Date(`${row.check_in}T00:00:00.000Z`)
      const end = new Date(`${row.check_out}T00:00:00.000Z`)
      const nights = Math.round((end.getTime() - start.getTime()) / 86400000)
      for (let i = 0; i < nights; i++) {
        const d = new Date(start)
        d.setDate(d.getDate() + i)
        bookingDates.push(d.toISOString().slice(0, 10))
      }
    }
  } catch {
    // bookings table may not exist yet
  }

  // Merge: blocked dates > iCal dates > booking dates
  const merged = new Map<string, { date: string; reason?: string; source: 'admin' | 'ical' | 'booking' }>()
  for (const d of blocked) {
    merged.set(d.date, { date: d.date, reason: d.reason, source: 'admin' })
  }
  for (const d of icalDates) {
    if (!merged.has(d)) {
      merged.set(d, { date: d, source: 'ical' })
    }
  }
  for (const d of bookingDates) {
    if (!merged.has(d)) {
      merged.set(d, { date: d, reason: 'Prenotazione confermata', source: 'booking' })
    }
  }

  return json({
    dates: Array.from(merged.values()).sort((a, b) => a.date.localeCompare(b.date)),
  })
}
