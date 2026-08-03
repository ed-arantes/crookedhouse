'use client'

import { useState } from 'react'
import { CalendarDays, Check, Users } from 'lucide-react'
import { useBooking } from './booking/booking-context'
import { Popover } from './booking/popover'
import { RangeCalendar } from './booking/range-calendar'
import { GuestSelector, guestLabel } from './booking/guest-selector'
import { formatLong, formatCurrency } from '@/lib/booking'

export function BookingForm() {
  const { checkIn, checkOut, guests, nights, price, setRange, setGuests } =
    useBooking()
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section id="booking" className="bg-secondary/60 py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-5 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-medium uppercase tracking-widest text-accent">
            Request to book
          </span>
          <h2 className="mt-3 text-balance font-serif text-4xl font-medium text-foreground md:text-5xl">
            Reserve your escape
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Send us your dates and we&apos;ll confirm availability within 24
            hours. No payment is taken until your stay is confirmed.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
          {submitted ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-7 w-7" />
              </span>
              <h3 className="mt-6 font-serif text-3xl text-foreground">
                Request received
              </h3>
              <p className="mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground">
                Thank you — we&apos;ve got your request
                {checkIn && checkOut
                  ? ` for ${formatLong(checkIn)} to ${formatLong(checkOut)}`
                  : ''}
                . Anna will personally reply to confirm your suite very soon.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-8 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Make another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-0 md:grid-cols-2">
              <div className="space-y-5 p-6 md:p-8">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      First name
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
                      Last name
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
                    Email
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
                      Dates
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
                              ? `${formatLong(checkIn)} – ${formatLong(checkOut)}`
                              : 'Select dates'}
                          </span>
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
                  </div>
                  <div>
                    <span className="mb-1.5 block text-sm font-medium text-foreground">
                      Guests
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
                          {guestLabel(guests)}
                        </button>
                      )}
                    >
                      {() => (
                        <GuestSelector guests={guests} onChange={setGuests} />
                      )}
                    </Popover>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Anything we should know?
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    placeholder="Special occasions, dietary needs, arrival time…"
                    className="w-full resize-none rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-between gap-6 border-t border-border bg-secondary/50 p-6 md:border-l md:border-t-0 md:p-8">
                <div>
                  <h3 className="font-serif text-2xl text-foreground">
                    Crooked House
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Grandola ed Uniti · Lake Como
                  </p>

                  <dl className="mt-6 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Check in</dt>
                      <dd className="text-foreground">
                        {checkIn ? formatLong(checkIn) : '—'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Check out</dt>
                      <dd className="text-foreground">
                        {checkOut ? formatLong(checkOut) : '—'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Guests</dt>
                      <dd className="text-foreground">{guestLabel(guests)}</dd>
                    </div>
                  </dl>

                  {nights > 0 && (
                    <dl className="mt-5 space-y-2.5 border-t border-border pt-5 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">
                          {formatCurrency(price.subtotal / nights)} × {nights}{' '}
                          night{nights === 1 ? '' : 's'}
                        </dt>
                        <dd className="text-foreground">
                          {formatCurrency(price.subtotal)}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Cleaning fee</dt>
                        <dd className="text-foreground">
                          {formatCurrency(price.cleaning)}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Service fee</dt>
                        <dd className="text-foreground">
                          {formatCurrency(price.service)}
                        </dd>
                      </div>
                      <div className="flex justify-between border-t border-border pt-3 text-base font-medium text-foreground">
                        <dt>Total</dt>
                        <dd>{formatCurrency(price.total)}</dd>
                      </div>
                    </dl>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-accent px-6 py-3.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
                >
                  Request to book
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
