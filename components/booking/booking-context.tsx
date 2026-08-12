'use client'

import {
  createContext,
  useContext,
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

type BookingState = {
  checkIn: Date | null
  checkOut: Date | null
  guests: Guests
  nights: number
  price: PriceBreakdown
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
      setCheckIn,
      setCheckOut,
      setRange: (ci, co) => {
        setCheckIn(ci)
        setCheckOut(co)
      },
      setGuests,
    }),
    [checkIn, checkOut, guests, nights, price],
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
