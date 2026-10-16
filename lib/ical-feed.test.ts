import assert from 'node:assert/strict'
import test from 'node:test'
import { onRequestGet } from '../functions/api/export.ics'
import type { AdminEnv } from '../functions/_lib/admin'

const feedToken = 'a'.repeat(64)

function mockEnv(): { env: AdminEnv; queries: string[] } {
  const queries: string[] = []
  const db = {
    prepare(query: string) {
      queries.push(query)
      const statement = {
        bind: (..._values: string[]) => statement,
        async all() {
          if (query.startsWith('SELECT value FROM settings')) {
            return { results: [{ value: feedToken }] }
          }
          if (query.startsWith('SELECT id, first_name_encrypted')) {
            return {
              results: [
                {
                  id: 'paid-booking',
                  first_name_encrypted: 'Ada,',
                  last_name_encrypted: 'Guest; One',
                  check_in: '2027-05-01',
                  check_out: '2027-05-03',
                  status: 'paid',
                },
                {
                  id: 'pending-booking',
                  first_name_encrypted: 'Pending',
                  last_name_encrypted: 'Guest',
                  check_in: '2027-06-01',
                  check_out: '2027-06-02',
                  status: 'pending',
                },
              ],
            }
          }
          if (query.startsWith('SELECT date, reason FROM blocked_dates')) {
            return {
              results: [
                { date: '2027-07-02', reason: 'Repair; access, stairs' },
                { date: '2027-07-03', reason: null },
              ],
            }
          }
          throw new Error(`Unexpected database query: ${query}`)
        },
      }
      return statement
    },
  }
  return {
    env: { DB: db, IMAGES: {}, AI: { run: async () => ({}) } },
    queries,
  }
}

test('serves only paid direct bookings and admin blocks from the live database', async () => {
  const { env, queries } = mockEnv()
  const response = await onRequestGet({
    request: new Request(`https://ical.crookedhouse.it/api/export.ics?token=${feedToken}`),
    env,
  })
  const calendar = await response.text()

  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type') ?? '', /^text\/calendar/)
  assert.equal(response.headers.get('cache-control'), 'no-store, no-cache, must-revalidate, max-age=0')
  assert.match(calendar, /SUMMARY:Ada\\, Guest\\; One\r\n/)
  assert.match(calendar, /DTSTART;VALUE=DATE:20270501\r\n/)
  assert.match(calendar, /DTEND;VALUE=DATE:20270503\r\n/)
  assert.match(calendar, /SUMMARY:Repair\\; access\\, stairs\r\n/)
  assert.match(calendar, /SUMMARY:Blocked by admin/)
  assert.doesNotMatch(calendar, /Pending Guest|pending-booking/)
  assert.equal(queries.some((query) => /ical_url|airbnb_ical_url/i.test(query)), false)
})

test('does not query booking data when the private feed token is invalid', async () => {
  const { env, queries } = mockEnv()
  const response = await onRequestGet({
    request: new Request(`https://ical.crookedhouse.it/api/export.ics?token=${'b'.repeat(64)}`),
    env,
  })

  assert.equal(response.status, 404)
  assert.equal(queries.length, 1)
})
