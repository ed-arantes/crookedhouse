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

const PROTECTED_PHRASES = ['Crooked House', 'Grandola ed Uniti']

interface TranslationPair {
  key: string
  value: string
}

function protect(text: string): { clean: string; restore: (s: string) => string } {
  const placeholders: string[] = []
  let clean = text
  for (let i = 0; i < PROTECTED_PHRASES.length; i++) {
    const phrase = PROTECTED_PHRASES[i]
    const marker = `__PH${i}__`
    if (clean.includes(phrase)) {
      clean = clean.replaceAll(phrase, marker)
      placeholders.push(marker)
    }
  }
  return {
    clean,
    restore: (s: string) => {
      let result = s
      for (let i = 0; i < PROTECTED_PHRASES.length; i++) {
        const marker = `__PH${i}__`
        result = result.replaceAll(marker, PROTECTED_PHRASES[i])
        result = result.replaceAll(marker.toLowerCase(), PROTECTED_PHRASES[i])
      }
      return result
    },
  }
}

function preserveCase(original: string, translated: string): string {
  if (!original || !translated) return translated

  const startsUpper = /^[A-ZÀ-Ý]/.test(original)
  const isAllUpper = original === original.toUpperCase() && original !== original.toLowerCase()

  if (isAllUpper) {
    return translated.toUpperCase()
  }
  if (startsUpper && translated.length > 0) {
    return translated.charAt(0).toUpperCase() + translated.slice(1)
  }
  return translated
}

async function translateText(
  ai: AdminEnv['AI'],
  text: string,
  targetLocale: string
): Promise<string> {
  const targetName = LOCALE_NAMES[targetLocale] || targetLocale
  const { clean, restore } = protect(text)

  const response = await ai.run('@cf/meta/m2m100-1.2b', {
    text: clean,
    source_lang: 'italian',
    target_lang: targetName,
  }) as { translated_text?: string }

  const translated = restore(response?.translated_text ?? clean)
  return preserveCase(text, translated)
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
