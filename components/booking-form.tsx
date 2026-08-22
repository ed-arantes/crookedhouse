'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, LoaderCircle, Users } from 'lucide-react'
import { useBooking } from './booking/booking-context'
import { Popover } from './booking/popover'
import { RangeCalendar } from './booking/range-calendar'
import { GuestSelector, guestLabel } from './booking/guest-selector'
import { formatLong, formatCurrency } from '@/lib/booking'
import { t, type Locale } from '@/lib/i18n'
import { apiUrl } from '@/lib/api-url'

export function BookingForm({ locale = 'en' }: { locale?: Locale }) {
 const { checkIn, checkOut, guests, nights, price, unavailableDates, setRange, setGuests } =
  useBooking()
 const [isLoadingPayment, setIsLoadingPayment] = useState(false)

 useEffect(() => {
  function resetPaymentState() {
   setIsLoadingPayment(false)
  }

  window.addEventListener('pageshow', resetPaymentState)
  return () => window.removeEventListener('pageshow', resetPaymentState)
 }, [])

 async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault()
  if (nights <= 0) return
  setIsLoadingPayment(true)

  try {
   const response = await fetch(apiUrl('/api/checkout'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
     checkIn: checkIn?.toISOString().slice(0, 10),
     checkOut: checkOut?.toISOString().slice(0, 10),
     guests,
    }),
   })
   const data = await response.json()
   if (!response.ok || !data?.url) throw new Error(data?.error || 'Unable to create checkout session')
   window.location.href = data.url
  } catch (error) {
   console.error('Booking checkout failed', error)
   setIsLoadingPayment(false)
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
          disabled={isLoadingPayment}
          aria-busy={isLoadingPayment}
          className="w-full rounded-xl bg-accent px-6 py-3.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
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
   </div>
  </section>
 )
}
