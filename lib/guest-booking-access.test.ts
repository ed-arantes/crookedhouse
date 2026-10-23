import assert from 'node:assert/strict'
import test from 'node:test'
import { onRequestGet } from '../functions/api/guest/account'
import type { AdminEnv } from '../functions/_lib/admin'
import { encrypt } from './encryption'

const encryptionKey = 'a'.repeat(64)
const guestToken = 'b'.repeat(64)

async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function createGuestEnv(bookingIds: string | null, bookingRow: Record<string, unknown>) {
  let bookingQueries = 0
  const tokenHashPromise = hashToken(guestToken)
  const env = {
    AI: { run: async () => null },
    BOOKING_ENCRYPTION_KEY: encryptionKey,
    DB: {
      prepare(query: string) {
        let parameters: unknown[] = []
        const statement = {
          bind(...values: unknown[]) {
            parameters = values
            return statement
          },
          async first() {
            if (query.includes('SELECT booking_ids')) {
              const expectedHash = await tokenHashPromise
              return parameters[0] === expectedHash && bookingIds
                ? { booking_ids: bookingIds }
                : null
            }
            throw new Error(`Unexpected database query: ${query}`)
          },
          async all() {
            if (query.includes('SELECT id, first_name_encrypted')) {
              bookingQueries++
              return { results: [bookingRow] }
            }
            throw new Error(`Unexpected database query: ${query}`)
          },
        }
        return statement
      },
    },
    IMAGES: {},
  } as AdminEnv
  return { env, getBookingQueries: () => bookingQueries }
}

test('guest account retrieves encrypted booking form names only for an authenticated guest session', async () => {
  const bookingRow = {
    id: 'booking-1',
    first_name_encrypted: await encrypt('Maria', encryptionKey),
    last_name_encrypted: await encrypt('Rossi', encryptionKey),
    email_encrypted: await encrypt('maria@example.com', encryptionKey),
    check_in: '2026-12-10',
    check_out: '2026-12-12',
    nights: 2,
    adults: 2,
    children: 0,
    pets: 0,
    total_price: 300,
    status: 'paid',
    created_at: '2026-10-11 00:00:00',
  }

  const unauthorized = createGuestEnv(null, bookingRow)
  const deniedResponse = await onRequestGet({
    request: new Request('https://example.com/api/guest/account'),
    env: unauthorized.env,
  })
  assert.equal(deniedResponse.status, 401)
  assert.equal(unauthorized.getBookingQueries(), 0)

  const authorized = createGuestEnv(JSON.stringify(['booking-1']), bookingRow)
  const response = await onRequestGet({
    request: new Request('https://example.com/api/guest/account', {
      headers: { Cookie: `guest_session=${guestToken}` },
    }),
    env: authorized.env,
  })

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), [{
    id: 'booking-1',
    first_name: 'Maria',
    last_name: 'Rossi',
    email: 'maria@example.com',
    check_in: '2026-12-10',
    check_out: '2026-12-12',
    nights: 2,
    adults: 2,
    children: 0,
    pets: 0,
    total_price: 300,
    status: 'paid',
    created_at: '2026-10-11 00:00:00',
  }])
  assert.equal(authorized.getBookingQueries(), 1)
})
