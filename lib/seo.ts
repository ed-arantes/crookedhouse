import type { Metadata } from 'next'
import { defaultLocale, locales, type Locale } from '@/lib/i18n'

export const SITE_ORIGIN = 'https://crookedhouse.it'
export const SITE_NAME = 'Crooked House'
export const SITE_IMAGE = '/images/hero.webp'

const HOME_COPY: Record<Locale, { title: string; description: string; openGraphLocale: string }> = {
  it: {
    title: 'Casa vacanze sul Lago di Como',
    description:
      'Casa vacanze a Naggio, Grandola ed Uniti: appartamento per 4 ospiti con giardino privato, vicino al Lago di Como e al Lago di Lugano.',
    openGraphLocale: 'it_IT',
  },
  en: {
    title: 'Lake Como Holiday Apartment',
    description:
      'Stay at Crooked House, a one-bedroom holiday apartment in Naggio, Grandola ed Uniti, near Lake Como. Private garden and space for up to four guests.',
    openGraphLocale: 'en_GB',
  },
  fr: {
    title: 'Location de vacances au lac de Côme',
    description:
      'Séjournez au Crooked House, un appartement d’une chambre à Naggio, près du lac de Côme. Jardin privé et hébergement pour quatre personnes.',
    openGraphLocale: 'fr_FR',
  },
  de: {
    title: 'Ferienwohnung am Comer See',
    description:
      'Crooked House ist eine Ferienwohnung mit einem Schlafzimmer in Naggio bei Grandola ed Uniti, nahe dem Comer See, mit privatem Garten für bis zu vier Gäste.',
    openGraphLocale: 'de_DE',
  },
  es: {
    title: 'Apartamento vacacional en el Lago de Como',
    description:
      'Alójate en Crooked House, un apartamento de un dormitorio en Naggio, cerca del Lago de Como. Jardín privado y espacio para hasta cuatro huéspedes.',
    openGraphLocale: 'es_ES',
  },
  ru: {
    title: 'Апартаменты на озере Комо',
    description:
      'Crooked House — апартаменты с одной спальней в Наджо, рядом с озером Комо. Частный сад, размещение до четырёх гостей.',
    openGraphLocale: 'ru_RU',
  },
}

const PAGE_COPY: Record<
  'services' | 'privacy' | 'terms',
  Record<Locale, { title: string; description: string }>
> = {
  services: {
    it: {
      title: 'Servizi e colazioni',
      description: 'Scopri i servizi e le attenzioni disponibili durante il soggiorno a Crooked House, a Naggio sul Lago di Como.',
    },
    en: {
      title: 'Guest Services',
      description: 'Discover the services and thoughtful touches available during a stay at Crooked House near Lake Como.',
    },
    fr: {
      title: 'Services aux voyageurs',
      description: 'Découvrez les services et attentions proposés pendant un séjour au Crooked House, près du lac de Côme.',
    },
    de: {
      title: 'Service für Gäste',
      description: 'Entdecken Sie die Services und kleinen Aufmerksamkeiten während Ihres Aufenthalts im Crooked House am Comer See.',
    },
    es: {
      title: 'Servicios para huéspedes',
      description: 'Descubre los servicios y detalles disponibles durante tu estancia en Crooked House, cerca del Lago de Como.',
    },
    ru: {
      title: 'Услуги для гостей',
      description: 'Узнайте об услугах и приятных деталях отдыха в Crooked House рядом с озером Комо.',
    },
  },
  privacy: {
    it: {
      title: 'Privacy',
      description: 'Informazioni sul trattamento dei dati personali da parte di Crooked House.',
    },
    en: {
      title: 'Privacy Policy',
      description: 'Read how Crooked House handles personal information and protects guest privacy.',
    },
    fr: {
      title: 'Politique de confidentialité',
      description: 'Découvrez comment Crooked House traite les données personnelles et protège la vie privée des voyageurs.',
    },
    de: {
      title: 'Datenschutzerklärung',
      description: 'Erfahren Sie, wie Crooked House personenbezogene Daten verarbeitet und die Privatsphäre der Gäste schützt.',
    },
    es: {
      title: 'Política de privacidad',
      description: 'Consulta cómo Crooked House trata los datos personales y protege la privacidad de sus huéspedes.',
    },
    ru: {
      title: 'Политика конфиденциальности',
      description: 'Узнайте, как Crooked House обрабатывает персональные данные и защищает конфиденциальность гостей.',
    },
  },
  terms: {
    it: {
      title: 'Termini e condizioni',
      description: 'Consulta i termini e le condizioni di prenotazione e soggiorno a Crooked House.',
    },
    en: {
      title: 'Terms and Conditions',
      description: 'Review the terms and conditions for booking and staying at Crooked House.',
    },
    fr: {
      title: 'Conditions générales',
      description: 'Consultez les conditions de réservation et de séjour au Crooked House.',
    },
    de: {
      title: 'Allgemeine Geschäftsbedingungen',
      description: 'Lesen Sie die Buchungs- und Aufenthaltsbedingungen für Crooked House.',
    },
    es: {
      title: 'Términos y condiciones',
      description: 'Consulta las condiciones de reserva y estancia en Crooked House.',
    },
    ru: {
      title: 'Условия бронирования',
      description: 'Ознакомьтесь с условиями бронирования и проживания в Crooked House.',
    },
  },
}

const OPEN_GRAPH_LOCALES = Object.fromEntries(
  locales.map((locale) => [locale, HOME_COPY[locale].openGraphLocale]),
) as Record<Locale, string>

function localizedPath(locale: Locale, segment = '') {
  if (locale === defaultLocale) return segment ? `/${segment}` : '/'
  return segment ? `/${locale}/${segment}` : `/${locale}`
}

function languageAlternates(segment = '') {
  return {
    ...Object.fromEntries(
      locales.map((locale) => [locale, localizedPath(locale, segment)]),
    ),
    'x-default': localizedPath(defaultLocale, segment),
  }
}

function socialMetadata(
  locale: Locale,
  title: string,
  description: string,
  path: string,
): Pick<Metadata, 'openGraph' | 'twitter'> {
  const fullTitle = `${title} | ${SITE_NAME}`
  return {
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      url: path,
      locale: HOME_COPY[locale].openGraphLocale,
      alternateLocale: locales
        .filter((otherLocale) => otherLocale !== locale)
        .map((otherLocale) => OPEN_GRAPH_LOCALES[otherLocale]),
      images: [{ url: SITE_IMAGE, width: 1600, height: 900, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [SITE_IMAGE],
    },
  }
}

export function getHomeMetadata(locale: Locale): Metadata {
  const { title, description } = HOME_COPY[locale]
  const path = localizedPath(locale)
  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: languageAlternates(),
    },
    ...socialMetadata(locale, title, description, path),
  }
}

export function getLocalizedPageMetadata(
  locale: Locale,
  page: keyof typeof PAGE_COPY,
): Metadata {
  const { title, description } = PAGE_COPY[page][locale]
  const path = localizedPath(locale, page === 'services' ? 'servizi' : page)
  const segment = page === 'services' ? 'servizi' : page
  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: languageAlternates(segment),
    },
    ...socialMetadata(locale, title, description, path),
  }
}

export function getFaqMetadata(): Metadata {
  const title = 'Domande frequenti'
  const description =
    'Risposte a domande su prenotazioni, arrivo, servizi e soggiorni a Crooked House, a Naggio vicino al Lago di Como.'
  const path = '/faq'

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    ...socialMetadata(defaultLocale, title, description, path),
  }
}
