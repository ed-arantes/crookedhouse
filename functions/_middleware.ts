import {
  getLocaleForCountry,
  getLocalePreference,
} from '../lib/locale-detection'

type PagesRequest = Request & {
  cf?: {
    country?: string
  }
}

type PagesContext = {
  request: PagesRequest
  next: () => Promise<Response>
}

export async function onRequest({ request, next }: PagesContext): Promise<Response> {
  const url = new URL(request.url)
  if (url.hostname.toLowerCase() === 'ical.crookedhouse.it') {
    if (url.pathname !== '/api/export.ics' || request.method !== 'GET') {
      return new Response('Not found', {
        status: 404,
        headers: { 'Cache-Control': 'no-store' },
      })
    }
    return next()
  }

  const path = url.pathname.replace(/\/+$/, '') || '/'
  const redirectingFromUnlocalizedPage = path === '/' || path === '/servizi'

  if (!redirectingFromUnlocalizedPage) return next()

  const locale = getLocalePreference(request.headers.get('Cookie'))
    ?? getLocaleForCountry(
      request.cf?.country,
      request.headers.get('Accept-Language') ?? '',
    )
  url.pathname = path === '/' ? `/${locale}` : `/${locale}/servizi`

  return new Response(null, {
    status: 307,
    headers: {
      Location: url.toString(),
      'Cache-Control': 'private, no-store',
      Vary: 'Cookie, Accept-Language',
    },
  })
}
