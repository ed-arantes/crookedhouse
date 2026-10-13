import {
  d1GetSetting,
  d1ListBlockedDates,
  json,
  requireAdmin,
  decrypt,
  encrypt,
  type AdminEnv,
} from '../../_lib/admin'
import { COUNCIL_TAX_PER_PERSON_PER_NIGHT } from '../../../lib/booking'
import { calculateAnimalSurcharge, calculateBookingPrice, parseAnimalSurcharge, parseBaseFare, type PricingRule } from '../../../lib/pricing'
import { parseICalDates } from '../../../lib/ical-parser'

type PagesContext = {
  request: Request
  env: AdminEnv
}

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const encKey = env.BOOKING_ENCRYPTION_KEY
  const url = new URL(request.url)
  const status = url.searchParams.get('status')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = env.DB as any

  let query = 'SELECT * FROM bookings'
  const params: string[] = []
  if (status && ['pending', 'paid', 'cancelled'].includes(status)) {
    query += ' WHERE status = ?'
    params.push(status)
  }
  query += ' ORDER BY created_at DESC'

  const { results } = await db.prepare(query).bind(...params).all()
  const enc = encKey || ''

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookings = await Promise.all(results.map(async (row: any) => {
    // Try to decrypt, fall back to raw value if decryption fails (unencrypted data)
    async function safeDecrypt(val: string, key: string): Promise<string> {
      if (!val) return ''
      if (!key) return val
      try {
        return await decrypt(val, key)
      } catch {
        return val
      }
    }

    return {
      id: row.id,
      session_id: row.session_id,
      first_name: await safeDecrypt(String(row.first_name_encrypted), enc),
      last_name: await safeDecrypt(String(row.last_name_encrypted), enc),
      email: await safeDecrypt(String(row.email_encrypted), enc),
      check_in: row.check_in,
      check_out: row.check_out,
      nights: row.nights,
      adults: row.adults,
      children: row.children,
      pets: row.pets,
      message: row.message_encrypted ? await safeDecrypt(String(row.message_encrypted), enc) : '',
      total_price: row.total_price,
      paid_amount: row.paid_amount ?? 0,
      credit_amount: row.credit_amount ?? 0,
      payment_requested_at: row.payment_requested_at ?? null,
      status: row.status,
      created_at: row.created_at,
    }
  }))

  return json(bookings)
}

export const onRequestDelete = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return json({ error: 'Missing id' }, 400)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = env.DB as any
  const result = await db.prepare('DELETE FROM bookings WHERE id = ?').bind(id).run()
  if (result.meta?.changes === 0) return json({ error: 'Booking not found' }, 404)

  return json({ ok: true })
}

export const onRequestPut = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const body = await request.json().catch(() => null) as {
    id?: string
    status?: string
    action?: string
    check_in?: string
    check_out?: string
  } | null
  if (!body?.id) return json({ error: 'Missing id' }, 400)

  if (body.action === 'request_payment') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = env.DB as any
      const booking = await db.prepare(
        "SELECT total_price, paid_amount FROM bookings WHERE id = ? AND status = 'paid'",
      ).bind(body.id).first() as { total_price: number; paid_amount: number } | null
      if (!booking || booking.total_price <= booking.paid_amount) {
        return json({ error: 'No remaining payment due for this booking' }, 409)
      }
      const key = env.BOOKING_ENCRYPTION_KEY
      if (!key) return json({ error: 'Messaging is not configured' }, 500)
      const due = (booking.total_price - booking.paid_amount).toFixed(2)
      const message = await encrypt(
        `A remaining balance of €${due} is due for your amended booking. The online payment link is not connected yet; we will contact you with payment instructions.`,
        key,
      )
      const update = await db.prepare(
        "UPDATE bookings SET payment_requested_at = datetime('now') WHERE id = ? AND status = 'paid' AND total_price > paid_amount AND payment_requested_at IS NULL",
      ).bind(body.id).run()
      if (update.meta?.changes === 0) return json({ error: 'Payment has already been requested or is no longer due' }, 409)
      await db.prepare(
        "INSERT INTO booking_messages (id, booking_id, sender, message_encrypted) VALUES (?, ?, 'host', ?)",
      ).bind(crypto.randomUUID(), body.id, message).run()
      return json({ ok: true, payment_connected: false })
    } catch (error) {
      console.error('Remaining payment request could not be recorded', error)
      return json({ error: 'Unable to record payment request' }, 500)
    }
  }

  if (body.action === 'amend') {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/
    if (!body.check_in || !body.check_out || !datePattern.test(body.check_in) || !datePattern.test(body.check_out)) {
      return json({ error: 'Invalid check-in or check-out date' }, 400)
    }
    const start = new Date(`${body.check_in}T00:00:00.000Z`)
    const end = new Date(`${body.check_out}T00:00:00.000Z`)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return json({ error: 'Invalid check-in or check-out date' }, 400)
    }
    const nights = Math.round((end.getTime() - start.getTime()) / 86400000)
    if (start.toISOString().slice(0, 10) !== body.check_in ||
      end.toISOString().slice(0, 10) !== body.check_out || nights < 1 || nights > 365) {
      return json({ error: 'Stay must be between 1 and 365 nights' }, 400)
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = env.DB as any
      const booking = await db.prepare(
        'SELECT id, status, adults, children, pets, paid_amount FROM bookings WHERE id = ?',
      ).bind(body.id).first() as {
        id: string
        status: string
        adults: number
        children: number
        pets: number
        paid_amount: number
      } | null
      if (!booking) return json({ error: 'Booking not found' }, 404)
      if (booking.status === 'pending') {
        return json({ error: 'Pending bookings cannot be amended until their existing checkout is handled.' }, 409)
      }

      const { results: conflictingBookings } = await db.prepare(
        "SELECT check_in, check_out FROM bookings WHERE status = 'paid' AND id != ? AND check_in < ? AND check_out > ?",
      ).bind(body.id, body.check_out, body.check_in).all()
      if (conflictingBookings.length > 0) return json({ error: 'Dates overlap another confirmed booking' }, 409)

      const blocked = await d1ListBlockedDates(env.DB)
      const blockedDates = new Set(blocked.map((item) => item.date))
      const icalUrl = await d1GetSetting(env.DB, 'ical_url', '')
      if (icalUrl) {
        try {
          const response = await fetch(icalUrl, { signal: AbortSignal.timeout(8000) })
          if (response.ok) {
            for (const date of parseICalDates(await response.text())) blockedDates.add(date)
          }
        } catch (error) {
          console.error('Could not verify iCal dates while amending a booking', error)
          return json({ error: 'Unable to verify calendar availability. Try again later.' }, 503)
        }
      }

      const { results: pricingRows } = await db.prepare(
        'SELECT id, name, type, start_date, end_date, price_per_night, min_nights, discount_percent, priority FROM pricing_rules ORDER BY priority DESC, start_date',
      ).all()
      const rules = (pricingRows as Array<Omit<PricingRule, 'type'> & { type: string }>).map((rule) => ({
        ...rule,
        type: (rule.type === 'date_range' ? 'date_adjustment' : rule.type) as PricingRule['type'],
        price_per_night: Number(rule.price_per_night ?? 0) / 100,
      }))
      const baseFare = parseBaseFare(await d1GetSetting(env.DB, 'base_fare_per_night', ''))
      if (baseFare === null) return json({ error: 'Base fare is not configured' }, 503)
      const dateCursor = new Date(start)
      for (let index = 0; index < nights; index++) {
        const date = dateCursor.toISOString().slice(0, 10)
        if (blockedDates.has(date)) return json({ error: `Date ${date} is unavailable` }, 409)
        dateCursor.setUTCDate(dateCursor.getUTCDate() + 1)
      }
      const price = calculateBookingPrice(body.check_in, body.check_out, baseFare, rules)
      const adults = Number(booking.adults)
      const councilTax = parseInt(await d1GetSetting(
        env.DB,
        'council_tax_per_person_per_night',
        String(COUNCIL_TAX_PER_PERSON_PER_NIGHT),
      ), 10) || COUNCIL_TAX_PER_PERSON_PER_NIGHT
      const animalSurchargeAmount = parseAnimalSurcharge(await d1GetSetting(env.DB, 'animal_surcharge', '0'))
      const animalSurchargeActive = (await d1GetSetting(env.DB, 'animal_surcharge_active', 'false')) === 'true'
      const animalSurcharge = calculateAnimalSurcharge(
        animalSurchargeAmount,
        animalSurchargeActive,
        Number(booking.pets) > 0,
      )
      const newTotal = Math.round(
        (price.subtotal + nights * adults * councilTax + animalSurcharge) * 100,
      ) / 100
      const paidAmount = Number(booking.paid_amount)
      const dueAmount = Math.max(0, newTotal - paidAmount)
      const creditAmount = Math.max(0, paidAmount - newTotal)
      const result = await db.prepare(
        `UPDATE bookings
         SET check_in = ?, check_out = ?, nights = ?, total_price = ?,
             credit_amount = ?, payment_requested_at = NULL
         WHERE id = ?`,
      ).bind(body.check_in, body.check_out, nights, newTotal, creditAmount, body.id).run()
      if (result.meta?.changes === 0) return json({ error: 'Booking could not be updated' }, 409)
      return json({
        ok: true,
        check_in: body.check_in,
        check_out: body.check_out,
        nights,
        total_price: newTotal,
        paid_amount: paidAmount,
        due_amount: dueAmount,
        credit_amount: creditAmount,
      })
    } catch (error) {
      console.error('Booking amendment failed', error)
      return json({ error: 'Unable to amend booking' }, 500)
    }
  }

  if (!body.status) return json({ error: 'Missing status' }, 400)

  if (!['pending', 'paid', 'cancelled'].includes(body.status)) {
    return json({ error: 'Invalid status' }, 400)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = env.DB as any
  const result = await db.prepare(
    "UPDATE bookings SET status = ?, paid_amount = CASE WHEN ? = 'paid' AND paid_amount = 0 THEN total_price ELSE paid_amount END WHERE id = ?",
  ).bind(body.status, body.status, body.id).run()

  if (result.meta?.changes === 0) return json({ error: 'Booking not found' }, 404)
  return json({ ok: true })
}
