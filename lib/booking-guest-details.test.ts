import assert from 'node:assert/strict'
import test from 'node:test'
import { saveBookingGuestDetails, readBookingGuestDetails, validateGuestDetails } from '../functions/_lib/booking-guest-details'
import type { AdminEnv } from '../functions/_lib/admin'
import { onRequestPost } from '../functions/api/checkout'
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
