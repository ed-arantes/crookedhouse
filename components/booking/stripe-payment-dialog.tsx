'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { LoaderCircle, X } from 'lucide-react'
import type { Locale } from '@/lib/i18n'

type Props = {
 locale: Locale
 paymentIntentId: string
 clientSecret: string
 publishableKey: string
 email: string
 expiresAt: number
 amount: string
 onExpire: () => void
 onCancel: () => void
}

const COPY: Record<Locale, {
 title: string
 amount: string
 remaining: string
 pay: string
 processing: string
 cancel: string
 expired: string
 error: string
}> = {
 it: {
  title: 'Completa il pagamento',
  amount: 'Importo da pagare',
  remaining: 'Tempo rimasto: {time}',
  pay: 'Paga ora',
  processing: 'Pagamento in corso…',
  cancel: 'Annulla pagamento',
  expired: 'Il tempo per completare il pagamento è scaduto.',
  error: 'Il pagamento non è riuscito. Controlla i dati e riprova.',
 },
 en: {
  title: 'Complete your payment',
  amount: 'Amount due',
  remaining: 'Time remaining: {time}',
  pay: 'Pay now',
  processing: 'Processing payment…',
  cancel: 'Cancel payment',
  expired: 'The time to complete payment has expired.',
  error: 'Payment failed. Check your details and try again.',
 },
 fr: {
  title: 'Finalisez votre paiement',
  amount: 'Montant dû',
  remaining: 'Temps restant : {time}',
  pay: 'Payer maintenant',
  processing: 'Paiement en cours…',
  cancel: 'Annuler le paiement',
  expired: 'Le délai de paiement a expiré.',
  error: 'Le paiement a échoué. Vérifiez vos informations et réessayez.',
 },
 de: {
  title: 'Zahlung abschließen',
  amount: 'Fälliger Betrag',
  remaining: 'Verbleibende Zeit: {time}',
  pay: 'Jetzt bezahlen',
  processing: 'Zahlung wird verarbeitet…',
  cancel: 'Zahlung abbrechen',
  expired: 'Die Zahlungsfrist ist abgelaufen.',
  error: 'Die Zahlung ist fehlgeschlagen. Bitte prüfen Sie Ihre Angaben.',
 },
 es: {
  title: 'Completa el pago',
  amount: 'Importe pendiente',
  remaining: 'Tiempo restante: {time}',
  pay: 'Pagar ahora',
  processing: 'Procesando el pago…',
  cancel: 'Cancelar pago',
  expired: 'Ha vencido el plazo para completar el pago.',
  error: 'El pago no se ha completado. Comprueba los datos e inténtalo de nuevo.',
 },
 ru: {
  title: 'Завершите оплату',
  amount: 'К оплате',
  remaining: 'Осталось времени: {time}',
  pay: 'Оплатить',
  processing: 'Обработка платежа…',
  cancel: 'Отменить платёж',
  expired: 'Время для оплаты истекло.',
  error: 'Не удалось выполнить платёж. Проверьте данные и попробуйте снова.',
 },
}

function PaymentForm({
 locale,
 paymentIntentId,
 email,
 expiresAt,
 amount,
 onExpire,
 onCancel,
}: Omit<Props, 'clientSecret' | 'publishableKey'>) {
 const stripe = useStripe()
 const elements = useElements()
 const [remaining, setRemaining] = useState(Math.max(0, expiresAt - Date.now()))
 const [error, setError] = useState('')
 const [submitting, setSubmitting] = useState(false)
 const expired = useRef(false)
 const copy = COPY[locale]

 useEffect(() => {
  const updateRemaining = () => setRemaining(Math.max(0, expiresAt - Date.now()))
  updateRemaining()
  const interval = window.setInterval(updateRemaining, 1000)
  return () => window.clearInterval(interval)
 }, [expiresAt])

 useEffect(() => {
  if (remaining !== 0 || expired.current) return
  expired.current = true
  onExpire()
 }, [onExpire, remaining])

 const time = `${String(Math.floor(remaining / 60_000)).padStart(2, '0')}:${String(
  Math.floor((remaining % 60_000) / 1000),
 ).padStart(2, '0')}`

 async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault()
  if (!stripe || !elements || submitting || remaining <= 0) return
  setSubmitting(true)
  setError('')
  const { error: elementError } = await elements.submit()
  if (elementError) {
   setError(elementError.message || copy.error)
   setSubmitting(false)
   return
  }

  const successUrl = `${window.location.origin}/success?payment_intent_id=${encodeURIComponent(paymentIntentId)}`
  const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
   elements,
   confirmParams: { return_url: successUrl },
   redirect: 'if_required',
  })
  if (paymentError) {
   setError(paymentError.message || copy.error)
   setSubmitting(false)
   return
  }
  if (paymentIntent) window.location.assign(successUrl)
  else setSubmitting(false)
 }

 return (
  <form onSubmit={handleSubmit} className="space-y-5">
   <div className="flex items-center justify-between gap-4 rounded-lg bg-secondary px-4 py-3">
    <span className="text-sm text-muted-foreground">{copy.amount}</span>
    <span className="font-medium text-foreground">{amount}</span>
   </div>
   <p
    role="timer"
    aria-live="polite"
    className={`text-center text-sm font-medium ${remaining < 60_000 ? 'text-red-700' : 'text-foreground'}`}
   >
    {remaining > 0 ? copy.remaining.replace('{time}', time) : copy.expired}
   </p>
   {remaining > 0 && (
    <PaymentElement options={{ defaultValues: { billingDetails: { email } } }} />
   )}
   {error && (
    <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
     {error}
    </p>
   )}
   <div className="flex flex-col gap-3 sm:flex-row-reverse">
    <button
     type="submit"
     disabled={!stripe || !elements || submitting || remaining <= 0}
     className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
    >
     {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
     {submitting ? copy.processing : copy.pay}
    </button>
    <button
     type="button"
     disabled={submitting}
     onClick={onCancel}
     className="rounded-lg border border-border px-4 py-3 text-sm text-foreground hover:bg-secondary disabled:opacity-50"
    >
     {copy.cancel}
    </button>
   </div>
  </form>
 )
}

export function StripePaymentDialog(props: Props) {
 const stripePromise = useMemo(() => loadStripe(props.publishableKey), [props.publishableKey])
 const copy = COPY[props.locale]

 return (
  <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/55 p-4">
   <section
    role="dialog"
    aria-modal="true"
    aria-labelledby="stripe-payment-title"
    className="my-auto w-full max-w-lg rounded-2xl border border-border bg-background p-5 shadow-2xl sm:p-7"
   >
    <div className="mb-6 flex items-start justify-between gap-4">
     <h2 id="stripe-payment-title" className="font-serif text-2xl font-medium text-foreground">
      {copy.title}
     </h2>
     <button
      type="button"
      aria-label={copy.cancel}
      onClick={props.onCancel}
      className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
     >
      <X className="h-5 w-5" />
     </button>
    </div>
    <Elements
     stripe={stripePromise}
     options={{
      clientSecret: props.clientSecret,
      locale: props.locale,
      appearance: { theme: 'stripe', variables: { colorPrimary: '#8b7355', borderRadius: '8px' } },
     }}
    >
     <PaymentForm {...props} />
    </Elements>
   </section>
  </div>
 )
}
