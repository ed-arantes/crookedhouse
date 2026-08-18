import { json, kvGet, type AdminEnv } from '../../_lib/admin'
import itLocale from '../../../translations/it.json'
import enLocale from '../../../translations/en.json'
import frLocale from '../../../translations/fr.json'
import deLocale from '../../../translations/de.json'
import esLocale from '../../../translations/es.json'

type TranslationOverrides = Record<string, string | string[]>

const CONTENT_KEY_PREFIX = 'content:'

const STATIC_CONTENT: Record<string, TranslationOverrides> = {
  it: itLocale as TranslationOverrides,
  en: enLocale as TranslationOverrides,
  fr: frLocale as TranslationOverrides,
  de: deLocale as TranslationOverrides,
  es: esLocale as TranslationOverrides,
}

type PagesContext = { request: Request; env: AdminEnv }

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const url = new URL(request.url)
  const locale = url.searchParams.get('locale') || 'it'

  const base = STATIC_CONTENT[locale] ?? STATIC_CONTENT.it
  const overrides = await kvGet<TranslationOverrides>(env.KV, `${CONTENT_KEY_PREFIX}${locale}`, {})

  const merged = { ...base, ...overrides }
  return json(merged)
}
