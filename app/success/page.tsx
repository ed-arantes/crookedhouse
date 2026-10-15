'use client'

import { useEffect, useState } from 'react'
import { SuccessRedirect } from '@/components/success-redirect'
import { apiUrl } from '@/lib/api-url'
import { getLocalePreference } from '@/lib/locale-detection'
import { locales, type Locale } from '@/lib/i18n'

type State = 'loading' | 'missing' | 'invalid' | 'failed' | 'unpaid' | 'processing' | 'cancelled' | 'paid'

const COPY: Record<Locale, Record<State | 'payment' | 'contact' | 'confirmed' | 'processed' | 'paymentConfirmed', string>> = {
 it: {
  loading: 'Verifica del pagamento in corso…',
  missing: 'Sessione mancante',
  invalid: 'Sessione di pagamento non valida',
  failed: 'Non è stato possibile verificare il pagamento',
  unpaid: 'Pagamento non completato',
  processing: 'Pagamento in elaborazione',
  cancelled: 'Pagamento annullato',
  paid: 'Grazie per aver prenotato Crooked House',
  payment: 'Pagamento',
  contact: 'Se hai completato il pagamento ma non hai ricevuto una conferma, contattaci.',
  confirmed: 'Prenotazione confermata',
  processed: 'Il pagamento è stato elaborato correttamente. Ti contatteremo a breve con i dettagli finali della conferma.',
  paymentConfirmed: 'Pagamento confermato',
 },
 en: {
  loading: 'Verifying your payment…',
  missing: 'Missing session',
  invalid: 'Invalid payment session',
  failed: 'We could not verify this payment',
  unpaid: 'Payment is not complete',
  processing: 'Payment is processing',
  cancelled: 'Payment was cancelled',
  paid: 'Thanks for booking Crooked House',
  payment: 'Payment',
  contact: 'Please contact us if you completed a payment and do not receive confirmation.',
  confirmed: 'Booking confirmed',
  processed: 'Your payment was processed successfully. We’ll be in touch shortly with the final confirmation details.',
  paymentConfirmed: 'Payment confirmed',
 },
 fr: {
  loading: 'Vérification de votre paiement…',
  missing: 'Session manquante',
  invalid: 'Session de paiement invalide',
  failed: 'Nous n’avons pas pu vérifier ce paiement',
  unpaid: 'Le paiement n’est pas terminé',
  processing: 'Paiement en cours de traitement',
  cancelled: 'Paiement annulé',
  paid: 'Merci d’avoir réservé Crooked House',
  payment: 'Paiement',
  contact: 'Si vous avez effectué le paiement sans recevoir de confirmation, contactez-nous.',
  confirmed: 'Réservation confirmée',
  processed: 'Votre paiement a bien été traité. Nous vous contacterons bientôt avec les détails de confirmation.',
  paymentConfirmed: 'Paiement confirmé',
 },
 de: {
  loading: 'Zahlung wird überprüft…',
  missing: 'Sitzung fehlt',
  invalid: 'Ungültige Zahlungssitzung',
  failed: 'Wir konnten diese Zahlung nicht überprüfen',
  unpaid: 'Zahlung nicht abgeschlossen',
  processing: 'Zahlung wird verarbeitet',
  cancelled: 'Zahlung wurde abgebrochen',
  paid: 'Vielen Dank für Ihre Buchung im Crooked House',
  payment: 'Zahlung',
  contact: 'Bitte kontaktieren Sie uns, wenn Sie bezahlt, aber keine Bestätigung erhalten haben.',
  confirmed: 'Buchung bestätigt',
  processed: 'Ihre Zahlung wurde erfolgreich verarbeitet. Wir melden uns in Kürze mit den endgültigen Bestätigungsdetails.',
  paymentConfirmed: 'Zahlung bestätigt',
 },
 es: {
  loading: 'Verificando el pago…',
  missing: 'Falta la sesión',
  invalid: 'La sesión de pago no es válida',
  failed: 'No hemos podido verificar el pago',
  unpaid: 'El pago no se ha completado',
  processing: 'El pago se está procesando',
  cancelled: 'El pago se ha cancelado',
  paid: 'Gracias por reservar en Crooked House',
  payment: 'Pago',
  contact: 'Si has completado el pago y no has recibido confirmación, contacta con nosotros.',
  confirmed: 'Reserva confirmada',
  processed: 'El pago se ha procesado correctamente. Nos pondremos en contacto contigo pronto con los detalles finales de la confirmación.',
  paymentConfirmed: 'Pago confirmado',
 },
 ru: {
  loading: 'Проверка платежа…',
  missing: 'Сессия не найдена',
  invalid: 'Недействительная платёжная сессия',
  failed: 'Не удалось проверить платёж',
  unpaid: 'Платёж не завершён',
  processing: 'Платёж обрабатывается',
  cancelled: 'Платёж отменён',
  paid: 'Спасибо за бронирование Crooked House',
  payment: 'Платёж',
  contact: 'Если вы завершили оплату, но не получили подтверждение, свяжитесь с нами.',
  confirmed: 'Бронирование подтверждено',
  processed: 'Платёж успешно обработан. Скоро мы свяжемся с вами и сообщим окончательные детали подтверждения.',
  paymentConfirmed: 'Платёж подтверждён',
 },
}

function getLocale(value: string | null): Locale | null {
 return value && locales.includes(value as Locale) ? value as Locale : null
}

export default function SuccessPage() {
 const [state, setState] = useState<State>('loading')
 const [locale, setLocale] = useState<Locale | null>(null)

 useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const activeLocale = getLocale(params.get('locale'))
   ?? getLocalePreference(document.cookie)
   ?? 'en'
  setLocale(activeLocale)

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

 const copy = COPY[locale ?? 'en']

 if (state === 'loading') {
  return (
   <main className="flex min-h-screen items-center justify-center bg-background px-5 text-center">
    <p className="text-sm text-muted-foreground">{copy.loading}</p>
   </main>
  )
 }

 if (state === 'missing' || state === 'invalid' || state === 'failed') {
  const title = state === 'missing' ? copy.missing : state === 'invalid' ? copy.invalid : copy.failed
  return (
   <main className="flex min-h-screen items-center justify-center bg-background px-5 text-center">
    <div>
     <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">{copy.payment}</p>
     <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">{title}</h1>
     {state !== 'missing' && <p className="mt-4 text-sm text-muted-foreground">{copy.contact}</p>}
    </div>
   </main>
  )
 }

 if (state === 'unpaid' || state === 'processing' || state === 'cancelled') {
  const message = state === 'unpaid'
   ? locale === 'it' ? 'Non abbiamo ricevuto il pagamento per questa sessione.'
    : locale === 'fr' ? 'Nous n’avons pas reçu de paiement finalisé pour cette session.'
     : locale === 'de' ? 'Für diese Sitzung ist keine abgeschlossene Zahlung eingegangen.'
      : locale === 'es' ? 'No hemos recibido un pago completado para esta sesión.'
       : locale === 'ru' ? 'Мы не получили завершённый платёж для этой сессии.'
        : 'We have not received a completed payment for this session.'
   : state === 'processing'
    ? locale === 'it' ? 'Confermeremo la prenotazione non appena il pagamento sarà completato.'
     : locale === 'fr' ? 'Nous confirmerons votre réservation dès que le paiement sera terminé.'
      : locale === 'de' ? 'Wir bestätigen Ihre Buchung, sobald die Zahlung abgeschlossen ist.'
       : locale === 'es' ? 'Confirmaremos tu reserva en cuanto se complete el pago.'
        : locale === 'ru' ? 'Мы подтвердим бронирование, как только платёж будет завершён.'
         : 'We will confirm your booking as soon as the payment is complete.'
    : locale === 'it' ? 'Non è stato completato alcun pagamento per questa prenotazione.'
     : locale === 'fr' ? 'Aucun paiement n’a été effectué pour cette réservation.'
      : locale === 'de' ? 'Für diese Buchung wurde keine Zahlung abgeschlossen.'
       : locale === 'es' ? 'No se ha completado ningún pago para esta reserva.'
        : locale === 'ru' ? 'Оплата этого бронирования не была завершена.'
         : 'No payment was completed for this booking.'
  const title = state === 'unpaid' ? copy.unpaid : state === 'processing' ? copy.processing : copy.cancelled

  return (
   <main className="flex min-h-screen items-center justify-center bg-background px-5 text-center">
    <div>
     <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">{copy.payment}</p>
     <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">{title}</h1>
     <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
   </main>
  )
 }

 return (
  <main className="flex min-h-screen items-center justify-center bg-background px-5 text-center">
   <div className="max-w-xl">
    <p className="text-xs font-medium uppercase tracking-[0.28em] text-accent">{copy.confirmed}</p>
    <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">{copy.paid}</h1>
    <p className="mt-4 text-base text-muted-foreground">{copy.processed}</p>
    <p className="mt-2 text-sm text-muted-foreground">{copy.paymentConfirmed}</p>
    {locale && <SuccessRedirect locale={locale} />}
   </div>
  </main>
 )
}
