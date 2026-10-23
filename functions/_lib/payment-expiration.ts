import {
 json,
 stripeRequest,
 getStripeReceiptUrl,
 type StripeEnv,
 type StripePaymentIntent,
} from './stripe'
import { attemptBookingConfirmation } from './booking-confirmation-email'

export const PAYMENT_WINDOW_MS = 15 * 60 * 1000

type PaymentDatabase = {
 prepare: (query: string) => {
  all: <T>() => Promise<{ results?: T[] }>
 bind: (...values: unknown[]) => {
  first: <T>() => Promise<T | null>
  run: () => Promise<unknown>
 }
 }
}

export type ExpirationEnv = StripeEnv & {
 DB: PaymentDatabase
 BOOKING_ENCRYPTION_KEY?: string
 RESEND_API_KEY?: string
 RESEND_FROM_EMAIL?: string
}

type BookingPaymentRow = {
 id: string
 status: string
 session_id: string | null
 created_at: string
}

export type ExpirationResult =
 | { status: 'expired' | 'paid' | 'already_final' | 'not_expired'; expiresAt?: number }

function parseDatabaseDate(value: string): number {
 const normalized = value.includes('T') ? value : `${value.replace(' ', 'T')}Z`
 return Date.parse(normalized)
}

async function updateBookingStatus(
 env: ExpirationEnv,
 booking: BookingPaymentRow,
 status: 'cancelled' | 'paid',
): Promise<void> {
 const amountClause = status === 'paid' ? ', paid_amount = total_price' : ''
 await env.DB.prepare(
  `UPDATE bookings SET status = ?${amountClause} WHERE id = ? AND status = 'pending'`,
 ).bind(status, booking.id).run()
}

async function resolveStripeStatus(
 env: ExpirationEnv,
 booking: BookingPaymentRow,
 intent: StripePaymentIntent,
): Promise<ExpirationResult> {
 if (intent.status === 'succeeded') {
  await updateBookingStatus(env, booking, 'paid')
  await attemptBookingConfirmation(env, booking.session_id ?? '', getStripeReceiptUrl(intent))
  return { status: 'paid' }
 }
 if (intent.status === 'canceled') {
  await updateBookingStatus(env, booking, 'cancelled')
  return { status: 'expired' }
 }
 return { status: 'not_expired' }
}

export async function expirePaymentIntent(
 env: ExpirationEnv,
 paymentIntentId: string,
 now = Date.now(),
 force = false,
): Promise<ExpirationResult | null> {
 const booking = await env.DB.prepare(
  'SELECT id, status, session_id, created_at FROM bookings WHERE session_id = ?',
 ).bind(paymentIntentId).first<BookingPaymentRow>()

 if (!booking) return null
 if (booking.status !== 'pending') {
  if (booking.status === 'paid') {
   const intent = await stripeRequest<StripePaymentIntent>(
    env,
    `/payment_intents/${encodeURIComponent(paymentIntentId)}?expand%5B%5D=latest_charge`,
   )
   await attemptBookingConfirmation(env, booking.session_id ?? '', getStripeReceiptUrl(intent))
  }
  return { status: 'already_final' }
 }

 const createdAt = parseDatabaseDate(booking.created_at)
 if (!Number.isFinite(createdAt)) {
  throw new Error('Booking creation time is invalid')
 }
 const expiresAt = createdAt + PAYMENT_WINDOW_MS
 if (!force && now < expiresAt) return { status: 'not_expired', expiresAt }

 let intent = await stripeRequest<StripePaymentIntent>(
  env,
  `/payment_intents/${encodeURIComponent(paymentIntentId)}?expand%5B%5D=latest_charge`,
 )
 const resolved = await resolveStripeStatus(env, booking, intent)
 if (resolved.status !== 'not_expired') return resolved

 const cancellableStatuses = new Set([
  'requires_payment_method',
  'requires_confirmation',
  'requires_action',
  'requires_capture',
  'processing',
 ])
 if (!cancellableStatuses.has(intent.status)) return { status: 'not_expired', expiresAt }

 try {
  intent = await stripeRequest<StripePaymentIntent>(
   env,
   `/payment_intents/${encodeURIComponent(paymentIntentId)}/cancel`,
   {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ cancellation_reason: 'abandoned' }),
   },
  )
 } catch (error) {
  // Re-read to resolve a payment/cancellation race before returning the Stripe error.
  const latest = await stripeRequest<StripePaymentIntent>(
   env,
   `/payment_intents/${encodeURIComponent(paymentIntentId)}?expand%5B%5D=latest_charge`,
  )
  const latestResult = await resolveStripeStatus(env, booking, latest)
  if (latestResult.status !== 'not_expired') return latestResult
  throw error
 }

 return resolveStripeStatus(env, booking, intent)
}

export async function handlePaymentExpirationRequest(
 request: Request,
 env: ExpirationEnv,
): Promise<Response> {
 let body: { paymentIntentId?: unknown; cancel?: unknown }
 try {
  body = await request.json() as { paymentIntentId?: unknown; cancel?: unknown }
 } catch {
  return json({ error: 'Invalid request body' }, 400)
 }
 const paymentIntentId = body.paymentIntentId
 if (typeof paymentIntentId !== 'string' || !/^pi_[a-zA-Z0-9]+$/.test(paymentIntentId)) {
  return json({ error: 'Invalid payment intent' }, 400)
 }

 try {
  const result = await expirePaymentIntent(env, paymentIntentId, Date.now(), body.cancel === true)
  if (!result) return json({ error: 'Booking not found' }, 404)
  if (result.status === 'not_expired') {
   return json({ error: 'Payment window is still open', expiresAt: result.expiresAt }, 409)
  }
  return json({ status: result.status })
 } catch (error) {
  console.error('Payment expiration failed', error)
  return json({ error: 'Unable to expire payment' }, 500)
 }
}
