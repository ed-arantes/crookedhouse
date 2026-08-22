import { json, d1GetTranslations, type AdminEnv } from '../../_lib/admin'
import { REQUIRED_CONTENT_KEYS } from '../../../lib/content-schema'

type PagesContext = { request: Request; env: AdminEnv }

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const url = new URL(request.url)
  const locale = url.searchParams.get('locale') || 'it'

  if (locale !== 'it') return json({ error: 'Locale not available' }, 404)

  const translations = await d1GetTranslations(env.DB, locale)
  const missing = REQUIRED_CONTENT_KEYS.filter((key) => translations[key] === undefined)
  if (missing.length > 0) {
    return json({ error: 'Italian content is incomplete', missing }, 503)
  }
  return json(translations)
}
