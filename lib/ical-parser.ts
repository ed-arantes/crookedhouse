/**
 * Parse an iCal feed string and return a flat array of YYYY-MM-DD date strings
 * representing every night that is occupied (between DTSTART and DTEND exclusive).
 *
 * Handles both all-day events (DTSTART;VALUE=DATE:20260815) and timed events
 * (DTSTART:20260815T120000Z).
 */
export function parseICalDates(text: string): string[] {
  const dates = new Set<string>()
  const blocks = text.split('BEGIN:VEVENT')

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].split('END:VEVENT')[0]
    const start = extractDate(block, 'DTSTART')
    const end = extractDate(block, 'DTEND')
    if (!start) continue

    // For all-day events, DTEND is exclusive — include the day before.
    // For timed events, just use the start date.
    if (end) {
      const endObj = new Date(end)
      endObj.setDate(endObj.getDate() - 1)
      const endDate = toISO(endObj)
      let cursor = start
      while (cursor <= endDate) {
        dates.add(cursor)
        cursor = advanceDay(cursor)
      }
    } else {
      dates.add(start)
    }
  }

  return Array.from(dates).sort()
}

function extractDate(block: string, prefix: string): string | null {
  // Match lines like "DTSTART;VALUE=DATE:20260815" or "DTSTART:20260815T120000Z"
  const regex = new RegExp(`${prefix}(?:;[^:]*)?:\\s*(\\d{8}(?:T\\d{6}Z?)?)`, 'i')
  const match = block.match(regex)
  if (!match) return null
  const raw = match[1]
  // Extract YYYY-MM-DD from the raw value
  const y = raw.slice(0, 4)
  const m = raw.slice(4, 6)
  const d = raw.slice(6, 8)
  return `${y}-${m}-${d}`
}

function toISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function advanceDay(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`)
  d.setDate(d.getDate() + 1)
  return toISO(d)
}
