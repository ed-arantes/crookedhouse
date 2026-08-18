import { json, requireAdmin, d1GetTranslations, d1UpsertTranslations, type AdminEnv } from '../../_lib/admin'

const LOCALES = ['it', 'en', 'fr', 'de', 'es']

type PagesContext = { request: Request; env: AdminEnv }

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const url = new URL(request.url)
  const locale = url.searchParams.get('locale')

  if (locale) {
    const translations = await d1GetTranslations(env.DB, locale)
    return json({ locale, translations })
  }

  const result: Record<string, Record<string, string | string[]>> = {}
  for (const loc of LOCALES) {
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
  await d1UpsertTranslations(env.DB, locale, overrides)
  return json({ locale, ok: true })
}
