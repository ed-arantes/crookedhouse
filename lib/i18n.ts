export const defaultLocale = 'it' as const
export const locales = ['it', 'en', 'fr', 'de', 'es', 'ru'] as const
export type Locale = (typeof locales)[number]
export type TranslationDictionary = Record<string, string | string[]>
export type TranslationKey = string

const UI_FALLBACKS: Record<Locale, Record<string, string>> = {
  it: {
    'actions.retry': 'Riprova',
    'aria.map': 'Mappa di Naggio, Italia',
    'aria.selectLanguage': 'Seleziona la lingua',
    'aria.toggleMenu': 'Apri o chiudi il menu',
    'errors.checkout': 'Non è stato possibile avviare il pagamento. Riprova.',
    'errors.contentUnavailable': 'I contenuti non sono disponibili al momento.',
    'footer.property': 'Struttura',
    'footer.whatsappIncluded': '(incluso WhatsApp)',
    'gallery.closePhoto': 'Chiudi la foto',
    'gallery.nextPhoto': 'Foto successiva',
    'gallery.openPhoto': 'Apri foto {index}',
    'gallery.previousPhoto': 'Foto precedente',
    'status.loading': 'Caricamento...',
  },
  en: {
    'actions.retry': 'Try again',
    'aria.map': 'Map showing Naggio, Italy',
    'aria.selectLanguage': 'Select language',
    'aria.toggleMenu': 'Open or close the menu',
    'errors.checkout': 'We could not start checkout. Please try again.',
    'errors.contentUnavailable': 'Content is currently unavailable.',
    'footer.property': 'Property',
    'footer.whatsappIncluded': '(WhatsApp included)',
    'gallery.closePhoto': 'Close photo',
    'gallery.nextPhoto': 'Next photo',
    'gallery.openPhoto': 'Open photo {index}',
    'gallery.previousPhoto': 'Previous photo',
    'status.loading': 'Loading...',
  },
  fr: {
    'actions.retry': 'Réessayer',
    'aria.map': 'Carte de Naggio, Italie',
    'aria.selectLanguage': 'Choisir la langue',
    'aria.toggleMenu': 'Ouvrir ou fermer le menu',
    'errors.checkout': 'Le paiement n’a pas pu être lancé. Veuillez réessayer.',
    'errors.contentUnavailable': 'Le contenu est momentanément indisponible.',
    'footer.property': 'Établissement',
    'footer.whatsappIncluded': '(WhatsApp inclus)',
    'gallery.closePhoto': 'Fermer la photo',
    'gallery.nextPhoto': 'Photo suivante',
    'gallery.openPhoto': 'Ouvrir la photo {index}',
    'gallery.previousPhoto': 'Photo précédente',
    'status.loading': 'Chargement...',
  },
  de: {
    'actions.retry': 'Erneut versuchen',
    'aria.map': 'Karte von Naggio, Italien',
    'aria.selectLanguage': 'Sprache auswählen',
    'aria.toggleMenu': 'Menü öffnen oder schließen',
    'errors.checkout': 'Der Zahlungsvorgang konnte nicht gestartet werden. Bitte versuchen Sie es erneut.',
    'errors.contentUnavailable': 'Die Inhalte sind derzeit nicht verfügbar.',
    'footer.property': 'Unterkunft',
    'footer.whatsappIncluded': '(WhatsApp inklusive)',
    'gallery.closePhoto': 'Foto schließen',
    'gallery.nextPhoto': 'Nächstes Foto',
    'gallery.openPhoto': 'Foto {index} öffnen',
    'gallery.previousPhoto': 'Vorheriges Foto',
    'status.loading': 'Wird geladen...',
  },
  es: {
    'actions.retry': 'Intentar de nuevo',
    'aria.map': 'Mapa de Naggio, Italia',
    'aria.selectLanguage': 'Seleccionar idioma',
    'aria.toggleMenu': 'Abrir o cerrar el menú',
    'errors.checkout': 'No se pudo iniciar el pago. Inténtalo de nuevo.',
    'errors.contentUnavailable': 'El contenido no está disponible en este momento.',
    'footer.property': 'Alojamiento',
    'footer.whatsappIncluded': '(WhatsApp incluido)',
    'gallery.closePhoto': 'Cerrar foto',
    'gallery.nextPhoto': 'Foto siguiente',
    'gallery.openPhoto': 'Abrir foto {index}',
    'gallery.previousPhoto': 'Foto anterior',
    'status.loading': 'Cargando...',
  },
  ru: {
    'actions.retry': 'Повторить попытку',
    'aria.map': 'Карта Наджо, Италия',
    'aria.selectLanguage': 'Выбрать язык',
    'aria.toggleMenu': 'Открыть или закрыть меню',
    'errors.checkout': 'Не удалось перейти к оплате. Попробуйте ещё раз.',
    'errors.contentUnavailable': 'Сейчас содержимое недоступно.',
    'footer.property': 'Объект размещения',
    'footer.whatsappIncluded': '(WhatsApp включён)',
    'gallery.closePhoto': 'Закрыть фото',
    'gallery.nextPhoto': 'Следующее фото',
    'gallery.openPhoto': 'Открыть фото {index}',
    'gallery.previousPhoto': 'Предыдущее фото',
    'status.loading': 'Загрузка...',
  },
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
  const translation =
    contentOverrides[activeLocale]?.[key] ??
    contentOverrides[defaultLocale]?.[key] ??
    contentOverrides.en?.[key] ??
    UI_FALLBACKS[activeLocale][key] ??
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
    contentOverrides[defaultLocale]?.[key] ??
    contentOverrides.en?.[key] ??
    []
  return Array.isArray(translation) ? translation : []
}
