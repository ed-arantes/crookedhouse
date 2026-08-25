import { json, requireAdmin, type AdminEnv } from '../../_lib/admin'

type PagesContext = { request: Request; env: AdminEnv }

const TARGET_LOCALES = ['en', 'fr', 'de', 'es', 'ru'] as const

const LOCALE_NAMES: Record<string, string> = {
  en: 'english',
  fr: 'french',
  de: 'german',
  es: 'spanish',
  ru: 'russian',
}

interface TranslationPair {
  key: string
  value: string
}

async function translateText(
  ai: AdminEnv['AI'],
  text: string,
  targetLocale: string
): Promise<string> {
  const targetName = LOCALE_NAMES[targetLocale] || targetLocale

  const response = await ai.run('@cf/meta/m2m100-1.2b', {
    text,
    source_lang: 'italian',
    target_lang: targetName,
  }) as { translated_text?: string }

  return response?.translated_text ?? text
}

export const onRequestPost = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const body = await request.json().catch(() => null) as {
    pairs?: TranslationPair[]
    targetLocale?: string
  } | null

  if (!body?.pairs || !Array.isArray(body.pairs) || body.pairs.length === 0) {
    return json({ error: 'Missing pairs array' }, 400)
  }

  const targetLocale = body.targetLocale || ''
  const locales = targetLocale ? [targetLocale] : [...TARGET_LOCALES]

  const results: Record<string, Record<string, string>> = {}

  for (const locale of locales) {
    results[locale] = {}
    for (const pair of body.pairs) {
      try {
        const translated = await translateText(env.AI, pair.value, locale)
        results[locale][pair.key] = translated
      } catch (err) {
        console.error(`Translation of ${pair.key} to ${locale} failed:`, err)
        results[locale][pair.key] = pair.value
      }
    }
  }

  return json({ translations: results })
}
