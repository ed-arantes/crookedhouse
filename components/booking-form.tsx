'use client'

import { useEffect, useRef, useState } from 'react'
import { CalendarDays, LoaderCircle, Users } from 'lucide-react'
import { CheckoutGuestDialog } from './booking/checkout-guest-dialog'
import { StripePaymentDialog } from './booking/stripe-payment-dialog'
import { useBooking } from './booking/booking-context'
import { Popover } from './booking/popover'
import { RangeCalendar } from './booking/range-calendar'
import { GuestSelector, guestLabel } from './booking/guest-selector'
import { formatDateLocal, formatLong, formatCurrency } from '@/lib/booking'
import type { GuestDetailsFormValue } from '@/lib/guest-details-form'
import { t, type Locale } from '@/lib/i18n'
import { apiUrl } from '@/lib/api-url'

type CheckoutContact = {
 firstName: string
 lastName: string
 email: string
 message: string
}

type CheckoutGuestDetails = Omit<GuestDetailsFormValue, 'date_of_birth'> & {
 date_of_birth: string
}

type CheckoutPayment = {
 paymentIntentId: string
 clientSecret: string
 publishableKey: string
 email: string
 amount: number
 expiresAt: number
}

const CANCELLATION_COPY: Record<Locale, string> = {
 it: 'Le cancellazioni sono consentite solo fino a 7 giorni prima della data di arrivo.',
 en: 'Cancellations are allowed only up to 7 days before the arrival date.',
 fr: 'Les annulations sont autorisées uniquement jusqu’à 7 jours avant la date d’arrivée.',
 de: 'Stornierungen sind nur bis 7 Tage vor dem Anreisedatum möglich.',
 es: 'Las cancelaciones solo se permiten hasta 7 días antes de la fecha de llegada.',
 ru: 'Отмена бронирования возможна не позднее чем за 7 дней до даты заезда.',
}

export function BookingForm({ locale = 'en' }: { locale?: Locale }) {
 const { checkIn, checkOut, guests, nights, price, unavailableDates, setRange, setGuests } =
  useBooking()
 const [isLoadingPayment, setIsLoadingPayment] = useState(false)
 const [checkoutError, setCheckoutError] = useState('')
 const [isGuestDetailsOpen, setIsGuestDetailsOpen] = useState(false)
 const [checkoutContact, setCheckoutContact] = useState<CheckoutContact | null>(null)
 const [checkoutPayment, setCheckoutPayment] = useState<CheckoutPayment | null>(null)
 const closingPaymentIds = useRef(new Set<string>())

 useEffect(() => {
  function resetPaymentState() {
   setIsLoadingPayment(false)
  }

  window.addEventListener('pageshow', resetPaymentState)
  return () => window.removeEventListener('pageshow', resetPaymentState)
 }, [])

 function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault()
  if (nights <= 0 || !checkIn || !checkOut) return
  setCheckoutError('')

  const form = e.currentTarget
  const formData = new FormData(form)
  setCheckoutContact({
   firstName: String(formData.get('firstName') || ''),
   lastName: String(formData.get('lastName') || ''),
   email: String(formData.get('email') || ''),
   message: String(formData.get('message') || ''),
  })
  setIsGuestDetailsOpen(true)
 }

 async function startCheckout(guestDetails?: CheckoutGuestDetails[]) {
  if (!checkoutContact || !checkIn || !checkOut || nights <= 0) return
  setIsLoadingPayment(true)
  setCheckoutError('')
  try {
   const response = await fetch(apiUrl('/api/checkout'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
     checkIn: checkIn ? formatDateLocal(checkIn) : undefined,
     checkOut: checkOut ? formatDateLocal(checkOut) : undefined,
     guests,
     ...checkoutContact,
     ...(guestDetails ? { guestDetails } : {}),
    }),
   })
   const data = await response.json() as Partial<CheckoutPayment> & { error?: string }
   if (!response.ok || typeof data.paymentIntentId !== 'string' ||
    typeof data.clientSecret !== 'string' || typeof data.publishableKey !== 'string' ||
    typeof data.email !== 'string' ||
    typeof data.amount !== 'number' || !Number.isFinite(data.amount) || data.amount <= 0 ||
    typeof data.expiresAt !== 'number' || !Number.isFinite(data.expiresAt)) {
    throw new Error(data.error || 'Unable to create payment intent')
   }
   setIsGuestDetailsOpen(false)
   setCheckoutPayment({
    paymentIntentId: data.paymentIntentId,
    clientSecret: data.clientSecret,
    publishableKey: data.publishableKey,
    email: data.email,
    amount: data.amount,
    expiresAt: data.expiresAt,
   })
   setIsLoadingPayment(false)
  } catch (error) {
   console.error('Booking checkout failed', error)
   setCheckoutError(t(locale, 'errors.checkout'))
   setIsLoadingPayment(false)
  }
 }

 async function closeCheckoutPayment(paymentIntentId: string, cancel: boolean) {
  if (closingPaymentIds.current.has(paymentIntentId)) return
  closingPaymentIds.current.add(paymentIntentId)
  try {
   const response = await fetch(apiUrl('/api/checkout-expire'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentIntentId, ...(cancel ? { cancel: true } : {}) }),
   })
   const data = await response.json() as { error?: string; status?: string }
   if (!response.ok) throw new Error(data.error || 'Unable to close payment')
   if (data.status === 'paid' || data.status === 'already_final') {
    window.location.assign(`/success?payment_intent_id=${encodeURIComponent(paymentIntentId)}`)
    return
   }
   setCheckoutPayment(null)
   setCheckoutError(cancel
    ? locale === 'it' ? 'Pagamento annullato.' : locale === 'fr' ? 'Paiement annulé.' : locale === 'de' ? 'Zahlung abgebrochen.' : locale === 'es' ? 'Pago cancelado.' : locale === 'ru' ? 'Платёж отменён.' : 'Payment cancelled.'
    : locale === 'it' ? 'Il tempo per completare il pagamento è scaduto.' : locale === 'fr' ? 'Le délai de paiement a expiré.' : locale === 'de' ? 'Die Zahlungsfrist ist abgelaufen.' : locale === 'es' ? 'Ha vencido el plazo para completar el pago.' : locale === 'ru' ? 'Время для оплаты истекло.' : 'The payment time limit has expired.')
  } catch (error) {
   console.error('Closing booking payment failed', error)
   setCheckoutPayment(null)
   setCheckoutError(locale === 'it'
    ? 'Non è stato possibile chiudere il pagamento. Riprova o contattaci.'
    : locale === 'fr'
     ? 'Impossible de clôturer le paiement. Réessayez ou contactez-nous.'
     : locale === 'de'
      ? 'Die Zahlung konnte nicht beendet werden. Bitte versuchen Sie es erneut oder kontaktieren Sie uns.'
      : locale === 'es'
       ? 'No se pudo cerrar el pago. Inténtalo de nuevo o contáctanos.'
       : locale === 'ru'
        ? 'Не удалось завершить платёж. Попробуйте ещё раз или свяжитесь с нами.'
        : 'Unable to close the payment. Please retry or contact us.')
  } finally {
   closingPaymentIds.current.delete(paymentIntentId)
  }
 }

 return (
   <section id="booking" className="bg-secondary/60 py-20 md:py-28">
   <div className="mx-auto max-w-5xl px-5 md:px-8">
    <div className="mx-auto max-w-2xl text-center">
     <h2 className="type-heading text-balance font-serif font-medium text-foreground">
      {t(locale, 'booking.headline')}
     </h2>
    </div>

    <div className="mt-12 rounded-3xl border border-border bg-card">
      <form onSubmit={handleSubmit} className="grid gap-0 md:grid-cols-2">
       <div className="space-y-5 p-6 md:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
         <div>
          <label
           htmlFor="firstName"
           className="mb-1.5 block text-sm font-medium text-foreground"
          >
           {t(locale, 'booking.firstName')}
          </label>
          <input
           id="firstName"
           name="firstName"
           required
           maxLength={120}
           className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
         </div>
         <div>
          <label
           htmlFor="lastName"
           className="mb-1.5 block text-sm font-medium text-foreground"
          >
           {t(locale, 'booking.lastName')}
          </label>
          <input
           id="lastName"
           name="lastName"
           required
           maxLength={120}
           className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
         </div>
        </div>

        <div>
         <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-foreground"
         >
          {t(locale, 'booking.email')}
         </label>
         <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={254}
          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
         />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
         <div>
          <span className="mb-1.5 block text-sm font-medium text-foreground">
           {t(locale, 'booking.dates')}
          </span>
          <Popover
           panelClassName="w-[19rem] sm:w-auto"
           trigger={({ toggle }) => (
            <button
             type="button"
             onClick={toggle}
             className="flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3.5 py-2.5 text-left text-sm text-foreground transition-colors hover:border-foreground/40"
            >
             <CalendarDays className="h-4 w-4 text-primary" />
             <span className={checkIn ? '' : 'text-muted-foreground/70'}>
              {checkIn && checkOut
               ? `${formatLong(checkIn, locale)} – ${formatLong(checkOut, locale)}`
               : t(locale, 'booking.selectDates')}
             </span>
            </button>
           )}
          >
           {() => (
            <RangeCalendar
             checkIn={checkIn}
             checkOut={checkOut}
             onChange={setRange}
             locale={locale}
             disabledDates={unavailableDates}
            />
           )}
          </Popover>
         </div>
         <div>
          <span className="mb-1.5 block text-sm font-medium text-foreground">
           {t(locale, 'booking.guests')}
          </span>
          <Popover
           align="end"
           trigger={({ toggle }) => (
            <button
             type="button"
             onClick={toggle}
             className="flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3.5 py-2.5 text-left text-sm text-foreground transition-colors hover:border-foreground/40"
            >
             <Users className="h-4 w-4 text-primary" />
             {guestLabel(guests, locale)}
            </button>
           )}
          >
           {() => (
            <GuestSelector guests={guests} onChange={setGuests} locale={locale} />
           )}
          </Popover>
         </div>
        </div>

        <div>
         <label
          htmlFor="message"
          className="mb-1.5 block text-sm font-medium text-foreground"
         >
          {t(locale, 'booking.message')}
         </label>
         <textarea
          id="message"
          name="message"
          rows={3}
          maxLength={2000}
          placeholder={t(locale, 'booking.messagePlaceholder')}
          className="w-full resize-none rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
         />
        </div>
       </div>

       <div className="flex flex-col justify-between gap-6 border-t border-border bg-secondary/50 p-6 md:border-l md:border-t-0 md:p-8">
        <div>
         <h3 className="type-heading font-serif text-foreground">
          {t(locale, 'booking.detailsTitle')}
         </h3>
         <p className="mt-1 text-sm text-muted-foreground">
          {t(locale, 'booking.location')}
         </p>

         <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between">
           <dt className="text-muted-foreground">{t(locale, 'booking.checkIn')}</dt>
           <dd className="text-foreground">
            {checkIn ? formatLong(checkIn, locale) : ''}
           </dd>
          </div>
          <div className="flex justify-between">
           <dt className="text-muted-foreground">{t(locale, 'booking.checkOut')}</dt>
           <dd className="text-foreground">
            {checkOut ? formatLong(checkOut, locale) : ''}
           </dd>
          </div>
          <div className="flex justify-between">
           <dt className="text-muted-foreground">{t(locale, 'booking.guests')}</dt>
           <dd className="text-foreground">{guestLabel(guests, locale)}</dd>
          </div>
         </dl>
         <p className="mt-4 rounded-lg border border-border bg-background px-3 py-2.5 text-xs text-muted-foreground">
          {CANCELLATION_COPY[locale]}
         </p>

         {checkoutError && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
           {checkoutError}
          </div>
         )}

         {nights > 0 && (
          <dl className="mt-5 space-y-2.5 border-t border-border pt-5 text-sm">
           <div className="flex justify-between">
            <dt className="text-muted-foreground">
             {formatCurrency(price.subtotal / nights)} × {nights}{' '}
             {nights === 1 ? t(locale, 'widgets.night') : t(locale, 'widgets.nights')}
            </dt>
            <dd className="text-foreground">
             {formatCurrency(price.subtotal)}
            </dd>
           </div>
           <div className="flex justify-between">
            <dt className="text-muted-foreground">{t(locale, 'widgets.councilTax')}</dt>
            <dd className="text-foreground">
             {formatCurrency(price.councilTax)}
            </dd>
           </div>
           {price.animalSurcharge > 0 && (
            <div className="flex justify-between">
             <dt className="text-muted-foreground">{t(locale, 'widgets.animalSurcharge')}</dt>
             <dd className="text-foreground">{formatCurrency(price.animalSurcharge)}</dd>
            </div>
           )}
           <div className="flex justify-between border-t border-border pt-3 text-base font-medium text-foreground">
            <dt>{t(locale, 'widgets.total')}</dt>
            <dd>{formatCurrency(price.total)}</dd>
           </div>
          </dl>
         )}
        </div>

        {nights > 0 && (
         <button
         type="submit"
          disabled={isLoadingPayment || isGuestDetailsOpen || !!checkoutPayment}
          aria-busy={isLoadingPayment}
          className="w-full rounded-xl bg-accent px-6 py-3.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
         >
          {isLoadingPayment ? (
           <span className="flex items-center justify-center gap-2">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            {t(locale, 'booking.processingPayment')}
           </span>
          ) : (
           t(locale, 'booking.proceedToPayment')
          )}
         </button>
        )}
       </div>
      </form>
    </div>
    {isGuestDetailsOpen && checkoutContact && checkIn && (
     <CheckoutGuestDialog
      locale={locale}
      booking={{
       first_name: checkoutContact.firstName,
       last_name: checkoutContact.lastName,
       adults: guests.adults,
       children: guests.children,
       check_in: formatDateLocal(checkIn),
       nights,
      }}
      submitting={isLoadingPayment}
      error={checkoutError}
      onSubmit={(guestDetails) => startCheckout(guestDetails)}
      onSkip={() => startCheckout()}
      onClose={() => setIsGuestDetailsOpen(false)}
     />
    )}
    {checkoutPayment && (
      <StripePaymentDialog
       {...checkoutPayment}
       locale={locale}
       amount={formatCurrency(checkoutPayment.amount)}
       onExpire={() => closeCheckoutPayment(checkoutPayment.paymentIntentId, false)}
       onCancel={() => closeCheckoutPayment(checkoutPayment.paymentIntentId, true)}
      />
    )}
   </div>
  </section>
 )
}
