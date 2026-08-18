'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { nightsBetween, priceBreakdown, type PriceBreakdown } from '@/lib/booking'

export type Guests = {
  adults: number
  children: number
  pets: boolean
}

type AvailabilityDate = {
  date: string
  reason?: string
  source: 'admin' | 'ical'
}

type BookingState = {
  checkIn: Date | null
  checkOut: Date | null
  guests: Guests
  nights: number
  price: PriceBreakdown
  unavailableDates: Set<string>
  setCheckIn: (d: Date | null) => void
  setCheckOut: (d: Date | null) => void
  setRange: (checkIn: Date | null, checkOut: Date | null) => void
  setGuests: (g: Guests) => void
}

const BookingContext = createContext<BookingState | null>(null)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [guests, setGuests] = useState<Guests>({ adults: 2, children: 0, pets: false })
  const [unavailableDates, setUnavailableDates] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/public/availability')
      .then((r) => r.ok ? r.json() : null)
      .then((data: { dates: AvailabilityDate[] } | null) => {
        if (data?.dates) {
          setUnavailableDates(new Set(data.dates.map((d) => d.date)))
        }
      })
      .catch(() => {})
  }, [])

  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut])
  const guestCount = guests.adults + guests.children
  const price = useMemo(
    () => priceBreakdown(nights, guestCount),
    [nights, guestCount],
  )

  const value = useMemo<BookingState>(
    () => ({
      checkIn,
      checkOut,
      guests,
      nights,
      price,
      unavailableDates,
      setCheckIn,
      setCheckOut,
      setRange: (ci, co) => {
        setCheckIn(ci)
        setCheckOut(co)
      },
      setGuests,
    }),
    [checkIn, checkOut, guests, nights, price, unavailableDates],
  )

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

export function useBooking(): BookingState {
  const ctx = useContext(BookingContext)
  if (!ctx) {
    throw new Error('useBooking must be used within a BookingProvider')
  }
  return ctx
}
