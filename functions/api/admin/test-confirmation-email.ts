import { Resend } from 'resend'
import { json, requireAdmin, type AdminEnv } from '../../_lib/admin'

type PagesContext = { request: Request; env: AdminEnv }

type ConfirmationTestInput = {
  to: string
  guestName: string
  checkIn: string
  checkOut: string
  nights: number
  guests: number
  totalPaid: number
  bookingReference: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
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
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00.000Z`))
}

function parseInput(value: unknown): ConfirmationTestInput | null {
  if (!isRecord(value)) return null

  const to = typeof value.to === 'string' ? value.to.trim() : ''
  const guestName = typeof value.guestName === 'string' ? value.guestName.trim() : ''
  const checkIn = value.checkIn
  const checkOut = value.checkOut
  const nights = value.nights
  const guests = value.guests
  const totalPaid = value.totalPaid
  const bookingReference =
    typeof value.bookingReference === 'string' ? value.bookingReference.trim() : ''

  if (
    to.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) ||
    guestName.length < 1 ||
    guestName.length > 120 ||
    !isDate(checkIn) ||
    !isDate(checkOut) ||
    checkOut <= checkIn ||
    typeof nights !== 'number' ||
    !Number.isInteger(nights) ||
    nights < 1 ||
    nights > 365 ||
    typeof guests !== 'number' ||
    !Number.isInteger(guests) ||
    guests < 1 ||
    guests > 50 ||
    typeof totalPaid !== 'number' ||
    !Number.isFinite(totalPaid) ||
    totalPaid < 0 ||
    totalPaid > 1_000_000 ||
    Math.round(totalPaid * 100) !== totalPaid * 100 ||
    bookingReference.length < 1 ||
    bookingReference.length > 80
  ) {
    return null
  }

  return { to, guestName, checkIn, checkOut, nights, guests, totalPaid, bookingReference }
}

export const onRequestPost = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const body: unknown = await request.json().catch(() => null)
  const input = parseInput(body)
  if (!input) return json({ error: 'Enter valid booking confirmation test details' }, 400)

  if (!env.RESEND_API_KEY) {
    return json({ error: 'Resend API key is not configured' }, 500)
  }
  if (!env.RESEND_BOOKING_CONFIRMATION_TEMPLATE_ID) {
    return json({ error: 'Booking confirmation template is not configured' }, 500)
  }

  try {
    const resend = new Resend(env.RESEND_API_KEY)
    const { data, error } = await resend.emails.send({
      from: env.RESEND_FROM_EMAIL || 'Crooked House <reception@crookedhouse.it>',
      to: input.to,
      template: {
        id: env.RESEND_BOOKING_CONFIRMATION_TEMPLATE_ID,
        variables: {
          GUEST_NAME: escapeTemplateHtml(input.guestName),
          CHECK_IN: formatDate(input.checkIn),
          CHECK_OUT: formatDate(input.checkOut),
          NIGHTS: input.nights,
          GUESTS: input.guests,
          TOTAL_PAID: new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'EUR',
          }).format(input.totalPaid),
          BOOKING_REFERENCE: escapeTemplateHtml(input.bookingReference),
        },
      },
    }, {
      idempotencyKey: `admin-confirmation-test/${crypto.randomUUID()}`,
    })

    if (error) {
      console.error('Resend booking confirmation test failed', error)
      return json({ error: 'Resend could not send the booking confirmation test' }, 502)
    }
    if (!data?.id) {
      console.error('Resend booking confirmation test returned no email ID')
      return json({ error: 'Resend did not confirm the booking confirmation test' }, 502)
    }

    return json({ ok: true, id: data.id })
  } catch (error) {
    console.error('Resend booking confirmation test request failed', error)
    return json({ error: 'Unable to send the booking confirmation test' }, 502)
  }
}
