import { decrypt, json, type AdminEnv } from './admin'

type BookingRow = {
  id: string
  first_name_encrypted: string
  last_name_encrypted: string
  email_encrypted: string
  check_in: string
  check_out: string
  nights: number
  adults: number
  children: number
  pets: number
  total_price: number
  status: string
  created_at: string
}

function db(env: AdminEnv) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return env.DB as any
}

async function decryptValue(value: string, key: string): Promise<string> {
  if (!value || !key) return value
  try {
    return await decrypt(value, key)
  } catch {
    return value
  }
}

export async function getGuestBookings(env: AdminEnv, ids: string[]): Promise<Array<Record<string, unknown>>> {
  if (ids.length === 0) return []
  const placeholders = ids.map(() => '?').join(', ')
  const { results } = await db(env)
    .prepare(`SELECT id, first_name_encrypted, last_name_encrypted, email_encrypted, check_in, check_out, nights, adults, children, pets, total_price, status, created_at FROM bookings WHERE id IN (${placeholders}) ORDER BY check_in DESC`)
    .bind(...ids)
    .all()
  const key = env.BOOKING_ENCRYPTION_KEY || ''
  return Promise.all((results as BookingRow[]).map(async (row) => ({
    id: row.id,
    first_name: await decryptValue(row.first_name_encrypted, key),
    last_name: await decryptValue(row.last_name_encrypted, key),
    email: await decryptValue(row.email_encrypted, key),
    check_in: row.check_in,
    check_out: row.check_out,
    nights: row.nights,
    adults: row.adults,
    children: row.children,
    pets: row.pets,
    total_price: row.total_price,
    status: row.status,
    created_at: row.created_at,
  })))
}

function sessionCookie(request: Request, token: string, maxAge: number): string {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : ''
  return `guest_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`
}

export function clearGuestCookie(request: Request): string {
  return sessionCookie(request, '', 0)
}

export async function createGuestSession(
  request: Request,
  env: AdminEnv,
  bookingIds: string[],
): Promise<{ cookie: string }> {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  const token = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  const tokenHash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (env.DB as any).prepare(
    "INSERT INTO guest_sessions (token_hash, booking_ids, expires_at) VALUES (?, ?, datetime('now', '+7 days'))",
  ).bind(tokenHash, JSON.stringify(bookingIds)).run()
  return { cookie: sessionCookie(request, token, 7 * 24 * 60 * 60) }
}

export async function getGuestBookingIds(request: Request, env: AdminEnv): Promise<string[] | null> {
  const token = request.headers.get('Cookie')
    ?.split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith('guest_session='))
    ?.slice('guest_session='.length)
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null

  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  const tokenHash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = await (env.DB as any).prepare(
    "SELECT booking_ids FROM guest_sessions WHERE token_hash = ? AND expires_at > datetime('now')",
  ).bind(tokenHash).first() as { booking_ids: string } | null
  if (!row) return null

  try {
    const ids: unknown = JSON.parse(row.booking_ids)
    return Array.isArray(ids) && ids.every((id) => typeof id === 'string') ? ids : null
  } catch {
    return null
  }
}

export async function requireGuest(request: Request, env: AdminEnv): Promise<string[] | Response> {
  try {
    const ids = await getGuestBookingIds(request, env)
    return ids ?? json({ error: 'Access denied' }, 401)
  } catch (error) {
    console.error('Guest session lookup failed', error)
    return json({ error: 'Unable to verify guest session' }, 500)
  }
}
