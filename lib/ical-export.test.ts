import assert from 'node:assert/strict'
import test from 'node:test'
import { escapeICalText, formatICalDate, formatICalendar, isCalendarEligibleBooking } from './ical-export'

test('exports only confirmed paid site bookings', () => {
  assert.equal(isCalendarEligibleBooking('paid'), true)
  assert.equal(isCalendarEligibleBooking('pending'), false)
  assert.equal(isCalendarEligibleBooking('cancelled'), false)
})

test('formats all-day events with exclusive end dates and organizer URL', () => {
  const calendar = formatICalendar([{
    uid: 'booking-1@crookedhouse.it',
    summary: 'Ada Guest',
    start: '2027-05-01',
    end: '2027-05-03',
  }], new Date('2026-10-16T19:35:32.000Z'))

  assert.match(calendar, /DTSTART;VALUE=DATE:20270501\r\n/)
  assert.match(calendar, /DTEND;VALUE=DATE:20270503\r\n/)
  assert.match(calendar, /SUMMARY:Ada Guest\r\n/)
  assert.match(calendar, /ORGANIZER;CN=Crooked House:https:\/\/crookedhouse\.it\r\n/)
  assert.match(calendar, /METHOD:PUBLISH\r\n/)
})

test('escapes iCalendar text delimiters and newlines', () => {
  assert.equal(escapeICalText('Smith, Jr.; A\\B\nGuest'), 'Smith\\, Jr.\\; A\\\\B\\nGuest')
})

test('rejects invalid and reversed dates', () => {
  assert.throws(() => formatICalDate('2027-02-29'), /Invalid calendar date/)
  assert.throws(() => formatICalendar([{
    uid: 'bad@crookedhouse.it',
    summary: 'Guest',
    start: '2027-05-03',
    end: '2027-05-03',
  }], new Date('2026-10-16T19:35:32.000Z')), /end must be after/)
})

test('folds UTF-8 lines at no more than 75 octets', () => {
  const summary = 'Guest '.repeat(15) + '😀'
  const calendar = formatICalendar([{
    uid: 'long-summary@crookedhouse.it',
    summary,
    start: '2027-05-01',
    end: '2027-05-02',
  }], new Date('2026-10-16T19:35:32.000Z'))

  for (const line of calendar.split('\r\n').filter(Boolean)) {
    assert.ok(new TextEncoder().encode(line).length <= 75)
  }
})
