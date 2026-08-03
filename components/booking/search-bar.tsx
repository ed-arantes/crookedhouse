'use client'

import { CalendarDays, MapPin, Search, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatShort } from '@/lib/booking'
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

export function SearchBar() {
  const { checkIn, checkOut, guests, setRange, setGuests } = useBooking()

  function handleReserve() {
    document
      .getElementById('booking')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex w-full flex-col gap-2 rounded-2xl border border-border bg-card/95 p-2 shadow-xl backdrop-blur md:flex-row md:items-center md:gap-0 md:rounded-full md:p-1.5">
      <div className="hidden md:block">
        <Field
          icon={<MapPin className="h-4 w-4" />}
          label="Where"
          value="Crooked House, Lake Como"
          placeholder="Crooked House, Lake Como"
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
            className="flex-1 rounded-xl transition-colors hover:bg-muted/60 md:rounded-full"
          >
            <div className="flex">
              <Field
                icon={<CalendarDays className="h-4 w-4" />}
                label="Check in"
                value={formatShort(checkIn)}
                placeholder="Add date"
                active={!!checkIn}
              />
              <Field
                icon={<CalendarDays className="h-4 w-4 opacity-0" />}
                label="Check out"
                value={formatShort(checkOut)}
                placeholder="Add date"
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
              label="Guests"
              value={guestLabel(guests)}
              placeholder="Add guests"
              active
            />
          </button>
        )}
      >
        {() => <GuestSelector guests={guests} onChange={setGuests} />}
      </Popover>

      <button
        type="button"
        onClick={handleReserve}
        className="flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 md:ml-1 md:rounded-full"
      >
        <Search className="h-4 w-4" />
        <span>Reserve</span>
      </button>
    </div>
  )
}
