import assert from 'node:assert/strict'
import test from 'node:test'
import { sendBookingConfirmation } from '../functions/_lib/booking-confirmation-email'
import { encrypt } from './encryption'

test('sends a paid booking confirmation once with its Resend template variables', async () => {
  const encryptionKey = 'a'.repeat(64)
  let sentAt: string | null = null
  let sendCount = 0
  const captured: { requestBody?: Record<string, unknown> } = {}
  let idempotencyKey = ''
  const booking = {
    id: 'booking-123',
    status: 'paid',
    get confirmation_email_sent_at() { return sentAt },
    first_name_encrypted: await encrypt('Maria <Guest>', encryptionKey),
    last_name_encrypted: await encrypt('Rossi', encryptionKey),
    email_encrypted: await encrypt('maria@example.com', encryptionKey),
    check_in: '2026-12-10',
    check_out: '2026-12-12',
    nights: 2,
    adults: 2,
    children: 1,
    total_price: 300,
  }
  const env = {
    BOOKING_ENCRYPTION_KEY: encryptionKey,
    RESEND_API_KEY: 're_test_key',
    RESEND_BOOKING_CONFIRMATION_TEMPLATE_ID: 'template-confirmation',
    DB: {
      prepare(query: string) {
        let parameters: unknown[] = []
        const statement = {
          bind(...values: unknown[]) {
            parameters = values
            return statement
          },
          async first() {
            assert.match(query, /FROM bookings WHERE session_id/)
            assert.equal(parameters[0], 'pi_test123')
            return booking
          },
          async run() {
            assert.match(query, /confirmation_email_sent_at = datetime/)
            assert.equal(parameters[0], 'booking-123')
            sentAt = '2026-10-17 00:00:00'
            return { meta: { changes: 1 } }
          },
        }
        return statement
      },
    },
  }

  const originalFetch = globalThis.fetch
  globalThis.fetch = async (_input, init) => {
    sendCount++
    idempotencyKey = new Headers(init?.headers).get('idempotency-key') ?? ''
    captured.requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>
    return Response.json({ id: 'email-456' })
  }

  try {
    await sendBookingConfirmation(env, 'pi_test123')
    await sendBookingConfirmation(env, 'pi_test123')
  } finally {
    globalThis.fetch = originalFetch
  }

  assert.equal(sendCount, 1)
  assert.equal(idempotencyKey, 'booking-confirmation/booking-123')
  assert.equal(sentAt, '2026-10-17 00:00:00')
  const requestBody = captured.requestBody
  assert.ok(requestBody)
  assert.equal((requestBody.template as { id: string }).id, 'template-confirmation')
  assert.deepEqual((requestBody.template as { variables: Record<string, unknown> }).variables, {
    GUEST_NAME: 'Maria &lt;Guest&gt; Rossi',
    CHECK_IN: '10 December 2026',
    CHECK_OUT: '12 December 2026',
    NIGHTS: 2,
    GUESTS: 3,
    TOTAL_PAID: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' }).format(300),
    BOOKING_REFERENCE: 'booking-123',
  })
})

test('does not send a booking confirmation before payment is confirmed', async () => {
  let sendCount = 0
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => {
    sendCount++
    return Response.json({ id: 'email-456' })
  }

  try {
    await sendBookingConfirmation({
      RESEND_API_KEY: 're_test_key',
      RESEND_BOOKING_CONFIRMATION_TEMPLATE_ID: 'template-confirmation',
      DB: {
        prepare() {
          return {
            bind() {
              return { first: async () => ({ status: 'pending' }) }
            },
          }
        },
      },
    }, 'pi_test123')
  } finally {
    globalThis.fetch = originalFetch
  }

  assert.equal(sendCount, 0)
})
