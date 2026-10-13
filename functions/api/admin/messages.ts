import { decrypt, encrypt, json, requireAdmin, type AdminEnv } from '../../_lib/admin'

type PagesContext = { request: Request; env: AdminEnv }

type MessageRow = {
  id: string
  booking_id: string
  sender: 'guest' | 'host'
  message_encrypted: string
  created_at: string
  first_name_encrypted: string
  last_name_encrypted: string
  email_encrypted: string
  check_in: string
  check_out: string
}

async function readValue(value: string, key: string): Promise<string> {
  try {
    return await decrypt(value, key)
  } catch {
    return value
  }
}

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { results } = await (env.DB as any).prepare(
      `SELECT m.id, m.booking_id, m.sender, m.message_encrypted, m.created_at,
        b.first_name_encrypted, b.last_name_encrypted, b.email_encrypted, b.check_in, b.check_out
       FROM booking_messages m JOIN bookings b ON b.id = m.booking_id
       ORDER BY m.created_at DESC, m.rowid DESC`,
    ).all()
    const key = env.BOOKING_ENCRYPTION_KEY || ''
    const messages = await Promise.all((results as MessageRow[]).map(async (row) => ({
      id: row.id,
      booking_id: row.booking_id,
      sender: row.sender,
      message: await readValue(row.message_encrypted, key),
      created_at: row.created_at,
      guest_name: `${await readValue(row.first_name_encrypted, key)} ${await readValue(row.last_name_encrypted, key)}`.trim(),
      guest_email: await readValue(row.email_encrypted, key),
      check_in: row.check_in,
      check_out: row.check_out,
    })))
    return json(messages)
  } catch (error) {
    console.error('Admin messages could not be loaded', error)
    return json({ error: 'Unable to load messages' }, 500)
  }
}

export const onRequestPost = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed
  const body = await request.json().catch(() => null) as { booking_id?: unknown; message?: unknown } | null
  const bookingId = typeof body?.booking_id === 'string' ? body.booking_id : ''
  const message = typeof body?.message === 'string' ? body.message.trim() : ''
  if (!bookingId || !message || message.length > 2000) {
    return json({ error: 'A booking and a message of up to 2000 characters are required' }, 400)
  }
  const key = env.BOOKING_ENCRYPTION_KEY
  if (!key) return json({ error: 'Messaging is not configured' }, 500)

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const booking = await (env.DB as any).prepare('SELECT id FROM bookings WHERE id = ?')
      .bind(bookingId).first()
    if (!booking) return json({ error: 'Booking not found' }, 404)
    const encrypted = await encrypt(message, key)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (env.DB as any).prepare(
      "INSERT INTO booking_messages (id, booking_id, sender, message_encrypted) VALUES (?, ?, 'host', ?)",
    ).bind(crypto.randomUUID(), bookingId, encrypted).run()
    return json({ ok: true })
  } catch (error) {
    console.error('Admin reply could not be saved', error)
    return json({ error: 'Unable to send reply' }, 500)
  }
}
