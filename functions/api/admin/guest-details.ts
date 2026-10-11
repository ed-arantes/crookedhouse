import { json, requireAdmin, type AdminEnv } from '../../_lib/admin'
import {
  deleteBookingGuestDetails,
  getBookingGuestCount,
  getGuestDetailsEncryptionKey,
  readBookingGuestDetails,
  saveBookingGuestDetails,
} from '../../_lib/booking-guest-details'

type PagesContext = { request: Request; env: AdminEnv }

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthorized = requireAdmin(env, request)
  if (unauthorized) return unauthorized
  const bookingId = new URL(request.url).searchParams.get('booking_id')
  if (!bookingId) return json({ error: 'Missing booking id' }, 400)

  try {
    const key = await getGuestDetailsEncryptionKey(env)
    if (key instanceof Response) return key
    const count = await getBookingGuestCount(env, bookingId)
    if (count === null) return json({ error: 'Booking not found' }, 404)
    return json({ guests: await readBookingGuestDetails(env, bookingId, key) })
  } catch (error) {
    console.error('Admin could not load guest details', error)
    return json({ error: 'Unable to load guest details' }, 500)
  }
}

export const onRequestPut = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthorized = requireAdmin(env, request)
  if (unauthorized) return unauthorized
  const body = await request.json().catch(() => null) as {
    booking_id?: unknown
    guests?: unknown
  } | null
  const bookingId = typeof body?.booking_id === 'string' ? body.booking_id : ''
  if (!bookingId) return json({ error: 'Missing booking id' }, 400)

  try {
    const failure = await saveBookingGuestDetails(env, bookingId, body?.guests)
    return failure ?? json({ ok: true })
  } catch (error) {
    console.error('Admin could not update guest details', error)
    return json({ error: 'Unable to save guest details' }, 500)
  }
}

export const onRequestDelete = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthorized = requireAdmin(env, request)
  if (unauthorized) return unauthorized
  const bookingId = new URL(request.url).searchParams.get('booking_id')
  if (!bookingId) return json({ error: 'Missing booking id' }, 400)

  try {
    const deleted = await deleteBookingGuestDetails(env, bookingId)
    return json({ ok: true, deleted })
  } catch (error) {
    console.error('Admin could not delete guest details', error)
    return json({ error: 'Unable to delete guest details' }, 500)
  }
}
