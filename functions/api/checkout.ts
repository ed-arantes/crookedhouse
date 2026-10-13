import { COUNCIL_TAX_PER_PERSON_PER_NIGHT } from '../../lib/booking'
import { calculateAnimalSurcharge, calculateBookingPrice, parseAnimalSurcharge, parseBaseFare, type PricingRule } from '../../lib/pricing'
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

async function getPricingRules(db: Record<string, unknown>): Promise<PricingRule[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { results } = await (db as any)
    .prepare('SELECT id, name, type, start_date, end_date, price_per_night, min_nights, discount_percent, priority FROM pricing_rules ORDER BY priority DESC, start_date')
    .all()
  return (results ?? []).map((row: Record<string, unknown>) => ({
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    type: (row.type === 'date_range' ? 'date_adjustment' : row.type ?? 'date_adjustment') as PricingRule['type'],
    start_date: String(row.start_date ?? ''),
    end_date: String(row.end_date ?? ''),
    price_per_night: Number(row.price_per_night ?? 0) / 100,
    min_nights: Number(row.min_nights ?? 1),
    discount_percent: Number(row.discount_percent ?? 0),
    priority: Number(row.priority ?? 0),
  }))
}

const COUNCIL_TAX_KEY = 'council_tax_per_person_per_night'
const ANIMAL_SURCHARGE_KEY = 'animal_surcharge'
const ANIMAL_SURCHARGE_ACTIVE_KEY = 'animal_surcharge_active'

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
    const pets = body?.guests?.pets === true ? 1 : 0
    const guestCount = adults + children

    const firstName = typeof body?.firstName === 'string' ? body.firstName.trim() : ''
    const lastName = typeof body?.lastName === 'string' ? body.lastName.trim() : ''
    const email = typeof body?.email === 'string' ? body.email.trim() : ''
    const initialMessage = typeof body?.message === 'string' ? body.message.trim() : ''
    if (!firstName || firstName.length > 120 || !lastName || lastName.length > 120 ||
      !email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: 'Invalid booking contact details' }, 400)
    }
    if (initialMessage.length > 2000) {
      return json({ error: 'Message must be between 1 and 2000 characters' }, 400)
    }

    if (!start || !end || end <= start || !Number.isInteger(adults) || adults < 1 ||
      !Number.isInteger(children) || children < 0 || guestCount > MAX_GUESTS) {
      return json({ error: 'Invalid booking details' }, 400)
    }

    // Check availability: blocked dates + iCal + confirmed bookings
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

    // Also block dates from confirmed bookings
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { results: bookingRows } = await (env.DB as any).prepare(
        "SELECT check_in, check_out FROM bookings WHERE status = 'paid'"
      ).all()
      for (const row of bookingRows as { check_in: string; check_out: string }[]) {
        const bStart = new Date(`${row.check_in}T00:00:00.000Z`)
        const bEnd = new Date(`${row.check_out}T00:00:00.000Z`)
        const bNights = Math.round((bEnd.getTime() - bStart.getTime()) / 86400000)
        for (let i = 0; i < bNights; i++) {
          const d = new Date(bStart)
          d.setDate(d.getDate() + i)
          blockedSet.add(d.toISOString().slice(0, 10))
        }
      }
    } catch { /* bookings table may not exist yet */ }

    // Generate every night of the stay and check against unavailable dates
    const nights = Math.round((end.getTime() - start.getTime()) / 86400000)
    const pricingRules = await getPricingRules(env.DB)
    const baseFare = parseBaseFare(await d1GetSetting(env.DB, 'base_fare_per_night', ''))
    if (baseFare === null) throw new Error('Base fare is not configured')
    for (let i = 0; i < nights; i++) {
      const date = new Date(start)
      date.setUTCDate(date.getUTCDate() + i)
      const iso = date.toISOString().slice(0, 10)
      if (blockedSet.has(iso)) {
        return json({ error: 'Selected dates are no longer available' }, 409)
      }
    }
    const price = calculateBookingPrice(String(body.checkIn), String(body.checkOut), baseFare, pricingRules)
    const subtotal = price.subtotal
    const councilTaxRate = parseInt(await d1GetSetting(env.DB, COUNCIL_TAX_KEY, String(COUNCIL_TAX_PER_PERSON_PER_NIGHT)), 10) || COUNCIL_TAX_PER_PERSON_PER_NIGHT
    const councilTax = nights * adults * councilTaxRate
    const animalSurchargeAmount = parseAnimalSurcharge(await d1GetSetting(env.DB, ANIMAL_SURCHARGE_KEY, '0'))
    const animalSurchargeActive = (await d1GetSetting(env.DB, ANIMAL_SURCHARGE_ACTIVE_KEY, 'false')) === 'true'
    const animalSurcharge = calculateAnimalSurcharge(animalSurchargeAmount, animalSurchargeActive, pets === 1)
    const total = subtotal + councilTax + animalSurcharge
    const origin = new URL(request.url).origin
    const form = new URLSearchParams({
      mode: 'payment',
      'line_items[0][quantity]': '1',
      'line_items[0][price_data][currency]': 'eur',
      'line_items[0][price_data][unit_amount]': String(Math.round((subtotal + councilTax) * 100)),
      'line_items[0][price_data][product_data][name]': 'Crooked House Booking',
      'line_items[0][price_data][product_data][description]': `${nights} night${nights > 1 ? 's' : ''} \u00b7 ${guestCount} guest${guestCount > 1 ? 's' : ''}`,
      customer_email: email,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#booking`,
      'metadata[check_in]': String(body.checkIn),
      'metadata[check_out]': String(body.checkOut),
      'metadata[nights]': String(nights),
      'metadata[guests]': String(guestCount),
      'metadata[pets]': String(pets),
      'metadata[animal_surcharge]': String(animalSurcharge),
      'metadata[first_name]': firstName,
      'metadata[last_name]': lastName,
      'metadata[email]': email,
    })
    if (animalSurcharge > 0) {
      form.set('line_items[1][quantity]', '1')
      form.set('line_items[1][price_data][currency]', 'eur')
      form.set('line_items[1][price_data][unit_amount]', String(Math.round(animalSurcharge * 100)))
      form.set('line_items[1][price_data][product_data][name]', 'Pet surcharge')
    }

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
    const message = initialMessage
    const bookingMessageId = initialMessage ? crypto.randomUUID() : ''
    let [storedFirstName, storedLastName, storedEmail, storedMessage] = [firstName, lastName, email, message]
    if (encKey) {
      [storedFirstName, storedLastName, storedEmail, storedMessage] = await Promise.all([
        encrypt(firstName, encKey),
        encrypt(lastName, encKey),
        encrypt(email, encKey),
        encrypt(message, encKey),
      ])
    } else {
      // Fallback: save without encryption
      console.warn('BOOKING_ENCRYPTION_KEY not set — saving without encryption')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = env.DB as any
    const bookingStatement = db.prepare(
      'INSERT INTO bookings (id, session_id, first_name_encrypted, last_name_encrypted, email_encrypted, check_in, check_out, nights, adults, children, pets, message_encrypted, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      bookingId,
      result.id || '',
      storedFirstName,
      storedLastName,
      storedEmail,
      String(body.checkIn),
      String(body.checkOut),
      nights,
      adults,
      children,
      pets,
      storedMessage,
      total,
      'pending',
    )
    const statements = [bookingStatement]
    if (initialMessage) {
      statements.push(db.prepare(
        "INSERT INTO booking_messages (id, booking_id, sender, message_encrypted) VALUES (?, ?, 'guest', ?)",
      ).bind(bookingMessageId, bookingId, storedMessage))
    }
    await db.batch(statements)

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
