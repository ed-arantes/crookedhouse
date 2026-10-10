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

const SUPPORTED_LOCALE_PATH = /^\/(?:it|en|fr|de|es|ru)(?:\/|$)/

export async function onRequest({ request, next }: PagesContext): Promise<Response> {
  const url = new URL(request.url)
  const path = url.pathname.replace(/\/+$/, '') || '/'
  const redirectingFromUnlocalizedPage = path === '/' || path === '/servizi'

  if (!redirectingFromUnlocalizedPage || SUPPORTED_LOCALE_PATH.test(path)) {
    return next()
  }

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
