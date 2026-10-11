import assert from 'node:assert/strict'
import test from 'node:test'
import { saveBookingGuestDetails, readBookingGuestDetails, validateGuestDetails } from '../functions/_lib/booking-guest-details'
import type { AdminEnv } from '../functions/_lib/admin'

const validGuests = [
  {
    first_name: 'Maria',
    last_name: 'Rossi',
    date_of_birth: '1990-02-15',
    document_number: 'ID-12345',
  },
  {
    first_name: 'Luca',
    last_name: 'Rossi',
    date_of_birth: '2015-06-20',
  },
]

test('requires complete details for every guest and an ID for the group leader only', () => {
  assert.equal(validateGuestDetails(validGuests, 2), true)
  assert.equal(validateGuestDetails(validGuests.slice(0, 1), 2), false)
  assert.equal(validateGuestDetails([{ ...validGuests[0], document_number: '' }, validGuests[1]], 2), false)
  assert.equal(validateGuestDetails([validGuests[0], { ...validGuests[1], document_number: 'ID-2' }], 2), false)
  assert.equal(validateGuestDetails([{ ...validGuests[0], date_of_birth: '2999-01-01' }, validGuests[1]], 2), false)
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
