import { json, type AdminEnv } from '../../_lib/admin'
import { getGuestBookings, requireGuest } from '../../_lib/guest'

type PagesContext = { request: Request; env: AdminEnv }

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const ids = await requireGuest(request, env)
  if (ids instanceof Response) return ids
  try {
    return json(await getGuestBookings(env, ids))
  } catch (error) {
    console.error('Guest bookings could not be loaded', error)
    return json({ error: 'Unable to load bookings' }, 500)
  }
}
