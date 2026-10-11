import { json, type AdminEnv } from '../../_lib/admin'
import {
  deleteBookingGuestDetails,
  getGuestDetailsEncryptionKey,
  readBookingGuestDetails,
  saveBookingGuestDetails,
} from '../../_lib/booking-guest-details'
import { requireGuest } from '../../_lib/guest'

type PagesContext = { request: Request; env: AdminEnv }

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const bookingIds = await requireGuest(request, env)
  if (bookingIds instanceof Response) return bookingIds
  const bookingId = new URL(request.url).searchParams.get('booking_id')
  if (!bookingId || !bookingIds.includes(bookingId)) return json({ error: 'Booking not found' }, 404)

  try {
    const key = await getGuestDetailsEncryptionKey(env)
    if (key instanceof Response) return key
    return json({ guests: await readBookingGuestDetails(env, bookingId, key) })
  } catch (error) {
    console.error('Guest details could not be loaded', error)
    return json({ error: 'Unable to load guest details' }, 500)
  }
}

export const onRequestPut = async ({ request, env }: PagesContext): Promise<Response> => {
  const bookingIds = await requireGuest(request, env)
  if (bookingIds instanceof Response) return bookingIds
  const body = await request.json().catch(() => null) as {
    booking_id?: unknown
    guests?: unknown
  } | null
  const bookingId = typeof body?.booking_id === 'string' ? body.booking_id : ''
  if (!bookingId || !bookingIds.includes(bookingId)) return json({ error: 'Booking not found' }, 404)

  try {
    const failure = await saveBookingGuestDetails(env, bookingId, body?.guests)
    return failure ?? json({ ok: true })
  } catch (error) {
    console.error('Guest details could not be saved', error)
    return json({ error: 'Unable to save guest details' }, 500)
  }
}

export const onRequestDelete = async ({ request, env }: PagesContext): Promise<Response> => {
  const bookingIds = await requireGuest(request, env)
  if (bookingIds instanceof Response) return bookingIds
  const bookingId = new URL(request.url).searchParams.get('booking_id')
  if (!bookingId || !bookingIds.includes(bookingId)) return json({ error: 'Booking not found' }, 404)

  try {
    const deleted = await deleteBookingGuestDetails(env, bookingId)
    return json({ ok: true, deleted })
  } catch (error) {
    console.error('Guest details could not be deleted', error)
    return json({ error: 'Unable to delete guest details' }, 500)
  }
}
