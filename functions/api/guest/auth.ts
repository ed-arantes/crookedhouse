import { clearGuestCookie, createGuestSession, getGuestBookingIds } from '../../_lib/guest'
import { decrypt, json, type AdminEnv } from '../../_lib/admin'

type PagesContext = { request: Request; env: AdminEnv }

type BookingIdentity = {
  id: string
  last_name_encrypted: string
  email_encrypted: string
}

async function readValue(value: string, key: string): Promise<string> {
  if (!key) return value
  try {
    return await decrypt(value, key)
  } catch {
    return value
  }
}

export const onRequestPost = async ({ request, env }: PagesContext): Promise<Response> => {
  const body = await request.json().catch(() => null) as { surname?: unknown; email?: unknown } | null
  const surname = typeof body?.surname === 'string' ? body.surname.trim().toLocaleLowerCase() : ''
  const email = typeof body?.email === 'string' ? body.email.trim().toLocaleLowerCase() : ''
  if (!surname || surname.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return json({ error: 'Inserisci cognome ed email validi.' }, 400)
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { results } = await (env.DB as any).prepare(
      'SELECT id, last_name_encrypted, email_encrypted FROM bookings',
    ).all()
    const key = env.BOOKING_ENCRYPTION_KEY || ''
    const matches: string[] = []
    for (const row of results as BookingIdentity[]) {
      const [storedSurname, storedEmail] = await Promise.all([
        readValue(row.last_name_encrypted, key),
        readValue(row.email_encrypted, key),
      ])
      if (storedSurname.trim().toLocaleLowerCase() === surname &&
        storedEmail.trim().toLocaleLowerCase() === email) {
        matches.push(row.id)
      }
    }
    if (matches.length === 0) return json({ error: 'Nessuna prenotazione trovata con questi dati.' }, 401)

    const { cookie } = await createGuestSession(request, env, matches)
    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'Set-Cookie': cookie,
      },
    })
  } catch (error) {
    console.error('Guest login failed', error)
    return json({ error: 'Accesso non disponibile. Riprova più tardi.' }, 500)
  }
}

export const onRequestDelete = async ({ request, env }: PagesContext): Promise<Response> => {
  try {
    const ids = await getGuestBookingIds(request, env)
    if (ids) {
    const token = request.headers.get('Cookie')
      ?.split(';').map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith('guest_session='))?.slice('guest_session='.length)
    if (token) {
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
      const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (env.DB as any).prepare('DELETE FROM guest_sessions WHERE token_hash = ?').bind(hash).run()
    }
    }
  } catch (error) {
    console.error('Guest logout failed', error)
    return json({ error: 'Unable to end guest session' }, 500)
  }
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Set-Cookie': clearGuestCookie(request),
    },
  })
}
