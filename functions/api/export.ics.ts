import { d1GetSetting, decrypt, type AdminEnv } from '../_lib/admin'
import {
  formatICalendar,
  formatICalDate,
  isCalendarEligibleBooking,
  type ICalendarEvent,
} from '../../lib/ical-export'

type PagesContext = { request: Request; env: AdminEnv }

const FEED_TOKEN_SETTING = 'ical_export_token'
const NO_CACHE_HEADERS = {
  'Content-Type': 'text/calendar; charset=utf-8',
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Cloudflare-CDN-Cache-Control': 'no-store',
  Pragma: 'no-cache',
  Expires: '0',
}

function notFound(): Response {
  return new Response('Calendar not found', {
    status: 404,
    headers: { ...NO_CACHE_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const token = new URL(request.url).searchParams.get('token') ?? ''
  if (!/^[a-f0-9]{64}$/.test(token)) return notFound()

  try {
    const configuredToken = await d1GetSetting(env.DB, FEED_TOKEN_SETTING, '')
    if (!configuredToken || token !== configuredToken) return notFound()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = env.DB as any
    const [bookingRows, blockedRows] = await Promise.all([
      db.prepare(
        'SELECT id, first_name_encrypted, last_name_encrypted, check_in, check_out, status FROM bookings ORDER BY check_in ASC, id ASC',
      ).all(),
      db.prepare('SELECT date, reason FROM blocked_dates ORDER BY date ASC').all(),
    ])

    const key = env.BOOKING_ENCRYPTION_KEY ?? ''
    const events: ICalendarEvent[] = []
    for (const row of bookingRows.results as Array<{
      id: string
      first_name_encrypted: string
      last_name_encrypted: string
      check_in: string
      check_out: string
      status: string
    }>) {
      if (!isCalendarEligibleBooking(row.status)) continue
      const [firstName, lastName] = key
        ? await Promise.all([
            decrypt(row.first_name_encrypted, key),
            decrypt(row.last_name_encrypted, key),
          ])
        : [row.first_name_encrypted, row.last_name_encrypted]
      const summary = `${firstName.trim()} ${lastName.trim()}`.trim()
      if (!summary) throw new Error(`Paid booking ${row.id} has no guest name`)
      events.push({
        uid: `${row.id}@crookedhouse.it`,
        summary,
        start: row.check_in,
        end: row.check_out,
      })
    }

    for (const row of blockedRows.results as Array<{ date: string; reason: string | null }>) {
      const start = formatICalDate(row.date)
      const endDate = new Date(`${row.date}T00:00:00.000Z`)
      endDate.setUTCDate(endDate.getUTCDate() + 1)
      const end = endDate.toISOString().slice(0, 10)
      events.push({
        uid: `admin-${start}@crookedhouse.it`,
        summary: row.reason?.trim() || 'Blocked by admin',
        start: row.date,
        end,
      })
    }

    return new Response(formatICalendar(events, new Date()), { headers: NO_CACHE_HEADERS })
  } catch (error) {
    console.error('Unable to generate live iCal export', error)
    return new Response('Unable to generate calendar', {
      status: 500,
      headers: { ...NO_CACHE_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
}
