import { formatEU } from './format-date'

export type GuestDetailsFormValue = {
  first_name: string
  last_name: string
  date_of_birth: string
  document_number: string
}

type BookingName = {
  first_name: string
  last_name: string
  adults: number
  children: number
}

type SavedGuestDetails = {
  first_name?: string
  last_name?: string
  date_of_birth?: string
  document_number?: string
}

export function guestDetailsFormValues(
  booking: BookingName,
  savedGuests: readonly SavedGuestDetails[] = [],
): GuestDetailsFormValue[] {
  const guestCount = booking.adults + booking.children

  return Array.from({ length: guestCount }, (_, index) => {
    const savedGuest = savedGuests[index]
    return {
      first_name: savedGuest?.first_name?.trim() || (index === 0 ? booking.first_name.trim() : ''),
      last_name: savedGuest?.last_name?.trim() || (index === 0 ? booking.last_name.trim() : ''),
      date_of_birth: savedGuest?.date_of_birth ? formatEU(savedGuest.date_of_birth) : '',
      document_number: index === 0 ? savedGuest?.document_number ?? '' : '',
    }
  })
}
