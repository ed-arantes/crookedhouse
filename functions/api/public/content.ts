import { json, d1GetTranslations, type AdminEnv } from '../../_lib/admin'
import { locales, type Locale } from '../../../lib/i18n'
import { REQUIRED_CONTENT_KEYS } from '../../../lib/content-schema'

type PagesContext = { request: Request; env: AdminEnv }

function isValidLocale(locale: string): locale is Locale {
  return (locales as readonly string[]).includes(locale)
}

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const url = new URL(request.url)
  const locale = url.searchParams.get('locale') || 'it'

  if (!isValidLocale(locale)) {
    return json({ error: 'Locale not available' }, 404)
  }

  const translations = await d1GetTranslations(env.DB, locale)
  const missing = REQUIRED_CONTENT_KEYS.filter((key) => translations[key] === undefined)
  if (missing.length > 0) {
    return json({ error: 'Italian content is incomplete', missing }, 503)
  }
  return json(translations)
}
