import assert from 'node:assert/strict'
import test from 'node:test'
import { onRequest } from '../functions/_middleware'

test('limits the iCal hostname to the feed GET endpoint', async () => {
  let passedThrough = false
  const allowed = await onRequest({
    request: new Request('https://ical.crookedhouse.it/api/export.ics?token=secret'),
    next: async () => {
      passedThrough = true
      return new Response('calendar')
    },
  })

  assert.equal(allowed.status, 200)
  assert.equal(passedThrough, true)
})

test('does not serve the website or other methods on the iCal hostname', async () => {
  for (const request of [
    new Request('https://ical.crookedhouse.it/'),
    new Request('https://ical.crookedhouse.it/admin'),
    new Request('https://ical.crookedhouse.it/api/export.ics', { method: 'POST' }),
  ]) {
    let passedThrough = false
    const response = await onRequest({
      request,
      next: async () => {
        passedThrough = true
        return new Response('unexpected')
      },
    })

    assert.equal(response.status, 404)
    assert.equal(passedThrough, false)
  }
})

test('leaves the primary website hostname behavior unchanged', async () => {
  let passedThrough = false
  const response = await onRequest({
    request: new Request('https://crookedhouse.it/about'),
    next: async () => {
      passedThrough = true
      return new Response('website')
    },
  })

  assert.equal(response.status, 200)
  assert.equal(passedThrough, true)
})
