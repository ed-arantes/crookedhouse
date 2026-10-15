'use client'

import { useEffect, useState } from 'react'
import { SuccessRedirect } from '@/components/success-redirect'
import { apiUrl } from '@/lib/api-url'

type State = 'loading' | 'missing' | 'invalid' | 'failed' | 'unpaid' | 'processing' | 'cancelled' | 'paid'

export default function SuccessPage() {
 const [state, setState] = useState<State>('loading')

 useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const sessionId = params.get('session_id')
  const paymentIntentId = params.get('payment_intent_id')
  if (!sessionId && !paymentIntentId) {
   setState('missing')
   return
  }

  const query = paymentIntentId
   ? `payment_intent_id=${encodeURIComponent(paymentIntentId)}`
   : `session_id=${encodeURIComponent(sessionId!)}`
  fetch(apiUrl(`/api/checkout-session?${query}`), {
   cache: 'no-store',
  })
   .then(async (response) => {
    if (response.status === 400) {
     setState('invalid')
     return
    }
    if (!response.ok) throw new Error('Verification failed')
    const session = await response.json() as { payment_status?: string }
    if (session.payment_status === 'paid') setState('paid')
    else if (session.payment_status === 'processing') setState('processing')
    else if (session.payment_status === 'canceled') setState('cancelled')
    else setState('unpaid')
   })
   .catch(() => setState('failed'))
 }, [])

 if (state === 'loading') {
  return (
   <main className="flex min-h-screen items-center justify-center bg-background px-5 text-center">
    <p className="text-sm text-muted-foreground">Verifying your payment…</p>
   </main>
  )
 }

 if (state === 'missing' || state === 'invalid' || state === 'failed') {
  const title = state === 'missing'
   ? 'Missing session'
   : state === 'invalid'
    ? 'Invalid payment session'
    : 'We could not verify this payment'
  return (
   <main className="flex min-h-screen items-center justify-center bg-background px-5 text-center">
    <div>
     <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">Payment</p>
     <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">{title}</h1>
     {state !== 'missing' && (
      <p className="mt-4 text-sm text-muted-foreground">
       Please contact us if you completed a payment and do not receive confirmation.
      </p>
     )}
    </div>
   </main>
  )
 }

 if (state === 'unpaid') {
  return (
   <main className="flex min-h-screen items-center justify-center bg-background px-5 text-center">
    <div>
     <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">Payment</p>
     <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">Payment is not complete</h1>
     <p className="mt-4 text-sm text-muted-foreground">
      We have not received a completed payment for this session.
     </p>
    </div>
   </main>
  )
 }

 if (state === 'processing' || state === 'cancelled') {
  return (
   <main className="flex min-h-screen items-center justify-center bg-background px-5 text-center">
    <div>
     <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">Payment</p>
     <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
      {state === 'processing' ? 'Payment is processing' : 'Payment was cancelled'}
     </h1>
     <p className="mt-4 text-sm text-muted-foreground">
      {state === 'processing'
       ? 'We will confirm your booking as soon as the payment is complete.'
       : 'No payment was completed for this booking.'}
     </p>
    </div>
   </main>
  )
 }

 return (
  <main className="flex min-h-screen items-center justify-center bg-background px-5 text-center">
   <div className="max-w-xl">
    <p className="text-xs font-medium uppercase tracking-[0.28em] text-accent">Booking confirmed</p>
    <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
     Thanks for booking Crooked House
    </h1>
    <p className="mt-4 text-base text-muted-foreground">
     Your payment was processed successfully. We&apos;ll be in touch shortly with the final confirmation details.
    </p>
    <p className="mt-2 text-sm text-muted-foreground">Payment confirmed</p>
    <SuccessRedirect />
   </div>
  </main>
 )
}
