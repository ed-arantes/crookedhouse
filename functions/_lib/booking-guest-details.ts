import { decrypt, encrypt, json, type AdminEnv } from './admin'

export type BookingGuestDetails = {
  first_name: string
  last_name: string
  date_of_birth: string
  document_number?: string
}

type GuestCountRow = {
  adults: number
  children: number
}

type GuestDetailsRow = {
  details_encrypted: string
}

function getEncryptionKey(env: AdminEnv): string | Response {
  const key = env.BOOKING_ENCRYPTION_KEY
  if (!key || !/^[a-f0-9]{64}$/i.test(key)) {
    return json({ error: 'Guest details encryption is not configured' }, 500)
  }
  return key
}

export function validateGuestDetails(value: unknown, expectedCount: number): value is BookingGuestDetails[] {
  if (!Array.isArray(value) || value.length !== expectedCount) return false
  const today = new Date().toISOString().slice(0, 10)

  return value.every((guest, index) => {
    if (!guest || typeof guest !== 'object' || Array.isArray(guest)) return false
    const details = guest as Record<string, unknown>
    const firstName = typeof details.first_name === 'string' ? details.first_name.trim() : ''
    const lastName = typeof details.last_name === 'string' ? details.last_name.trim() : ''
    const dateOfBirth = typeof details.date_of_birth === 'string' ? details.date_of_birth : ''
    const documentNumber = typeof details.document_number === 'string' ? details.document_number.trim() : ''

    if (!firstName || firstName.length > 120 || !lastName || lastName.length > 120) return false
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) ||
      Number.isNaN(Date.parse(`${dateOfBirth}T00:00:00.000Z`)) ||
      new Date(`${dateOfBirth}T00:00:00.000Z`).toISOString().slice(0, 10) !== dateOfBirth ||
      dateOfBirth > today) return false
    if (index === 0 && (!documentNumber || documentNumber.length > 100)) return false
    if (index > 0 && documentNumber) return false
    return true
  })
}

export async function getBookingGuestCount(
  env: AdminEnv,
  bookingId: string,
): Promise<number | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const booking = await (env.DB as any).prepare(
    'SELECT adults, children FROM bookings WHERE id = ?',
  ).bind(bookingId).first() as GuestCountRow | null
  return booking ? Number(booking.adults) + Number(booking.children) : null
}

export async function readBookingGuestDetails(
  env: AdminEnv,
  bookingId: string,
  key: string,
): Promise<BookingGuestDetails[] | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = await (env.DB as any).prepare(
    'SELECT details_encrypted FROM booking_guest_details WHERE booking_id = ?',
  ).bind(bookingId).first() as GuestDetailsRow | null
  if (!row) return null

  const details: unknown = JSON.parse(await decrypt(row.details_encrypted, key))
  const guestCount = await getBookingGuestCount(env, bookingId)
  if (guestCount === null || !validateGuestDetails(details, guestCount)) {
    throw new Error('Stored guest details are invalid')
  }
  return details
}

export async function saveBookingGuestDetails(
  env: AdminEnv,
  bookingId: string,
  value: unknown,
): Promise<Response | null> {
  const key = getEncryptionKey(env)
  if (key instanceof Response) return key

  const guestCount = await getBookingGuestCount(env, bookingId)
  if (guestCount === null) return json({ error: 'Booking not found' }, 404)
  if (!validateGuestDetails(value, guestCount)) {
    return json({ error: 'Enter valid details for each guest and a document number for the group leader' }, 400)
  }

  const details = value.map((guest) => {
    const documentNumber = guest.document_number?.trim()
    return {
      first_name: guest.first_name.trim(),
      last_name: guest.last_name.trim(),
      date_of_birth: guest.date_of_birth,
      ...(documentNumber ? { document_number: documentNumber } : {}),
    }
  })
  const encrypted = await encrypt(JSON.stringify(details), key)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (env.DB as any).prepare(
    `INSERT INTO booking_guest_details (booking_id, details_encrypted, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(booking_id) DO UPDATE SET
       details_encrypted = excluded.details_encrypted,
       updated_at = excluded.updated_at`,
  ).bind(bookingId, encrypted).run()
  return null
}

export async function deleteBookingGuestDetails(env: AdminEnv, bookingId: string): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (env.DB as any).prepare(
    'DELETE FROM booking_guest_details WHERE booking_id = ?',
  ).bind(bookingId).run()
  return result.meta?.changes > 0
}

export async function getGuestDetailsEncryptionKey(env: AdminEnv): Promise<string | Response> {
  return getEncryptionKey(env)
}
