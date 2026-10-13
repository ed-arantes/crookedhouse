import { decrypt, encrypt, json, type AdminEnv } from '../../_lib/admin'
import { requireGuest } from '../../_lib/guest'

type PagesContext = { request: Request; env: AdminEnv }
type MessageRow = { id: string; booking_id: string; sender: 'guest' | 'host'; message_encrypted: string; created_at: string }

async function readMessage(value: string, key: string): Promise<string> {
  try {
    return await decrypt(value, key)
  } catch {
    return value
  }
}

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const ids = await requireGuest(request, env)
  if (ids instanceof Response) return ids
  const bookingId = new URL(request.url).searchParams.get('booking_id')
  if (!bookingId || !ids.includes(bookingId)) return json({ error: 'Booking not found' }, 404)

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { results } = await (env.DB as any).prepare(
      'SELECT id, booking_id, sender, message_encrypted, created_at FROM booking_messages WHERE booking_id = ? ORDER BY created_at, rowid',
    ).bind(bookingId).all()
    const key = env.BOOKING_ENCRYPTION_KEY || ''
    const messages = await Promise.all((results as MessageRow[]).map(async (row) => ({
      id: row.id,
      booking_id: row.booking_id,
      sender: row.sender,
      message: await readMessage(row.message_encrypted, key),
      created_at: row.created_at,
    })))
    return json(messages)
  } catch (error) {
    console.error('Guest messages could not be loaded', error)
    return json({ error: 'Unable to load messages' }, 500)
  }
}

export const onRequestPost = async ({ request, env }: PagesContext): Promise<Response> => {
  const ids = await requireGuest(request, env)
  if (ids instanceof Response) return ids
  const body = await request.json().catch(() => null) as { booking_id?: unknown; message?: unknown } | null
  const bookingId = typeof body?.booking_id === 'string' ? body.booking_id : ''
  const message = typeof body?.message === 'string' ? body.message.trim() : ''
  if (!bookingId || !ids.includes(bookingId)) return json({ error: 'Booking not found' }, 404)
  if (!message || message.length > 2000) return json({ error: 'Message must be between 1 and 2000 characters' }, 400)
  const key = env.BOOKING_ENCRYPTION_KEY
  if (!key) return json({ error: 'Messaging is not configured' }, 500)

  try {
    const id = crypto.randomUUID()
    const encrypted = await encrypt(message, key)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (env.DB as any).prepare(
      "INSERT INTO booking_messages (id, booking_id, sender, message_encrypted) VALUES (?, ?, 'guest', ?)",
    ).bind(id, bookingId, encrypted).run()
    return json({ ok: true, id })
  } catch (error) {
    console.error('Guest message could not be saved', error)
    return json({ error: 'Unable to send message' }, 500)
  }
}
