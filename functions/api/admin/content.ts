import { json, requireAdmin, d1GetTranslations, d1UpsertTranslations, type AdminEnv } from '../../_lib/admin'
import { locales, type Locale } from '../../../lib/i18n'

type PagesContext = { request: Request; env: AdminEnv }

function isValidLocale(locale: string): locale is Locale {
  return (locales as readonly string[]).includes(locale)
}

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const url = new URL(request.url)
  const locale = url.searchParams.get('locale')

  if (locale) {
    if (!isValidLocale(locale)) return json({ error: 'Locale not available' }, 404)
    const translations = await d1GetTranslations(env.DB, locale)
    return json({ locale, translations })
  }

  const result: Record<string, Record<string, string | string[]>> = {}
  for (const loc of locales) {
    result[loc] = await d1GetTranslations(env.DB, loc)
  }
  return json(result)
}

export const onRequestPut = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const body = await request.json().catch(() => null) as {
    locale?: string
    overrides?: Record<string, string | string[]>
  } | null

  if (!body?.locale || !body.overrides) {
    return json({ error: 'Missing locale or overrides' }, 400)
  }

  const { locale, overrides } = body
  if (!isValidLocale(locale)) return json({ error: 'Locale not available' }, 400)
  if (Object.values(overrides).some((value) =>
    typeof value !== 'string' && !(Array.isArray(value) && value.every((item) => typeof item === 'string'))
  )) {
    return json({ error: 'Invalid translation value' }, 400)
  }
  await d1UpsertTranslations(env.DB, locale, overrides)
  return json({ locale, ok: true })
}
