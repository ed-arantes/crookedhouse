'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { t, type Locale } from '@/lib/i18n'
import {
  addMonths,
  buildMonthGrid,
  isBefore,
  isBetween,
  isSameDay,
  startOfDay,
} from '@/lib/booking'

type RangeCalendarProps = {
  checkIn: Date | null
  checkOut: Date | null
  onChange: (checkIn: Date | null, checkOut: Date | null) => void
  months?: number
  locale?: Locale
}

function MonthView({
  viewDate,
  checkIn,
  checkOut,
  today,
  onSelect,
  locale,
}: {
  viewDate: Date
  checkIn: Date | null
  checkOut: Date | null
  today: Date
  onSelect: (day: Date) => void
  locale: Locale
}) {
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const cells = buildMonthGrid(year, month)
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(2024, 0, i + 8)),
  )
  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(viewDate)

  return (
    <div className="w-[17rem]">
      <p className="mb-3 text-center font-serif text-lg font-medium text-foreground">
        {monthLabel}
      </p>
      <div className="grid grid-cols-7 gap-y-1">
        {weekdays.map((wd) => (
          <div
            key={wd}
            className="pb-1 text-center text-xs font-medium text-muted-foreground"
          >
            {wd}
          </div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} aria-hidden="true" />
          const disabled = isBefore(day, today)
          const isStart = isSameDay(day, checkIn)
          const isEnd = isSameDay(day, checkOut)
          const inRange = isBetween(day, checkIn, checkOut)
          const isEdge = isStart || isEnd
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'relative flex items-center justify-center',
                inRange && 'bg-primary/10',
                isStart && checkOut && 'rounded-l-full bg-primary/10',
                isEnd && 'rounded-r-full bg-primary/10',
              )}
            >
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(day)}
                aria-label={day.toDateString()}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors',
                  !disabled &&
                    !isEdge &&
                    'text-foreground hover:bg-primary/15',
                  disabled && 'cursor-not-allowed text-muted-foreground/40',
                  isEdge &&
                    'bg-primary font-medium text-primary-foreground hover:bg-primary',
                )}
              >
                {day.getDate()}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function RangeCalendar({
  checkIn,
  checkOut,
  onChange,
  months = 1,
  locale = 'en',
}: RangeCalendarProps) {
  const today = startOfDay(new Date())
  const [viewDate, setViewDate] = useState<Date>(checkIn ?? today)

  function handleSelect(day: Date) {
    // No start yet, or a full range exists -> start fresh.
    if (!checkIn || (checkIn && checkOut)) {
      onChange(day, null)
      return
    }
    // Selecting before the start resets the start.
    if (isBefore(day, checkIn) || isSameDay(day, checkIn)) {
      onChange(day, null)
      return
    }
    onChange(checkIn, day)
  }

  return (
    <div className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewDate((d) => addMonths(d, -1))}
          disabled={
            viewDate.getFullYear() === today.getFullYear() &&
            viewDate.getMonth() === today.getMonth()
          }
          aria-label={t(locale, 'widgets.previousMonth')}
          className="flex h-8 w-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setViewDate((d) => addMonths(d, 1))}
          aria-label={t(locale, 'widgets.nextMonth')}
          className="flex h-8 w-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-col gap-6 sm:flex-row">
        {Array.from({ length: months }).map((_, i) => (
          <MonthView
            key={i}
            viewDate={addMonths(viewDate, i)}
            checkIn={checkIn}
            checkOut={checkOut}
            today={today}
            onSelect={handleSelect}
            locale={locale}
          />
        ))}
      </div>
    </div>
  )
}
