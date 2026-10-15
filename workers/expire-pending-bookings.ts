import { expirePaymentIntent, type ExpirationEnv } from '../functions/_lib/payment-expiration'

type ScheduledEvent = {
 cron: string
 scheduledTime: number
}

type ExecutionContext = {
 waitUntil(promise: Promise<unknown>): void
}

type ExpiredBookingCandidate = {
 session_id: string
}

const MAX_BOOKINGS_PER_RUN = 100

async function expirePendingBookings(env: ExpirationEnv): Promise<void> {
 const { results = [] } = await env.DB.prepare(
  `SELECT session_id FROM bookings
   WHERE status = 'pending'
     AND session_id GLOB 'pi_*'
     AND created_at <= datetime('now', '-15 minutes')
   ORDER BY created_at
   LIMIT ${MAX_BOOKINGS_PER_RUN}`,
 ).all<ExpiredBookingCandidate>()

 for (const booking of results) {
  try {
   const result = await expirePaymentIntent(env, booking.session_id)
   if (result && result.status !== 'not_expired') {
    console.log('Expired booking payment', booking.session_id, result.status)
   }
  } catch (error) {
   console.error('Unable to expire booking payment', booking.session_id, error)
  }
 }
}

export default {
 async scheduled(
  _event: ScheduledEvent,
  env: ExpirationEnv,
  context: ExecutionContext,
 ): Promise<void> {
  context.waitUntil(expirePendingBookings(env))
 },
}
