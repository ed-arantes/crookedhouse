import { json, d1ListBlockedDates, type AdminEnv } from '../../_lib/admin'
import { parseICalDates } from '../../../lib/ical-parser'
import { fetchICalFeed, getICalFeeds } from '../../_lib/ical-feeds'

type PagesContext = { request: Request; env: AdminEnv }

export const onRequestGet = async ({ env }: PagesContext): Promise<Response> => {
  const blocked = await d1ListBlockedDates(env.DB)

  const feeds = await getICalFeeds(env.DB)
  const feedDates = await Promise.all(feeds.map(async (feed) => {
    try {
      return parseICalDates(await fetchICalFeed(feed.url))
    } catch (error) {
      console.error(`Unable to load ${feed.source} iCal availability`, error)
      return []
    }
  }))
  const icalDates = feedDates.flat()

  // Fetch confirmed bookings (paid) and block their nights
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = env.DB as any
  const bookingDates: string[] = []
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
