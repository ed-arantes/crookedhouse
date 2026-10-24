import type { MetadataRoute } from 'next'
import { defaultLocale, locales } from '@/lib/i18n'
import { SITE_ORIGIN } from '@/lib/seo'

export const dynamic = 'force-static'

function localizedPath(locale: (typeof locales)[number], segment = '') {
  if (locale === defaultLocale) return segment ? `/${segment}` : '/'
  return segment ? `/${locale}/${segment}` : `/${locale}`
}

function languageAlternates(segment = ''): Record<string, string> {
  return {
    ...Object.fromEntries(
      locales.map((locale) => [
        locale,
        `${SITE_ORIGIN}${localizedPath(locale, segment)}`,
      ]),
    ),
    'x-default': `${SITE_ORIGIN}${localizedPath(defaultLocale, segment)}`,
  }
}

function localizedPage(segment: string): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_ORIGIN}${localizedPath(defaultLocale, segment)}`,
    alternates: {
      languages: languageAlternates(segment),
    },
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_ORIGIN}/`,
      alternates: {
        languages: languageAlternates(),
      },
    },
    {
      url: `${SITE_ORIGIN}/faq`,
      alternates: {
        languages: languageAlternates('faq'),
      },
    },
    localizedPage('servizi'),
    localizedPage('privacy'),
    localizedPage('terms'),
    ...locales
      .filter((locale) => locale !== defaultLocale)
      .map((locale) => ({
        url: `${SITE_ORIGIN}${localizedPath(locale)}`,
        alternates: {
          languages: languageAlternates(),
        },
      })),
  ]
}
