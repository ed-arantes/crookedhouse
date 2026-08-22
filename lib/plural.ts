import { t, type Locale } from './i18n'

/**
 * Returns the correctly inflected word for a count.
 * count=1 → singular key, count≠1 → plural key.
 */
export function plural(
  locale: Locale,
  count: number,
  singularKey: string,
  pluralKey: string,
  vars?: Record<string, string | number>,
): string {
  const key = count === 1 ? singularKey : pluralKey
  return t(locale, key, { count, ...vars })
}
