const STRIPE_API_URL = 'https://api.stripe.com/v1'
const STRIPE_TIMEOUT_MS = 10_000

export type StripeCheckoutSession = {
 id: string
 payment_status: 'paid' | 'unpaid' | 'no_payment_required'
 status: 'complete' | 'expired' | 'open' | null
 url?: string | null
}

export class StripeRequestError extends Error {
 readonly status: number

 constructor(message: string, status = 500) {
  super(message)
  this.name = 'StripeRequestError'
  this.status = status
 }
}

export type StripeEnv = {
 STRIPE_SECRET_KEY?: string
}

export async function stripeRequest<T>(
 env: StripeEnv,
 path: string,
 init: RequestInit = {},
): Promise<T> {
 const key = env.STRIPE_SECRET_KEY
 if (!key) throw new StripeRequestError('Stripe is not configured')

 const controller = new AbortController()
 const timeout = setTimeout(() => controller.abort(), STRIPE_TIMEOUT_MS)

 try {
  const response = await fetch(`${STRIPE_API_URL}${path}`, {
   ...init,
   headers: {
    Authorization: `Bearer ${key}`,
    ...(init.headers ?? {}),
   },
   signal: controller.signal,
  })
  const payload = await response.json().catch(() => null) as
   | (T & { error?: { message?: string } })
   | null

  if (!response.ok || !payload) {
   throw new StripeRequestError(
    payload?.error?.message || 'Stripe request failed',
    response.status,
   )
  }

  return payload as T
 } catch (error) {
  if (error instanceof StripeRequestError) throw error
  throw new StripeRequestError('Stripe request timed out or failed')
 } finally {
  clearTimeout(timeout)
 }
}

export function json(data: unknown, status = 200): Response {
 return new Response(JSON.stringify(data), {
  status,
  headers: {
   'Content-Type': 'application/json; charset=utf-8',
   'Cache-Control': 'no-store',
  },
 })
}
