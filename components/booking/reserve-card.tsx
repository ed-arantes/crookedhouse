'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  NIGHTLY_RATE,
  formatCurrency,
  formatShort,
} from '@/lib/booking'
import { useBooking } from './booking-context'
import { Popover } from './popover'
import { RangeCalendar } from './range-calendar'
import { GuestSelector, guestLabel } from './guest-selector'

function TriggerField({
  label,
  value,
  placeholder,
}: {
  label: string
  value?: string
  placeholder: string
}) {
  return (
    <div className="px-4 py-2.5 text-left">
      <span className="block text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          'block text-sm',
          value ? 'text-foreground' : 'text-muted-foreground/70',
        )}
      >
        {value || placeholder}
      </span>
    </div>
  )
}

export function ReserveCard() {
  const { checkIn, checkOut, guests, nights, price, setRange, setGuests } =
    useBooking()

  function handleReserve() {
    document
      .getElementById('booking')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
      <div className="flex items-baseline justify-between">
        <p className="font-serif text-2xl text-foreground">
          {formatCurrency(NIGHTLY_RATE)}{' '}
          <span className="text-base text-muted-foreground">/ night</span>
        </p>
        <span className="flex items-center gap-1 text-sm text-foreground">
          <Star className="h-4 w-4 fill-accent text-accent" />
          <span className="font-medium">4.96</span>
          <span className="text-muted-foreground">(184)</span>
        </span>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-border">
        <Popover
          panelClassName="w-[19rem] sm:w-auto"
          trigger={({ toggle }) => (
            <button
              type="button"
              onClick={toggle}
              className="grid w-full grid-cols-2 divide-x divide-border border-b border-border transition-colors hover:bg-muted/50"
            >
              <TriggerField
                label="Check in"
                value={formatShort(checkIn)}
                placeholder="Add date"
              />
              <TriggerField
                label="Check out"
                value={formatShort(checkOut)}
                placeholder="Add date"
              />
            </button>
          )}
        >
          {() => (
            <RangeCalendar
              checkIn={checkIn}
              checkOut={checkOut}
              onChange={setRange}
            />
          )}
        </Popover>

        <Popover
          trigger={({ toggle }) => (
            <button
              type="button"
              onClick={toggle}
              className="w-full transition-colors hover:bg-muted/50"
            >
              <TriggerField
                label="Guests"
                value={guestLabel(guests)}
                placeholder="Add guests"
              />
            </button>
          )}
        >
          {() => <GuestSelector guests={guests} onChange={setGuests} />}
        </Popover>
      </div>

      <button
        type="button"
        onClick={handleReserve}
        className="mt-4 w-full rounded-xl bg-accent px-6 py-3.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
      >
        {nights > 0 ? 'Reserve your stay' : 'Check availability'}
      </button>

      {nights > 0 ? (
        <div className="mt-5 space-y-2.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span className="underline underline-offset-2">
              {formatCurrency(NIGHTLY_RATE)} × {nights} night
              {nights === 1 ? '' : 's'}
            </span>
            <span className="text-foreground">
              {formatCurrency(price.subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span className="underline underline-offset-2">Cleaning fee</span>
            <span className="text-foreground">
              {formatCurrency(price.cleaning)}
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span className="underline underline-offset-2">Service fee</span>
            <span className="text-foreground">
              {formatCurrency(price.service)}
            </span>
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-base font-medium text-foreground">
            <span>Total</span>
            <span>{formatCurrency(price.total)}</span>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          You won&apos;t be charged yet
        </p>
      )}
    </div>
  )
}
