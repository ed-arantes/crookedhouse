import deLocale from '@/translations/de.json'
import enLocale from '@/translations/en.json'
import esLocale from '@/translations/es.json'
import frLocale from '@/translations/fr.json'
import itLocale from '@/translations/it.json'

export const defaultLocale = 'it' as const
export const locales = ['it', 'en', 'fr', 'de', 'es'] as const
export type Locale = (typeof locales)[number]
export type TranslationDictionary = Record<string, string | string[]>
export type TranslationKey = string

const runtimeTranslations: Record<Locale, TranslationDictionary> = {
  it: itLocale,
  en: enLocale,
  fr: frLocale,
  de: deLocale,
  es: esLocale,
}

const contentOverrides: Record<string, TranslationDictionary> = {}
let version = 0
let listeners: Array<() => void> = []

export function subscribeToContentChanges(listener: () => void): () => void {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

export function getContentVersion(): number {
  return version
}

export function setContentOverrides(locale: string, overrides: TranslationDictionary) {
  contentOverrides[locale] = overrides
  version++
  for (const l of listeners) l()
}

export function getContentOverrides(locale: string): TranslationDictionary {
  return contentOverrides[locale] ?? {}
}

export function getLocaleFromPathname(pathname: string): Locale {
  const match = pathname.match(/^\/([a-z]{2})(?:\/|$)/)
  const locale = match?.[1] as Locale | undefined
  return locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale
}

function replacePlaceholders(
  value: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return value
  return value.replace(/\{([^}]+)\}/g, (_, placeholder: string) => {
    const replacement = vars[placeholder.trim()]
    return replacement !== undefined ? String(replacement) : `{${placeholder}}`
  })
}

export function t(
  locale: Locale | undefined,
  key: TranslationKey,
  vars?: Record<string, string | number>,
): string {
  const activeLocale = locale && locales.includes(locale) ? locale : defaultLocale
  const override = contentOverrides[activeLocale]?.[key]
  const translation = (typeof override === 'string' ? override : undefined) ??
    runtimeTranslations[activeLocale]?.[key] ??
    runtimeTranslations[defaultLocale]?.[key] ??
    runtimeTranslations.en?.[key] ??
    key

  if (Array.isArray(translation)) return key
  return replacePlaceholders(translation, vars)
}

export function tArray(
  locale: Locale | undefined,
  key: TranslationKey,
): string[] {
  const activeLocale = locale && locales.includes(locale) ? locale : defaultLocale
  const override = contentOverrides[activeLocale]?.[key]
  if (Array.isArray(override)) return override

  const translation =
    runtimeTranslations[activeLocale]?.[key] ??
    runtimeTranslations[defaultLocale]?.[key] ??
    runtimeTranslations.en?.[key] ??
    []
  return Array.isArray(translation) ? translation : []
}
