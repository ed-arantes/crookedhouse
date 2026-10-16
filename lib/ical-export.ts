export type ICalendarEvent = {
  uid: string
  summary: string
  start: string
  end: string
}

export function isCalendarEligibleBooking(status: string): boolean {
  return status === 'paid'
}

export function escapeICalText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
}

export function formatICalDate(date: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Invalid calendar date: ${date}`)
  }
  const parsed = new Date(`${date}T00:00:00.000Z`)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error(`Invalid calendar date: ${date}`)
  }
  return date.replace(/-/g, '')
}

const encoder = new TextEncoder()

function foldICalLine(line: string): string {
  const folded: string[] = []
  let current = ''
  let octets = 0
  for (const character of line) {
    const characterOctets = encoder.encode(character).length
    if (octets + characterOctets > 75) {
      folded.push(current)
      current = ' '
      octets = 1
    }
    current += character
    octets += characterOctets
  }
  folded.push(current)
  return folded.join('\r\n')
}

export function formatICalendar(events: ICalendarEvent[], timestamp: Date): string {
  if (Number.isNaN(timestamp.getTime())) throw new Error('Invalid calendar timestamp')
  const stamp = timestamp.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Crooked House//Direct Booking Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  for (const event of events) {
    if (!event.uid.trim() || !event.summary.trim()) {
      throw new Error('Calendar event UID and summary are required')
    }
    const start = formatICalDate(event.start)
    const end = formatICalDate(event.end)
    if (end <= start) throw new Error('Calendar event end must be after its start')

    lines.push(
      'BEGIN:VEVENT',
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `UID:${escapeICalText(event.uid)}`,
      `SUMMARY:${escapeICalText(event.summary)}`,
      'ORGANIZER;CN=Crooked House:https://crookedhouse.it',
      'END:VEVENT',
    )
  }

  lines.push('END:VCALENDAR')
  return `${lines.map(foldICalLine).join('\r\n')}\r\n`
}
