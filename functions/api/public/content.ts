import { json, d1GetTranslations, type AdminEnv } from '../../_lib/admin'
import { locales, type Locale, type TranslationDictionary } from '../../../lib/i18n'
import { REQUIRED_CONTENT_KEYS } from '../../../lib/content-schema'
import de from '../../../translations/de.json'
import en from '../../../translations/en.json'
import es from '../../../translations/es.json'
import fr from '../../../translations/fr.json'
import it from '../../../translations/it.json'
import ru from '../../../translations/ru.json'

type PagesContext = { request: Request; env: AdminEnv }

const BUNDLED_TRANSLATIONS: Record<Locale, TranslationDictionary> = {
  it,
  en,
  fr,
  de,
  es,
  ru,
}

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
  if (locale !== 'it') {
    const italianContent = await d1GetTranslations(env.DB, 'it')
    for (const key of ['footer.bookingUrl', 'footer.airbnbUrl', 'footer.googleUrl']) {
      if (translations[key] === undefined && typeof italianContent[key] === 'string') {
        translations[key] = italianContent[key]
      }
    }
  }
  for (const key of REQUIRED_CONTENT_KEYS) {
    if (translations[key] === undefined) {
      const fallback = BUNDLED_TRANSLATIONS[locale][key]
      if (fallback !== undefined) translations[key] = fallback
    }
  }
  const missing = REQUIRED_CONTENT_KEYS.filter((key) => translations[key] === undefined)
  if (missing.length > 0) {
    return json({ error: 'Italian content is incomplete', missing }, 503)
  }
  return json(translations)
}
