import {
 json,
 stripeRequest,
 StripeRequestError,
 type StripeCheckoutSession,
 type StripeEnv,
 type StripePaymentIntent,
} from '../_lib/stripe'
import { type AdminEnv } from '../_lib/admin'
import { attemptBookingConfirmation } from '../_lib/booking-confirmation-email'

type PagesContext = {
 request: Request
 env: StripeEnv & AdminEnv
}

async function updateBookingStatus(
 env: PagesContext['env'],
 paymentId: string,
 status: 'paid' | 'cancelled',
): Promise<void> {
 const amountClause = status === 'paid' ? ', paid_amount = total_price' : ''
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 await (env.DB as any).prepare(
  `UPDATE bookings SET status = ?${amountClause} WHERE session_id = ? AND status = 'pending'`,
 ).bind(status, paymentId).run()
}

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
 const url = new URL(request.url)
 const paymentIntentId = url.searchParams.get('payment_intent_id')
 const sessionId = url.searchParams.get('session_id')

 try {
  if (paymentIntentId) {
   if (!/^pi_[a-zA-Z0-9]+$/.test(paymentIntentId)) {
    return json({ error: 'Invalid payment intent' }, 400)
   }
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const booking = await (env.DB as any).prepare(
    'SELECT status FROM bookings WHERE session_id = ?',
   ).bind(paymentIntentId).first() as { status: string } | null
   if (!booking) return json({ error: 'Booking not found' }, 404)

   const intent = await stripeRequest<StripePaymentIntent>(
    env,
    `/payment_intents/${encodeURIComponent(paymentIntentId)}`,
   )
   if (intent.status === 'succeeded') {
    await updateBookingStatus(env, paymentIntentId, 'paid')
    await attemptBookingConfirmation(env, paymentIntentId)
   }
   if (intent.status === 'canceled') await updateBookingStatus(env, paymentIntentId, 'cancelled')
   return json({
    payment_status: intent.status === 'succeeded' ? 'paid' : intent.status,
    status: intent.status,
   })
  }

  if (!sessionId || !/^[a-zA-Z0-9_]+$/.test(sessionId)) {
   return json({ error: 'Invalid checkout session' }, 400)
  }
  const session = await stripeRequest<StripeCheckoutSession>(
   env,
   `/checkout/sessions/${encodeURIComponent(sessionId)}`,
  )

  if (session.payment_status === 'paid') {
   await updateBookingStatus(env, sessionId, 'paid')
   await attemptBookingConfirmation(env, sessionId)
  }

  return json({
   payment_status: session.payment_status,
   status: session.status,
  })
 } catch (error) {
  console.error('Stripe payment verification error', error)
  const statusCode = error instanceof StripeRequestError ? error.status : 500
  return json(
   { error: 'Unable to verify payment' },
   statusCode >= 400 && statusCode < 500 ? statusCode : 500,
  )
 }
}
