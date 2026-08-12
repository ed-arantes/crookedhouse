'use client'

import { CalendarDays, MapPin, Search, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { formatShort } from '@/lib/booking'
import { t, type Locale } from '@/lib/i18n'
import { useBooking } from './booking-context'
import { Popover } from './popover'
import { RangeCalendar } from './range-calendar'
import { GuestSelector, guestLabel } from './guest-selector'

function Field({
 icon,
 label,
 value,
 placeholder,
 active,
}: {
 icon: React.ReactNode
 label: string
 value?: string
 placeholder: string
 active?: boolean
}) {
 return (
  <div className="flex items-center gap-3 px-5 py-3 text-left">
   <span className="text-primary">{icon}</span>
   <span className="min-w-0">
    <span className="block text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
     {label}
    </span>
    <span
     className={cn(
      'block truncate text-sm',
      value ? 'text-foreground' : 'text-muted-foreground/70',
      active && 'font-medium',
     )}
    >
     {value || placeholder}
    </span>
   </span>
  </div>
 )
}

const Divider = () => (
 <span className="hidden h-10 w-px bg-border md:block" aria-hidden="true" />
)

export function SearchBar({ locale = 'en' }: { locale?: Locale }) {
 const { checkIn, checkOut, guests, setRange, setGuests } = useBooking()
 const [showDateToast, setShowDateToast] = useState(false)

 useEffect(() => {
  if (!showDateToast) return
  const timeout = window.setTimeout(() => setShowDateToast(false), 3500)
  return () => window.clearTimeout(timeout)
 }, [showDateToast])

 function handleReserve() {
  if (!checkIn || !checkOut) {
   setShowDateToast(true)
  }
  document
   .getElementById('booking')
   ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
 }

  return (
  <>
  <div className="mx-auto flex w-fit max-w-full flex-col gap-2 rounded-2xl border border-border bg-card/95 p-2 backdrop-blur md:flex-row md:flex-nowrap md:items-center md:gap-0 md:rounded-full md:p-2">
   <div className="hidden md:block">
    <Field
     icon={<MapPin className="h-4 w-4" />}
     label={t(locale, 'widgets.where')}
     value={t(locale, 'widgets.location')}
     placeholder={t(locale, 'widgets.locationPlaceholder')}
    />
   </div>
   <Divider />

   <Popover
    side="top"
    panelClassName="w-[19rem] sm:w-auto"
    trigger={({ toggle }) => (
     <button
      type="button"
      onClick={toggle}
      className="rounded-xl transition-colors hover:bg-muted/60 md:rounded-full"
     >
      <div className="flex">
       <Field
        icon={<CalendarDays className="h-4 w-4" />}
        label={t(locale, 'widgets.checkIn')}
        value={formatShort(checkIn, locale)}
        placeholder={t(locale, 'widgets.addDate')}
        active={!!checkIn}
       />
       <Field
        icon={<CalendarDays className="h-4 w-4 opacity-0" />}
        label={t(locale, 'widgets.checkOut')}
        value={formatShort(checkOut, locale)}
        placeholder={t(locale, 'widgets.addDate')}
        active={!!checkOut}
       />
      </div>
     </button>
    )}
   >
    {() => (
     <RangeCalendar
      checkIn={checkIn}
      checkOut={checkOut}
      onChange={setRange}
      locale={locale}
      months={typeof window !== 'undefined' && window.innerWidth >= 640 ? 2 : 1}
     />
    )}
   </Popover>

   <Divider />

   <Popover
    align="end"
    side="top"
    trigger={({ toggle }) => (
     <button
      type="button"
      onClick={toggle}
      className="rounded-xl transition-colors hover:bg-muted/60 md:rounded-full"
     >
      <Field
       icon={<Users className="h-4 w-4" />}
       label={t(locale, 'widgets.guests')}
       value={guestLabel(guests, locale)}
       placeholder={t(locale, 'widgets.addGuests')}
       active
      />
     </button>
    )}
   >
    {() => <GuestSelector guests={guests} onChange={setGuests} locale={locale} />}
   </Popover>

   <button
    type="button"
    onClick={handleReserve}
    className="ml-2 flex shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 md:ml-4 md:mr-2 md:rounded-full"
   >
    <Search className="h-4 w-4" />
    <span>{t(locale, 'widgets.reserve')}</span>
   </button>
  </div>
  {showDateToast && (
   <div
    role="status"
    className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-foreground shadow-lg"
   >
    {t(locale, 'widgets.enterDates')}
   </div>
  )}
  </>
 )
}
