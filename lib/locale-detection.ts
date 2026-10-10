import { locales, type Locale } from './i18n'

const COUNTRY_LOCALES: Record<string, Locale[]> = {
  IT: ['it'],
  SM: ['it'],
  VA: ['it'],

  ES: ['es'],
  AR: ['es'],
  BO: ['es'],
  CL: ['es'],
  CO: ['es'],
  CR: ['es'],
  CU: ['es'],
  DO: ['es'],
  EC: ['es'],
  SV: ['es'],
  GQ: ['es', 'fr'],
  GT: ['es'],
  HN: ['es'],
  MX: ['es'],
  NI: ['es'],
  PA: ['es'],
  PE: ['es'],
  PR: ['es'],
  PY: ['es'],
  UY: ['es'],
  VE: ['es'],

  FR: ['fr'],
  BE: ['fr', 'de', 'en'],
  CH: ['de', 'fr', 'it', 'en'],
  LU: ['fr', 'de', 'en'],
  MC: ['fr'],
  CA: ['en', 'fr'],
  HT: ['fr'],
  BJ: ['fr'],
  BF: ['fr'],
  BI: ['fr', 'en'],
  CM: ['fr', 'en'],
  CF: ['fr'],
  TD: ['fr'],
  KM: ['fr'],
  CG: ['fr'],
  CD: ['fr'],
  CI: ['fr'],
  DJ: ['fr'],
  GA: ['fr'],
  GN: ['fr'],
  MG: ['fr'],
  ML: ['fr'],
  NE: ['fr'],
  SN: ['fr'],
  SC: ['fr', 'en'],
  TG: ['fr'],
  RW: ['en', 'fr'],
  VU: ['en', 'fr'],

  DE: ['de'],
  AT: ['de'],
  LI: ['de'],

  RU: ['ru'],
  BY: ['ru'],
  KZ: ['ru'],
  KG: ['ru'],
}

function acceptedLocales(acceptLanguage: string): Locale[] {
  return acceptLanguage
    .split(',')
    .map((part, index) => {
      const [tag, ...parameters] = part.trim().split(';')
      const quality = parameters
        .map((parameter) => /^q=(0(?:\.\d+)?|1(?:\.0+)?)$/i.exec(parameter.trim()))
        .find(Boolean)
      return {
        locale: tag.split('-')[0].toLowerCase(),
        quality: quality ? Number(quality[1]) : 1,
        index,
      }
    })
    .filter((entry) => entry.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index)
    .map((entry) => entry.locale)
    .filter((locale): locale is Locale => locales.includes(locale as Locale))
}

export function getLocaleFromAcceptLanguage(acceptLanguage: string): Locale {
  return acceptedLocales(acceptLanguage)[0] ?? 'en'
}

export function getLocaleForCountry(country: string | undefined, acceptLanguage: string): Locale {
  const countryLocales = country ? COUNTRY_LOCALES[country.toUpperCase()] : undefined
  if (country && !countryLocales) return 'en'
  if (!countryLocales) return getLocaleFromAcceptLanguage(acceptLanguage)

  const browserPreference = acceptedLocales(acceptLanguage)
    .find((locale) => countryLocales.includes(locale))
  return browserPreference ?? countryLocales[0] ?? 'en'
}

export function getLocalePreference(cookieHeader: string | null): Locale | null {
  const cookie = cookieHeader
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('crookedhouse_locale='))
  const value = cookie?.slice('crookedhouse_locale='.length)
  return value && locales.includes(value as Locale) ? value as Locale : null
}
