import { COUNCIL_TAX_PER_PERSON_PER_NIGHT, NIGHTLY_RATE } from '../../lib/booking'
import {
 json,
 stripeRequest,
 StripeRequestError,
 type StripeCheckoutSession,
 type StripeEnv,
} from '../_lib/stripe'

const MAX_GUESTS = 4

type PagesContext = {
 request: Request
 env: StripeEnv
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
   guests?: { adults?: unknown; children?: unknown }
  }
  const start = parseDate(body?.checkIn)
  const end = parseDate(body?.checkOut)
  const adults = Number(body?.guests?.adults)
  const children = Number(body?.guests?.children)
  const guestCount = adults + children

  if (!start || !end || end <= start || !Number.isInteger(adults) || adults < 1 ||
   !Number.isInteger(children) || children < 0 || guestCount > MAX_GUESTS) {
   return json({ error: 'Invalid booking details' }, 400)
  }

  const nights = Math.round((end.getTime() - start.getTime()) / 86400000)
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
   'line_items[0][price_data][product_data][description]': `${nights} night${nights > 1 ? 's' : ''} · ${guestCount} guest${guestCount > 1 ? 's' : ''}`,
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
