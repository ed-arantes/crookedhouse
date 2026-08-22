import {
 json,
 stripeRequest,
 StripeRequestError,
 type StripeCheckoutSession,
 type StripeEnv,
} from '../_lib/stripe'
import { type AdminEnv } from '../_lib/admin'

type PagesContext = {
 request: Request
 env: StripeEnv & AdminEnv
}

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
 const sessionId = new URL(request.url).searchParams.get('session_id')
 if (!sessionId || !/^[a-zA-Z0-9_]+$/.test(sessionId)) {
  return json({ error: 'Invalid checkout session' }, 400)
 }

 try {
  const session = await stripeRequest<StripeCheckoutSession>(
   env,
   `/checkout/sessions/${encodeURIComponent(sessionId)}`,
  )

  // Mark booking as paid if payment succeeded
  if (session.payment_status === 'paid' && env.DB) {
   try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
     await (env.DB as any).prepare(
      "UPDATE bookings SET status = 'paid' WHERE session_id = ?"
    ).bind(sessionId).run()
   } catch { /* booking may not exist if encryption key was not set */ }
  }

  return json({
   payment_status: session.payment_status,
   status: session.status,
  })
 } catch (error) {
  console.error('Stripe session verification error', error)
  const statusCode = error instanceof StripeRequestError ? error.status : 500
  return json(
   { error: 'Unable to verify checkout session' },
   statusCode >= 400 && statusCode < 500 ? statusCode : 500,
  )
 }
}
