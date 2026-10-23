import assert from 'node:assert/strict'
import test from 'node:test'
import { areGuestDetailsComplete, formatGuestDate, guestDetailsFormValues, parseGuestDate } from './guest-details-form'
import type { Locale } from './i18n'

const dates: Array<[Locale, string]> = [
  ['it', '15/02/1990'],
  ['en', '02/15/1990'],
  ['fr', '15/02/1990'],
  ['de', '15.02.1990'],
  ['es', '15/02/1990'],
  ['ru', '15.02.1990'],
]

test('uses booking names for the group leader before guest details are saved', () => {
  assert.deepEqual(
    guestDetailsFormValues({
      first_name: 'Maria',
      last_name: 'Rossi',
      adults: 2,
      children: 1,
    }),
    [
      { guest_role: '', first_name: 'Maria', last_name: 'Rossi', date_of_birth: '', place_of_birth: '', nationality: '', gender: '', place_of_issue: '', document_type: '', document_number: '' },
      { guest_role: '', first_name: '', last_name: '', date_of_birth: '', place_of_birth: '', nationality: '', gender: '', place_of_issue: '', document_type: '', document_number: '' },
      { guest_role: '', first_name: '', last_name: '', date_of_birth: '', place_of_birth: '', nationality: '', gender: '', place_of_issue: '', document_type: '', document_number: '' },
    ],
  )
})

test('selects single guest and trims booking form names for one-guest bookings', () => {
  assert.deepEqual(
    guestDetailsFormValues({
      first_name: ' Maria ',
      last_name: ' Rossi ',
      adults: 1,
      children: 0,
    }),
    [{ guest_role: 'single_guest', first_name: 'Maria', last_name: 'Rossi', date_of_birth: '', place_of_birth: '', nationality: '', gender: '', place_of_issue: '', document_type: '', document_number: '' }],
  )
})

test('preserves saved guest details and only falls back to booking names when blank', () => {
  assert.deepEqual(
    guestDetailsFormValues(
      { first_name: 'Maria', last_name: 'Rossi', adults: 2, children: 0 },
      [
        { guest_role: 'head_of_family', first_name: ' ', last_name: '', date_of_birth: '1990-02-15', nationality: 'Italian', gender: 'Female', place_of_issue: 'Rome', document_number: 'ID-123' },
        { first_name: 'Luca', last_name: 'Verdi', date_of_birth: '1991-06-20', nationality: 'Italian', gender: 'Male', document_number: 'ignored' },
      ],
    ),
    [
      { guest_role: 'head_of_family', first_name: 'Maria', last_name: 'Rossi', date_of_birth: '15/02/1990', place_of_birth: '', nationality: 'Italian', gender: 'Female', place_of_issue: 'Rome', document_type: '', document_number: 'ID-123' },
      { guest_role: '', first_name: 'Luca', last_name: 'Verdi', date_of_birth: '20/06/1991', place_of_birth: '', nationality: 'Italian', gender: 'Male', place_of_issue: '', document_type: '', document_number: '' },
    ],
  )
})

test('formats dates using each supported locale format', () => {
  for (const [locale, expected] of dates) {
    assert.equal(formatGuestDate('1990-02-15', locale), expected)
    assert.equal(parseGuestDate(expected, locale), '1990-02-15')
  }
})

test('rejects invalid localized dates', () => {
  assert.equal(parseGuestDate('02/31/1990', 'en'), null)
  assert.equal(parseGuestDate('31.02.1990', 'de'), null)
})

test('accepts single-digit, autofilled, and unambiguous alternate-order dates', () => {
  assert.equal(parseGuestDate('2/5/1990', 'it'), '1990-05-02')
  assert.equal(parseGuestDate('1990-5-2', 'it'), '1990-05-02')
  assert.equal(parseGuestDate('15/02/1990', 'en'), '1990-02-15')
  assert.equal(parseGuestDate('02/15/1990', 'en'), '1990-02-15')
})

test('guest details are incomplete until every required field is valid', () => {
  const booking = {
    first_name: 'Maria',
    last_name: 'Rossi',
    adults: 1,
    children: 0,
  }
  const emptyGuest = guestDetailsFormValues(booking, [], 'it')
  assert.equal(areGuestDetailsComplete(emptyGuest, 'it', '2026-10-15'), false)

  const [guest] = emptyGuest
  const completedGuest = {
    ...guest,
    date_of_birth: '15/02/1990',
    place_of_birth: 'Roma',
    nationality: 'Italian',
    gender: 'Female',
    place_of_issue: 'Roma',
    document_type: 'Carta d’identità',
    document_number: 'ID-12345',
  }
  assert.equal(areGuestDetailsComplete([completedGuest], 'it', '2026-10-15'), true)
  assert.equal(areGuestDetailsComplete([
    { ...completedGuest, date_of_birth: '16/10/2026' },
  ], 'it', '2026-10-15'), false)
  assert.equal(areGuestDetailsComplete([
    { ...completedGuest, guest_role: '' },
  ], 'it', '2026-10-15'), false)
})
