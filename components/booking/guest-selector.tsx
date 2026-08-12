'use client'

import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { t, type Locale } from '@/lib/i18n'
import type { Guests } from './booking-context'

const MAX_GUESTS = 4

function Stepper({
  label,
  hint,
  value,
  min,
  onChange,
  disabledDecrement,
  disabledIncrement,
}: {
  label: string
  hint: string
  value: number
  min: number
  onChange: (next: number) => void
  disabledDecrement: boolean
  disabledIncrement: boolean
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={disabledDecrement}
          aria-label={`Decrease ${label}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-foreground disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-4 text-center text-sm tabular-nums text-foreground">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          disabled={disabledIncrement}
          aria-label={`Increase ${label}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-foreground disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export function GuestSelector({
  guests,
  onChange,
  className,
  locale = 'en',
}: {
  guests: Guests
  onChange: (g: Guests) => void
  className?: string
  locale?: Locale
}) {
  const total = guests.adults + guests.children

  return (
    <div className={cn('w-72 divide-y divide-border p-4', className)}>
      <Stepper
        label={t(locale, 'widgets.adults')}
        hint={t(locale, 'widgets.adultsHint')}
        value={guests.adults}
        min={1}
        onChange={(adults) => onChange({ ...guests, adults })}
        disabledDecrement={guests.adults <= 1}
        disabledIncrement={total >= MAX_GUESTS}
      />
      <Stepper
        label={t(locale, 'widgets.children')}
        hint={t(locale, 'widgets.childrenHint')}
        value={guests.children}
        min={0}
        onChange={(children) => onChange({ ...guests, children })}
        disabledDecrement={guests.children <= 0}
        disabledIncrement={total >= MAX_GUESTS}
      />
      <label className="flex items-center gap-3 py-3 text-sm text-foreground">
        <input
          type="checkbox"
          checked={guests.pets}
          onChange={(event) => onChange({ ...guests, pets: event.target.checked })}
          className="h-4 w-4 rounded border-border accent-primary"
        />
        {t(locale, 'widgets.pets')}
      </label>
      <p className="pt-3 text-xs text-muted-foreground">
        {t(locale, 'widgets.maxGuests').replace('{count}', String(MAX_GUESTS))}
      </p>
    </div>
  )
}

export function guestLabel(guests: Guests, locale: Locale = 'en'): string {
  const total = guests.adults + guests.children
  const key = total === 1 ? 'widgets.guestLabel' : 'widgets.guestLabels'
  const label = t(locale, key, { count: total })
  return guests.pets ? `${label} · ${t(locale, 'widgets.pets')}` : label
}
