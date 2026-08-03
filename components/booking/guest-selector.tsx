'use client'

import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

type Guests = { adults: number; children: number }

const MAX_GUESTS = 6

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
}: {
  guests: Guests
  onChange: (g: Guests) => void
  className?: string
}) {
  const total = guests.adults + guests.children

  return (
    <div className={cn('w-72 divide-y divide-border p-4', className)}>
      <Stepper
        label="Adults"
        hint="Ages 13 or above"
        value={guests.adults}
        min={1}
        onChange={(adults) => onChange({ ...guests, adults })}
        disabledDecrement={guests.adults <= 1}
        disabledIncrement={total >= MAX_GUESTS}
      />
      <Stepper
        label="Children"
        hint="Ages 2–12"
        value={guests.children}
        min={0}
        onChange={(children) => onChange({ ...guests, children })}
        disabledDecrement={guests.children <= 0}
        disabledIncrement={total >= MAX_GUESTS}
      />
      <p className="pt-3 text-xs text-muted-foreground">
        This suite hosts up to {MAX_GUESTS} guests.
      </p>
    </div>
  )
}

export function guestLabel(guests: Guests): string {
  const total = guests.adults + guests.children
  return `${total} guest${total === 1 ? '' : 's'}`
}
