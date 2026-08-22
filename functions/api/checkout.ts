import { COUNCIL_TAX_PER_PERSON_PER_NIGHT, NIGHTLY_RATE } from '../../lib/booking'
import {
  json,
  stripeRequest,
  StripeRequestError,
  type StripeCheckoutSession,
  type StripeEnv,
} from '../_lib/stripe'
import { d1ListBlockedDates, d1GetSetting, type AdminEnv } from '../_lib/admin'
import { parseICalDates } from '../../lib/ical-parser'
import { encrypt } from '../../lib/encryption'

const MAX_GUESTS = 4
const ICAL_URL_KEY = 'ical_url'

type PagesContext = {
  request: Request
  env: StripeEnv & AdminEnv
}

function parseDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

export const onRequestPost = async ({ request, env }: PagesContext): Promise<Response> => {
  try {
    const body = await request.json() as {
      checkIn?: unknown
      checkOut?: unknown
      guests?: { adults?: unknown; children?: unknown; pets?: unknown }
      firstName?: unknown
      lastName?: unknown
      email?: unknown
      message?: unknown
    }
    const start = parseDate(body?.checkIn)
    const end = parseDate(body?.checkOut)
    const adults = Number(body?.guests?.adults)
    const children = Number(body?.guests?.children)
    const pets = body?.guests?.pets ? 1 : 0
    const guestCount = adults + children

    if (!start || !end || end <= start || !Number.isInteger(adults) || adults < 1 ||
      !Number.isInteger(children) || children < 0 || guestCount > MAX_GUESTS) {
      return json({ error: 'Invalid booking details' }, 400)
    }

    // Check availability: blocked dates + iCal
    const blocked = await d1ListBlockedDates(env.DB)
    const blockedSet = new Set(blocked.map((d) => d.date))
    const icalUrl = await d1GetSetting(env.DB, ICAL_URL_KEY, '')
    if (icalUrl) {
      try {
        const res = await fetch(icalUrl, { signal: AbortSignal.timeout(8000) })
        if (res.ok) {
          for (const d of parseICalDates(await res.text())) blockedSet.add(d)
        }
      } catch { /* proceed with manual blocks only */ }
    }

    // Generate every night of the stay and check against unavailable dates
    const nights = Math.round((end.getTime() - start.getTime()) / 86400000)
    let cursor = new Date(start)
    for (let i = 0; i < nights; i++) {
      const iso = cursor.toISOString().slice(0, 10)
      if (blockedSet.has(iso)) {
        return json({ error: 'Selected dates are no longer available' }, 409)
      }
      cursor.setDate(cursor.getDate() + 1)
    }

    const subtotal = nights * NIGHTLY_RATE
    const councilTax = nights * guestCount * COUNCIL_TAX_PER_PERSON_PER_NIGHT
    const total = subtotal + councilTax
    const origin = new URL(request.url).origin
    const form = new URLSearchParams({
      mode: 'payment',
      'line_items[0][quantity]': '1',
      'line_items[0][price_data][currency]': 'eur',
      'line_items[0][price_data][unit_amount]': String(total * 100),
      'line_items[0][price_data][product_data][name]': 'Crooked House stay',
      'line_items[0][price_data][product_data][description]': `${nights} night${nights > 1 ? 's' : ''} \u00b7 ${guestCount} guest${guestCount > 1 ? 's' : ''}`,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#booking`,
      'metadata[check_in]': String(body.checkIn),
      'metadata[check_out]': String(body.checkOut),
      'metadata[nights]': String(nights),
      'metadata[guests]': String(guestCount),
    })

    const result = await stripeRequest<StripeCheckoutSession>(env, '/checkout/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    })

    if (!result.url) throw new StripeRequestError('Stripe did not return a checkout URL')

    // Save booking to D1 with encrypted PII
    const encKey = env.BOOKING_ENCRYPTION_KEY
    console.log('BOOKING_ENCRYPTION_KEY present:', !!encKey, 'length:', encKey?.length)

    const bookingId = crypto.randomUUID()
    const firstName = typeof body.firstName === 'string' ? body.firstName : ''
    const lastName = typeof body.lastName === 'string' ? body.lastName : ''
    const email = typeof body.email === 'string' ? body.email : ''
    const message = typeof body.message === 'string' ? body.message : ''

    if (encKey) {
      const [encFirst, encLast, encEmail, encMsg] = await Promise.all([
        encrypt(firstName, encKey),
        encrypt(lastName, encKey),
        encrypt(email, encKey),
        encrypt(message, encKey),
      ])

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (env.DB as any).prepare(
        'INSERT INTO bookings (id, session_id, first_name_encrypted, last_name_encrypted, email_encrypted, check_in, check_out, nights, adults, children, pets, message_encrypted, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        bookingId,
        result.id || '',
        encFirst,
        encLast,
        encEmail,
        String(body.checkIn),
        String(body.checkOut),
        nights,
        adults,
        children,
        pets,
        encMsg,
        total,
        'pending',
      ).run()
    } else {
      // Fallback: save without encryption
      console.warn('BOOKING_ENCRYPTION_KEY not set — saving without encryption')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (env.DB as any).prepare(
        'INSERT INTO bookings (id, session_id, first_name_encrypted, last_name_encrypted, email_encrypted, check_in, check_out, nights, adults, children, pets, message_encrypted, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        bookingId,
        result.id || '',
        firstName,
        lastName,
        email,
        String(body.checkIn),
        String(body.checkOut),
        nights,
        adults,
        children,
        pets,
        message,
        total,
        'pending',
      ).run()
    }

    return json({ url: result.url })
  } catch (error: unknown) {
    console.error('Stripe checkout error', error)
    const statusCode = error instanceof StripeRequestError ? error.status : 500
    return json(
      { error: 'Unable to create checkout session' },
      statusCode >= 400 && statusCode < 500 ? statusCode : 500,
    )
  }
}
