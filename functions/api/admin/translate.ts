import { json, requireAdmin, type AdminEnv } from '../../_lib/admin'

type PagesContext = { request: Request; env: AdminEnv }

const TARGET_LOCALES = ['en', 'fr', 'de', 'es', 'ru'] as const

const LOCALE_NAMES: Record<string, string> = {
  en: 'English',
  fr: 'French',
  de: 'German',
  es: 'Spanish',
  ru: 'Russian',
}

interface TranslationPair {
  key: string
  value: string
}

async function translateBatch(
  ai: AdminEnv['AI'],
  texts: string[],
  targetLocale: string
): Promise<string[]> {
  const targetName = LOCALE_NAMES[targetLocale] || targetLocale
  const joined = texts.join('\n---SPLIT---\n')

  const response = await ai.run('@cf/meta/m2m100-1.2b', {
    text: joined,
    source_lang: 'Italian',
    target_lang: targetName,
  }) as { translated_text?: string }

  const translated = response?.translated_text ?? ''
  const parts = translated.split('---SPLIT---')
  if (parts.length === texts.length) {
    return parts.map((p) => p.trim())
  }
  // Fallback: return the full translation repeated if split failed
  return texts.map(() => translated.trim())
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
    const keys = body.pairs.map((p) => p.key)
    const values = body.pairs.map((p) => p.value)
    try {
      const translated = await translateBatch(env.AI, values, locale)
      results[locale] = {}
      for (let i = 0; i < keys.length; i++) {
        results[locale][keys[i]] = translated[i] || values[i]
      }
    } catch (err) {
      console.error(`Translation to ${locale} failed:`, err)
      return json({ error: `Translation to ${locale} failed` }, 500)
    }
  }

  return json({ translations: results })
}
