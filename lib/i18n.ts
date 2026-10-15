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
    'errors.guestDetailsEncryption': 'Il pagamento non è disponibile: la cifratura dei dati degli ospiti non è configurata. Contatta la struttura.',
    'errors.guestDetailsStorageNotConfigured': 'Il pagamento non è disponibile perché l’archivio dei dati degli ospiti non è configurato. Contatta la struttura.',
    'errors.baseFareNotConfigured': 'Il pagamento non è disponibile perché la tariffa base non è configurata. Contatta la struttura.',
    'errors.stripeSecretKeyNotConfigured': 'La chiave segreta Stripe (STRIPE_SECRET_KEY) non è configurata. Contatta la struttura.',
    'errors.stripePublishableKeyNotConfigured': 'La chiave pubblicabile Stripe (STRIPE_PUBLISHABLE_KEY) non è configurata per il pagamento con carta. Contatta la struttura.',
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
    'errors.guestDetailsEncryption': 'Checkout is unavailable because guest-detail encryption is not configured. Please contact the property.',
    'errors.guestDetailsStorageNotConfigured': 'Checkout is unavailable because guest-detail storage is not configured. Please contact the property.',
    'errors.baseFareNotConfigured': 'Checkout is unavailable because the base fare is not configured. Please contact the property.',
    'errors.stripeSecretKeyNotConfigured': 'The Stripe secret key (STRIPE_SECRET_KEY) is not configured. Please contact the property.',
    'errors.stripePublishableKeyNotConfigured': 'The Stripe publishable key (STRIPE_PUBLISHABLE_KEY) is not configured for card payments. Please contact the property.',
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
    'errors.guestDetailsEncryption': 'Le paiement est indisponible, car le chiffrement des informations des voyageurs n’est pas configuré. Contactez l’établissement.',
    'errors.guestDetailsStorageNotConfigured': 'Le paiement est indisponible, car le stockage des informations des voyageurs n’est pas configuré. Contactez l’établissement.',
    'errors.baseFareNotConfigured': 'Le paiement est indisponible, car le tarif de base n’est pas configuré. Contactez l’établissement.',
    'errors.stripeSecretKeyNotConfigured': 'La clé secrète Stripe (STRIPE_SECRET_KEY) n’est pas configurée. Contactez l’établissement.',
    'errors.stripePublishableKeyNotConfigured': 'La clé publique Stripe (STRIPE_PUBLISHABLE_KEY) n’est pas configurée pour le paiement par carte. Contactez l’établissement.',
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
    'errors.guestDetailsEncryption': 'Die Zahlung ist nicht verfügbar, da die Verschlüsselung der Gästedaten nicht konfiguriert ist. Bitte kontaktieren Sie die Unterkunft.',
    'errors.guestDetailsStorageNotConfigured': 'Die Zahlung ist nicht verfügbar, da der Speicher für Gästedaten nicht konfiguriert ist. Bitte kontaktieren Sie die Unterkunft.',
    'errors.baseFareNotConfigured': 'Die Zahlung ist nicht verfügbar, da der Grundpreis nicht konfiguriert ist. Bitte kontaktieren Sie die Unterkunft.',
    'errors.stripeSecretKeyNotConfigured': 'Der Stripe-Geheimschlüssel (STRIPE_SECRET_KEY) ist nicht konfiguriert. Bitte kontaktieren Sie die Unterkunft.',
    'errors.stripePublishableKeyNotConfigured': 'Der veröffentlichbare Stripe-Schlüssel (STRIPE_PUBLISHABLE_KEY) ist für Kartenzahlungen nicht konfiguriert. Bitte kontaktieren Sie die Unterkunft.',
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
    'errors.guestDetailsEncryption': 'El pago no está disponible porque no está configurado el cifrado de los datos de los huéspedes. Contacta con el alojamiento.',
    'errors.guestDetailsStorageNotConfigured': 'El pago no está disponible porque no está configurado el almacenamiento de los datos de los huéspedes. Contacta con el alojamiento.',
    'errors.baseFareNotConfigured': 'El pago no está disponible porque no está configurada la tarifa base. Contacta con el alojamiento.',
    'errors.stripeSecretKeyNotConfigured': 'La clave secreta de Stripe (STRIPE_SECRET_KEY) no está configurada. Contacta con el alojamiento.',
    'errors.stripePublishableKeyNotConfigured': 'La clave publicable de Stripe (STRIPE_PUBLISHABLE_KEY) no está configurada para pagos con tarjeta. Contacta con el alojamiento.',
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
    'errors.guestDetailsEncryption': 'Оплата недоступна: шифрование данных гостей не настроено. Свяжитесь с объектом размещения.',
    'errors.guestDetailsStorageNotConfigured': 'Оплата недоступна: хранилище данных гостей не настроено. Свяжитесь с объектом размещения.',
    'errors.baseFareNotConfigured': 'Оплата недоступна: базовый тариф не настроен. Свяжитесь с объектом размещения.',
    'errors.stripeSecretKeyNotConfigured': 'Секретный ключ Stripe (STRIPE_SECRET_KEY) не настроен. Свяжитесь с объектом размещения.',
    'errors.stripePublishableKeyNotConfigured': 'Публичный ключ Stripe (STRIPE_PUBLISHABLE_KEY) не настроен для оплаты картой. Свяжитесь с объектом размещения.',
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
