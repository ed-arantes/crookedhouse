import { json, kvGet, kvSet, requireAdmin, type AdminEnv } from '../../_lib/admin'
import itLocale from '../../../translations/it.json'
import enLocale from '../../../translations/en.json'
import frLocale from '../../../translations/fr.json'
import deLocale from '../../../translations/de.json'
import esLocale from '../../../translations/es.json'

const CONTENT_KEY_PREFIX = 'content:'
type TranslationOverrides = Record<string, string | string[]>
type AllContent = Record<string, TranslationOverrides>

const STATIC_CONTENT: AllContent = {
  it: itLocale as TranslationOverrides,
  en: enLocale as TranslationOverrides,
  fr: frLocale as TranslationOverrides,
  de: deLocale as TranslationOverrides,
  es: esLocale as TranslationOverrides,
}

type PagesContext = { request: Request; env: AdminEnv }

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const url = new URL(request.url)
  const locale = url.searchParams.get('locale')

  if (locale) {
    const overrides = await kvGet<TranslationOverrides>(env.KV, `${CONTENT_KEY_PREFIX}${locale}`, {})
    return json({ locale, overrides, base: STATIC_CONTENT[locale] ?? {} })
  }

  const locales = ['it', 'en', 'fr', 'de', 'es']
  const result: Record<string, { overrides: TranslationOverrides; base: TranslationOverrides }> = {}
  for (const loc of locales) {
    const overrides = await kvGet<TranslationOverrides>(env.KV, `${CONTENT_KEY_PREFIX}${loc}`, {})
    result[loc] = { overrides, base: STATIC_CONTENT[loc] ?? {} }
  }
  return json(result)
}

export const onRequestPut = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const body = await request.json().catch(() => null) as {
    locale?: string
    overrides?: TranslationOverrides
  } | null

  if (!body?.locale || !body.overrides) {
    return json({ error: 'Missing locale or overrides' }, 400)
  }

  const { locale, overrides } = body
  const existing = await kvGet<TranslationOverrides>(env.KV, `${CONTENT_KEY_PREFIX}${locale}`, {})
  const merged = { ...existing, ...overrides }

  await kvSet(env.KV, `${CONTENT_KEY_PREFIX}${locale}`, merged)
  return json({ locale, overrides: merged })
}
