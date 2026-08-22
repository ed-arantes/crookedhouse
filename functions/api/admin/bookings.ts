import {
  json,
  requireAdmin,
  decrypt,
  type AdminEnv,
} from '../../_lib/admin'

type PagesContext = {
  request: Request
  env: AdminEnv
}

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const encKey = env.BOOKING_ENCRYPTION_KEY
  const url = new URL(request.url)
  const status = url.searchParams.get('status')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = env.DB as any

  let query = 'SELECT * FROM bookings'
  const params: string[] = []
  if (status && ['pending', 'paid', 'cancelled'].includes(status)) {
    query += ' WHERE status = ?'
    params.push(status)
  }
  query += ' ORDER BY created_at DESC'

  const { results } = await db.prepare(query).bind(...params).all()
  const enc = encKey || ''

  const bookings = await Promise.all(results.map(async (row: any) => {
    // Try to decrypt, fall back to raw value if decryption fails (unencrypted data)
    async function safeDecrypt(val: string, key: string): Promise<string> {
      if (!val) return ''
      if (!key) return val
      try {
        return await decrypt(val, key)
      } catch {
        return val
      }
    }

    return {
      id: row.id,
      session_id: row.session_id,
      first_name: await safeDecrypt(String(row.first_name_encrypted), enc),
      last_name: await safeDecrypt(String(row.last_name_encrypted), enc),
      email: await safeDecrypt(String(row.email_encrypted), enc),
      check_in: row.check_in,
      check_out: row.check_out,
      nights: row.nights,
      adults: row.adults,
      children: row.children,
      pets: row.pets,
      message: row.message_encrypted ? await safeDecrypt(String(row.message_encrypted), enc) : '',
      total_price: row.total_price,
      status: row.status,
      created_at: row.created_at,
    }
  }))

  return json(bookings)
}

export const onRequestDelete = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return json({ error: 'Missing id' }, 400)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = env.DB as any
  const result = await db.prepare('DELETE FROM bookings WHERE id = ?').bind(id).run()
  if (result.meta?.changes === 0) return json({ error: 'Booking not found' }, 404)

  return json({ ok: true })
}

export const onRequestPut = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const body = await request.json().catch(() => null) as { id?: string; status?: string } | null
  if (!body?.id || !body?.status) return json({ error: 'Missing id or status' }, 400)

  if (!['pending', 'paid', 'cancelled'].includes(body.status)) {
    return json({ error: 'Invalid status' }, 400)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = env.DB as any
  const result = await db.prepare('UPDATE bookings SET status = ? WHERE id = ?')
    .bind(body.status, body.id).run()

  if (result.meta?.changes === 0) return json({ error: 'Booking not found' }, 404)
  return json({ ok: true })
}
