import {
 json,
 stripeRequest,
 StripeRequestError,
 type StripeCheckoutSession,
 type StripeEnv,
} from '../_lib/stripe'

type PagesContext = {
 request: Request
 env: StripeEnv
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
