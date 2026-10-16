import { Resend } from 'resend'
import { decrypt } from '../../lib/encryption'

type ConfirmationEnv = {
  DB: Record<string, unknown>
  BOOKING_ENCRYPTION_KEY?: string
  RESEND_API_KEY?: string
  RESEND_FROM_EMAIL?: string
  RESEND_BOOKING_CONFIRMATION_TEMPLATE_ID?: string
}

type BookingConfirmationRow = {
  id: string
  status: string
  confirmation_email_sent_at: string | null
  first_name_encrypted: string
  last_name_encrypted: string
  email_encrypted: string
  check_in: string
  check_out: string
  nights: number
  adults: number
  children: number
  total_price: number
}

async function decryptBookingValue(value: string, key?: string): Promise<string> {
  if (!key || (value.includes('@') && value.includes('.'))) return value
  return decrypt(value, key)
}

function escapeTemplateHtml(value: string): string {
  const escapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return value.replace(/[&<>"']/g, (character) => escapes[character] ?? character)
}

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) throw new Error('Booking confirmation contains an invalid date')
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export async function sendBookingConfirmation(
  env: ConfirmationEnv,
  paymentIntentId: string,
): Promise<void> {
  if (!env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not configured')
  if (!env.RESEND_BOOKING_CONFIRMATION_TEMPLATE_ID) {
    throw new Error('RESEND_BOOKING_CONFIRMATION_TEMPLATE_ID is not configured')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const booking = await (env.DB as any).prepare(
    `SELECT id, status, confirmation_email_sent_at, first_name_encrypted,
      last_name_encrypted, email_encrypted, check_in, check_out, nights,
      adults, children, total_price
     FROM bookings WHERE session_id = ?`,
  ).bind(paymentIntentId).first() as BookingConfirmationRow | null

  if (!booking || booking.status !== 'paid' || booking.confirmation_email_sent_at) return

  const [firstName, lastName, recipient] = await Promise.all([
    decryptBookingValue(booking.first_name_encrypted, env.BOOKING_ENCRYPTION_KEY),
    decryptBookingValue(booking.last_name_encrypted, env.BOOKING_ENCRYPTION_KEY),
    decryptBookingValue(booking.email_encrypted, env.BOOKING_ENCRYPTION_KEY),
  ])
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
    throw new Error('Booking confirmation recipient email is invalid')
  }

  const resend = new Resend(env.RESEND_API_KEY)
  const { data, error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL || 'Crooked House <reception@crookedhouse.it>',
    to: recipient,
    template: {
      id: env.RESEND_BOOKING_CONFIRMATION_TEMPLATE_ID,
      variables: {
        GUEST_NAME: escapeTemplateHtml(`${firstName} ${lastName}`.trim()),
        CHECK_IN: formatDate(booking.check_in),
        CHECK_OUT: formatDate(booking.check_out),
        NIGHTS: Number(booking.nights),
        GUESTS: Number(booking.adults) + Number(booking.children),
        TOTAL_PAID: new Intl.NumberFormat('en-GB', {
          style: 'currency',
          currency: 'EUR',
        }).format(Number(booking.total_price)),
        BOOKING_REFERENCE: escapeTemplateHtml(booking.id),
      },
    },
  }, {
    idempotencyKey: `booking-confirmation/${booking.id}`,
  })

  if (error) throw new Error(`Resend rejected the booking confirmation: ${error.message}`)
  if (!data?.id) throw new Error('Resend did not confirm the booking confirmation email')

  // Resend's idempotency key makes concurrent verification requests safe.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (env.DB as any).prepare(
    `UPDATE bookings SET confirmation_email_sent_at = datetime('now')
     WHERE id = ? AND confirmation_email_sent_at IS NULL`,
  ).bind(booking.id).run()
  console.info('Booking confirmation email sent', { bookingId: booking.id, emailId: data.id })
}

export async function attemptBookingConfirmation(
  env: ConfirmationEnv,
  paymentIntentId: string,
): Promise<void> {
  try {
    await sendBookingConfirmation(env, paymentIntentId)
  } catch (error) {
    console.error('Payment is confirmed, but the booking confirmation email could not be sent', error)
  }
}
