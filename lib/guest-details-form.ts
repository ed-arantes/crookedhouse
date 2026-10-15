import type { Locale } from './i18n'

export type GuestDetailsFormValue = {
  guest_role: string
  first_name: string
  last_name: string
  date_of_birth: string
  place_of_birth: string
  nationality: string
  gender: string
  place_of_issue: string
  document_type: string
  document_number: string
}

const DATE_FORMATS: Record<Locale, { order: 'dmy' | 'mdy'; separator: '/' | '.' }> = {
  it: { order: 'dmy', separator: '/' },
  en: { order: 'mdy', separator: '/' },
  fr: { order: 'dmy', separator: '/' },
  de: { order: 'dmy', separator: '.' },
  es: { order: 'dmy', separator: '/' },
  ru: { order: 'dmy', separator: '.' },
}

export function formatGuestDate(iso: string, locale: Locale): string {
  if (!iso || iso.length < 10) return iso
  const [year, month, day] = iso.split('-')
  const { order, separator } = DATE_FORMATS[locale]
  return (order === 'mdy' ? [month, day, year] : [day, month, year]).join(separator)
}

export function parseGuestDate(value: string, locale: Locale): string | null {
  const { order, separator } = DATE_FORMATS[locale]
  const parts = value.trim().split(separator)
  if (parts.length !== 3) return null
  const [first, second, year] = parts
  const [day, month] = order === 'mdy' ? [second, first] : [first, second]
  if (!/^\d{2}$/.test(day) || !/^\d{2}$/.test(month) || !/^\d{4}$/.test(year)) return null
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  if (date.getUTCDate() !== Number(day) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCFullYear() !== Number(year)) return null
  return `${year}-${month}-${day}`
}

export function areGuestDetailsComplete(
  guests: readonly GuestDetailsFormValue[],
  locale: Locale,
  today = new Date().toISOString().slice(0, 10),
): boolean {
  if (guests.length === 0) return false

  return guests.every((guest, index) => {
    const dateOfBirth = parseGuestDate(guest.date_of_birth, locale)
    if (!guest.first_name.trim() || guest.first_name.trim().length > 120 ||
      !guest.last_name.trim() || guest.last_name.trim().length > 120 ||
      !dateOfBirth || dateOfBirth > today ||
      !guest.place_of_birth.trim() || guest.place_of_birth.trim().length > 120 ||
      !guest.nationality.trim() || guest.nationality.trim().length > 120 ||
      !guest.gender.trim() || guest.gender.trim().length > 60) return false

    if (index === 0 && (
      !['head_of_family', 'group_leader', 'single_guest'].includes(guest.guest_role) ||
      !guest.place_of_issue.trim() || guest.place_of_issue.trim().length > 120 ||
      !guest.document_type.trim() || guest.document_type.trim().length > 100 ||
      !guest.document_number.trim() || guest.document_number.trim().length > 100
    )) return false

    return true
  })
}

type BookingName = {
  first_name: string
  last_name: string
  adults: number
  children: number
}

type SavedGuestDetails = {
  guest_role?: string
  first_name?: string
  last_name?: string
  date_of_birth?: string
  place_of_birth?: string
  nationality?: string
  gender?: string
  place_of_issue?: string
  document_type?: string
  document_number?: string
}

export function guestDetailsFormValues(
  booking: BookingName,
  savedGuests: readonly SavedGuestDetails[] = [],
  locale: Locale = 'it',
): GuestDetailsFormValue[] {
  const guestCount = booking.adults + booking.children

  return Array.from({ length: guestCount }, (_, index) => {
    const savedGuest = savedGuests[index]
    return {
      guest_role: index === 0 ? savedGuest?.guest_role ?? (guestCount === 1 ? 'single_guest' : '') : '',
      first_name: savedGuest?.first_name?.trim() || (index === 0 ? booking.first_name.trim() : ''),
      last_name: savedGuest?.last_name?.trim() || (index === 0 ? booking.last_name.trim() : ''),
      date_of_birth: savedGuest?.date_of_birth ? formatGuestDate(savedGuest.date_of_birth, locale) : '',
      place_of_birth: savedGuest?.place_of_birth ?? '',
      nationality: savedGuest?.nationality ?? '',
      gender: savedGuest?.gender ?? '',
      place_of_issue: index === 0 ? savedGuest?.place_of_issue ?? '' : '',
      document_type: index === 0 ? savedGuest?.document_type ?? '' : '',
      document_number: index === 0 ? savedGuest?.document_number ?? '' : '',
    }
  })
}
