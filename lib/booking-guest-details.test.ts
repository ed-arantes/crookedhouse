import assert from 'node:assert/strict'
import test from 'node:test'
import { saveBookingGuestDetails, readBookingGuestDetails, validateGuestDetails } from '../functions/_lib/booking-guest-details'
import type { AdminEnv } from '../functions/_lib/admin'
import { onRequestPost } from '../functions/api/checkout'
import { expirePaymentIntent, handlePaymentExpirationRequest, PAYMENT_WINDOW_MS } from '../functions/_lib/payment-expiration'
import { formatGuestDate, parseGuestDate } from './guest-details-form'
import type { Locale } from './i18n'

const validGuests = [
  {
    guest_role: 'group_leader',
    first_name: 'Maria',
    last_name: 'Rossi',
    date_of_birth: '1990-02-15',
    place_of_birth: 'Roma',
    nationality: 'Italian',
    gender: 'Female',
    place_of_issue: 'Roma',
    document_type: 'identity_card',
    document_number: 'ID-12345',
  },
  {
    first_name: 'Luca',
    last_name: 'Rossi',
    date_of_birth: '2015-06-20',
    place_of_birth: 'Milano',
    nationality: 'Italian',
    gender: 'Male',
  },
]

test('formats and parses dates with each supported locale', () => {
  const expectedDates: Array<[Locale, string]> = [
    ['it', '15/02/1990'],
    ['en', '02/15/1990'],
    ['fr', '15/02/1990'],
    ['de', '15.02.1990'],
    ['es', '15/02/1990'],
    ['ru', '15.02.1990'],
  ]

  for (const [locale, expected] of expectedDates) {
    assert.equal(formatGuestDate('1990-02-15', locale), expected)
    assert.equal(parseGuestDate(expected, locale), '1990-02-15')
  }
})

test('requires complete details for every guest and an ID for the group leader only', () => {
  assert.equal(validateGuestDetails(validGuests, 2), true)
  assert.equal(validateGuestDetails([
    { ...validGuests[0], place_of_birth: '' },
    validGuests[1],
  ], 2), false)
  assert.equal(validateGuestDetails([
    { ...validGuests[0], document_type: '' },
    validGuests[1],
  ], 2), false)
  assert.equal(validateGuestDetails(validGuests.slice(0, 1), 2), false)
  assert.equal(validateGuestDetails([{ ...validGuests[0], document_number: '' }, validGuests[1]], 2), false)
  assert.equal(validateGuestDetails([validGuests[0], { ...validGuests[1], document_number: 'ID-2' }], 2), false)
  assert.equal(validateGuestDetails([{ ...validGuests[0], date_of_birth: '2999-01-01' }, validGuests[1]], 2), false)
  assert.equal(validateGuestDetails([
    { ...validGuests[0], document_type: '', place_of_birth: '' },
    { ...validGuests[1], place_of_birth: '' },
  ], 2, true), true)
  assert.equal(validateGuestDetails([
    { ...validGuests[0], guest_role: 'invalid' },
    validGuests[1],
  ], 2), false)
  assert.equal(validateGuestDetails([
    { ...validGuests[0], place_of_issue: '' },
    validGuests[1],
  ], 2), false)
  assert.equal(validateGuestDetails([
    { ...validGuests[0], gender: '' },
    validGuests[1],
  ], 2), false)
})

test('continues to accept previously stored details without the new guest fields', () => {
  const previousGuests = [
    {
      first_name: 'Maria',
      last_name: 'Rossi',
      date_of_birth: '1990-02-15',
      place_of_birth: 'Roma',
      document_type: 'identity_card',
      document_number: 'ID-12345',
    },
    {
      first_name: 'Luca',
      last_name: 'Rossi',
      date_of_birth: '2015-06-20',
      place_of_birth: 'Milano',
    },
  ]

  assert.equal(validateGuestDetails(previousGuests, 2, true), true)
  assert.equal(validateGuestDetails(previousGuests, 2), false)
})

test('encrypts saved personal details before storing them in D1', async () => {
  const storage: { ciphertext: string | null } = { ciphertext: null }
  const db = {
    prepare(query: string) {
      let parameters: unknown[] = []
      const statement = {
        bind(...values: unknown[]) {
          parameters = values
          return statement
        },
        async first() {
          if (query.includes('SELECT adults, children')) return { adults: 1, children: 1 }
          if (query.includes('SELECT details_encrypted')) {
            return storage.ciphertext ? { details_encrypted: storage.ciphertext } : null
          }
          throw new Error(`Unexpected query: ${query}`)
        },
        async run() {
          storage.ciphertext = String(parameters[1])
          return { meta: { changes: 1 } }
        },
      }
      return statement
    },
  }
  const env = {
    DB: db,
    IMAGES: {},
    AI: { run: async () => null },
    BOOKING_ENCRYPTION_KEY: 'a'.repeat(64),
  } as AdminEnv

  const failure = await saveBookingGuestDetails(env, 'booking-1', validGuests)
  assert.equal(failure, null)
  assert.ok(storage.ciphertext)
  assert.equal(storage.ciphertext?.includes('Maria'), false)
  assert.equal(storage.ciphertext?.includes('ID-12345'), false)
  assert.deepEqual(await readBookingGuestDetails(env, 'booking-1', env.BOOKING_ENCRYPTION_KEY!), validGuests)
})

test('refuses to store guest details if encryption is not configured', async () => {
  let databaseRead = false
  const env = {
    DB: {
      prepare() {
        databaseRead = true
        throw new Error('Database must not be accessed without an encryption key')
      },
    },
    IMAGES: {},
    AI: { run: async () => null },
  } as AdminEnv

  const response = await saveBookingGuestDetails(env, 'booking-1', validGuests)
  assert.ok(response instanceof Response)
  assert.equal(response.status, 500)
  assert.equal(databaseRead, false)
})

test('rejects invalid booking-form contact details before creating checkout', async () => {
  const validBooking = {
    checkIn: '2026-12-10',
    checkOut: '2026-12-12',
    guests: { adults: 1, children: 0, pets: false },
    firstName: 'Maria',
    lastName: 'Rossi',
    email: 'maria@example.com',
  }
  const invalidContacts = [
    { ...validBooking, firstName: '   ' },
    { ...validBooking, lastName: 'R'.repeat(121) },
    { ...validBooking, email: 'not-an-email' },
  ]

  for (const body of invalidContacts) {
    const response = await onRequestPost({
      request: new Request('https://example.com/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
      env: {} as Parameters<typeof onRequestPost>[0]['env'],
    })

    assert.equal(response.status, 400)
    assert.deepEqual(await response.json(), { error: 'Invalid booking contact details' })
  }
})

test('refuses checkout when the booking personal-data encryption key is missing or invalid', async () => {
  const body = {
    checkIn: '2026-12-10',
    checkOut: '2026-12-12',
    guests: { adults: 1, children: 0, pets: false },
    firstName: 'Maria',
    lastName: 'Rossi',
    email: 'maria@example.com',
  }

  for (const key of [undefined, 'invalid-key']) {
    let databaseAccessed = false
    const response = await onRequestPost({
      request: new Request('https://example.com/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
      env: {
        BOOKING_ENCRYPTION_KEY: key,
        DB: {
          prepare() {
            databaseAccessed = true
            throw new Error('Database must not be accessed without an encryption key')
          },
        },
        IMAGES: {},
        AI: { run: async () => null },
      } as Parameters<typeof onRequestPost>[0]['env'],
    })

    assert.equal(response.status, 500)
    assert.deepEqual(await response.json(), { error: 'Guest details encryption is not configured' })
    assert.equal(databaseAccessed, false)
  }
})

test('rejects incomplete guest details before creating a checkout session', async () => {
  const response = await onRequestPost({
    request: new Request('https://example.com/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        checkIn: '2026-12-10',
        checkOut: '2026-12-12',
        guests: { adults: 1, children: 0, pets: false },
        firstName: 'Maria',
        lastName: 'Rossi',
        email: 'maria@example.com',
        guestDetails: [{}],
      }),
    }),
    env: {} as Parameters<typeof onRequestPost>[0]['env'],
  })

  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), { error: 'Invalid guest details' })
})

function createPaymentExpirationEnv(createdAt: string) {
  const booking = {
    id: 'booking-1',
    status: 'pending',
    session_id: 'pi_test123',
    created_at: createdAt,
  }
  const env = {
    STRIPE_SECRET_KEY: 'sk_test_value',
    DB: {
      prepare(query: string) {
        let parameters: unknown[] = []
        const statement = {
          bind(...values: unknown[]) {
            parameters = values
            return statement
          },
          async first() {
            if (query.startsWith('SELECT id, status, session_id')) return booking
            return null
          },
          async run() {
            if (query.startsWith('UPDATE bookings')) booking.status = String(parameters[0])
            return { meta: { changes: 1 } }
          },
          async all() {
            return { results: [] }
          },
        }
        return statement
      },
    },
  } as Parameters<typeof expirePaymentIntent>[0]
  return { env, booking }
}

test('enforces the 15-minute payment deadline before contacting Stripe', async () => {
  const createdAt = '2026-11-01 12:00:00'
  const { env } = createPaymentExpirationEnv(createdAt)
  const beforeDeadline = Date.parse(`${createdAt.replace(' ', 'T')}Z`) + PAYMENT_WINDOW_MS - 1

  const result = await expirePaymentIntent(env, 'pi_test123', beforeDeadline)

  assert.deepEqual(result, {
    status: 'not_expired',
    expiresAt: Date.parse(`${createdAt.replace(' ', 'T')}Z`) + PAYMENT_WINDOW_MS,
  })
})

test('cancels an unpaid PaymentIntent and marks its booking cancelled at expiry', async () => {
  const { env, booking } = createPaymentExpirationEnv('2026-11-01 12:00:00')
  const originalFetch = globalThis.fetch
  const requests: string[] = []
  globalThis.fetch = async (input, init) => {
    const url = String(input)
    requests.push(`${init?.method ?? 'GET'} ${url}`)
    return Response.json({
      id: 'pi_test123',
      status: init?.method === 'POST' ? 'canceled' : 'requires_payment_method',
      amount_received: 0,
    })
  }

  try {
    const result = await expirePaymentIntent(env, 'pi_test123', Date.parse('2026-11-01T12:15:00Z'))
    assert.deepEqual(result, { status: 'expired' })
    assert.equal(booking.status, 'cancelled')
    assert.deepEqual(requests.map((request) => request.split(' ')[0]), ['GET', 'POST'])
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('records a successful payment instead of cancelling it when expiry races payment', async () => {
  const { env, booking } = createPaymentExpirationEnv('2026-11-01 12:00:00')
  const originalFetch = globalThis.fetch
  let requestCount = 0
  globalThis.fetch = async () => {
    requestCount++
    return Response.json({
      id: 'pi_test123',
      status: 'succeeded',
      amount_received: 12000,
    })
  }

  try {
    const result = await expirePaymentIntent(env, 'pi_test123', Date.parse('2026-11-01T12:15:00Z'))
    assert.deepEqual(result, { status: 'paid' })
    assert.equal(booking.status, 'paid')
    assert.equal(requestCount, 1)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('rechecks Stripe and records payment when cancellation loses a race', async () => {
  const { env, booking } = createPaymentExpirationEnv('2026-11-01 12:00:00')
  const originalFetch = globalThis.fetch
  let requestCount = 0
  globalThis.fetch = async (_input, init) => {
    requestCount++
    if (init?.method === 'POST') {
      return Response.json({ error: { message: 'Payment is no longer cancelable' } }, { status: 400 })
    }
    return Response.json({
      id: 'pi_test123',
      status: requestCount === 1 ? 'requires_payment_method' : 'succeeded',
      amount_received: 12000,
    })
  }

  try {
    const result = await expirePaymentIntent(env, 'pi_test123', Date.parse('2026-11-01T12:15:00Z'))
    assert.deepEqual(result, { status: 'paid' })
    assert.equal(booking.status, 'paid')
    assert.equal(requestCount, 3)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('rejects a client expiry request while the payment window is still open', async () => {
  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const { env } = createPaymentExpirationEnv(createdAt)
  const response = await handlePaymentExpirationRequest(
    new Request('https://example.com/api/checkout-expire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentIntentId: 'pi_test123' }),
    }),
    env,
  )

  assert.equal(response.status, 409)
  assert.equal((await response.json() as { error: string }).error, 'Payment window is still open')
})
