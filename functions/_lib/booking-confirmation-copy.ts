export const BOOKING_EMAIL_LOCALES = ['it', 'en', 'fr', 'de', 'es', 'ru'] as const
export type BookingEmailLocale = (typeof BOOKING_EMAIL_LOCALES)[number]

type BookingConfirmationCopy = {
  EMAIL_SUBJECT: string
  EMAIL_PREVIEW: string
  BOOKING_TITLE: string
  GREETING: string
  INTRO: string
  CHECK_IN_LABEL: string
  CHECK_OUT_LABEL: string
  STAY_LABEL: string
  PAYMENT_LABEL: string
  RECEIPT_LABEL: string
  BOOKING_REFERENCE_LABEL: string
  PORTAL_INSTRUCTIONS: string
  FOOTER: string
}

const COPY: Record<BookingEmailLocale, BookingConfirmationCopy> = {
  it: {
    EMAIL_SUBJECT: 'La prenotazione a Crooked House è confermata',
    EMAIL_PREVIEW: 'Il soggiorno è confermato. Consulta i dettagli della prenotazione.',
    BOOKING_TITLE: 'Prenotazione confermata',
    GREETING: 'Grazie,',
    INTRO: 'Abbiamo ricevuto il pagamento e il soggiorno è confermato. Non vediamo l’ora di accoglierti.',
    CHECK_IN_LABEL: 'Check-in',
    CHECK_OUT_LABEL: 'Check-out',
    STAY_LABEL: 'Soggiorno',
    PAYMENT_LABEL: 'Pagamento ricevuto',
    RECEIPT_LABEL: 'Ricevuta di pagamento',
    BOOKING_REFERENCE_LABEL: 'Codice prenotazione',
    PORTAL_INSTRUCTIONS: 'Per consultare la prenotazione o modificare i dati degli ospiti, accedi al sito con il tuo cognome e indirizzo e-mail.',
    FOOTER: 'Crooked House · Conferma della prenotazione',
  },
  en: {
    EMAIL_SUBJECT: 'Your booking at Crooked House is confirmed',
    EMAIL_PREVIEW: 'Your stay is confirmed. Review your booking details inside.',
    BOOKING_TITLE: 'Booking confirmed',
    GREETING: 'Thank you,',
    INTRO: 'Your payment has been received and your stay is confirmed. We look forward to welcoming you.',
    CHECK_IN_LABEL: 'Check-in',
    CHECK_OUT_LABEL: 'Check-out',
    STAY_LABEL: 'Stay',
    PAYMENT_LABEL: 'Payment received',
    RECEIPT_LABEL: 'Payment receipt',
    BOOKING_REFERENCE_LABEL: 'Booking reference',
    PORTAL_INSTRUCTIONS: 'To view your booking details or edit guest details, log in to the website using your surname and email address.',
    FOOTER: 'Crooked House · Booking confirmation',
  },
  fr: {
    EMAIL_SUBJECT: 'Votre réservation à Crooked House est confirmée',
    EMAIL_PREVIEW: 'Votre séjour est confirmé. Consultez les détails de votre réservation.',
    BOOKING_TITLE: 'Réservation confirmée',
    GREETING: 'Merci,',
    INTRO: 'Votre paiement a été reçu et votre séjour est confirmé. Nous avons hâte de vous accueillir.',
    CHECK_IN_LABEL: 'Arrivée',
    CHECK_OUT_LABEL: 'Départ',
    STAY_LABEL: 'Séjour',
    PAYMENT_LABEL: 'Paiement reçu',
    RECEIPT_LABEL: 'Reçu de paiement',
    BOOKING_REFERENCE_LABEL: 'Référence de réservation',
    PORTAL_INSTRUCTIONS: 'Pour consulter votre réservation ou modifier les informations des voyageurs, connectez-vous au site avec votre nom et votre adresse e-mail.',
    FOOTER: 'Crooked House · Confirmation de réservation',
  },
  de: {
    EMAIL_SUBJECT: 'Ihre Buchung im Crooked House ist bestätigt',
    EMAIL_PREVIEW: 'Ihr Aufenthalt ist bestätigt. Hier finden Sie Ihre Buchungsdetails.',
    BOOKING_TITLE: 'Buchung bestätigt',
    GREETING: 'Vielen Dank,',
    INTRO: 'Ihre Zahlung ist eingegangen und Ihr Aufenthalt ist bestätigt. Wir freuen uns auf Ihren Besuch.',
    CHECK_IN_LABEL: 'Anreise',
    CHECK_OUT_LABEL: 'Abreise',
    STAY_LABEL: 'Aufenthalt',
    PAYMENT_LABEL: 'Zahlung erhalten',
    RECEIPT_LABEL: 'Zahlungsbeleg',
    BOOKING_REFERENCE_LABEL: 'Buchungsnummer',
    PORTAL_INSTRUCTIONS: 'Um Ihre Buchung anzusehen oder Gästedaten zu ändern, melden Sie sich auf der Website mit Ihrem Nachnamen und Ihrer E-Mail-Adresse an.',
    FOOTER: 'Crooked House · Buchungsbestätigung',
  },
  es: {
    EMAIL_SUBJECT: 'Tu reserva en Crooked House está confirmada',
    EMAIL_PREVIEW: 'Tu estancia está confirmada. Consulta los detalles de la reserva.',
    BOOKING_TITLE: 'Reserva confirmada',
    GREETING: 'Gracias,',
    INTRO: 'Hemos recibido el pago y tu estancia está confirmada. Tenemos muchas ganas de darte la bienvenida.',
    CHECK_IN_LABEL: 'Entrada',
    CHECK_OUT_LABEL: 'Salida',
    STAY_LABEL: 'Estancia',
    PAYMENT_LABEL: 'Pago recibido',
    RECEIPT_LABEL: 'Recibo de pago',
    BOOKING_REFERENCE_LABEL: 'Referencia de reserva',
    PORTAL_INSTRUCTIONS: 'Para consultar tu reserva o modificar los datos de los huéspedes, inicia sesión en la web con tu apellido y tu correo electrónico.',
    FOOTER: 'Crooked House · Confirmación de reserva',
  },
  ru: {
    EMAIL_SUBJECT: 'Бронирование в Crooked House подтверждено',
    EMAIL_PREVIEW: 'Ваше проживание подтверждено. Ознакомьтесь с деталями бронирования.',
    BOOKING_TITLE: 'Бронирование подтверждено',
    GREETING: 'Спасибо,',
    INTRO: 'Оплата получена, и ваше проживание подтверждено. Будем рады вас приветствовать.',
    CHECK_IN_LABEL: 'Заезд',
    CHECK_OUT_LABEL: 'Выезд',
    STAY_LABEL: 'Проживание',
    PAYMENT_LABEL: 'Оплата получена',
    RECEIPT_LABEL: 'Квитанция об оплате',
    BOOKING_REFERENCE_LABEL: 'Номер бронирования',
    PORTAL_INSTRUCTIONS: 'Чтобы посмотреть бронирование или изменить данные гостей, войдите на сайт, указав фамилию и адрес электронной почты.',
    FOOTER: 'Crooked House · Подтверждение бронирования',
  },
}

const INTL_LOCALES: Record<BookingEmailLocale, string> = {
  it: 'it-IT',
  en: 'en-GB',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
  ru: 'ru-RU',
}

export function isBookingEmailLocale(value: unknown): value is BookingEmailLocale {
  return typeof value === 'string' && (BOOKING_EMAIL_LOCALES as readonly string[]).includes(value)
}

export function getBookingConfirmationVariables(
  locale: BookingEmailLocale,
  nights: number,
  guests: number,
): BookingConfirmationCopy & { EMAIL_LANGUAGE: string; STAY_SUMMARY: string } {
  const nightsLabel: Record<BookingEmailLocale, [string, string, string]> = {
    it: ['notte', 'notti', 'notti'],
    en: ['night', 'nights', 'nights'],
    fr: ['nuit', 'nuits', 'nuits'],
    de: ['Nacht', 'Nächte', 'Nächte'],
    es: ['noche', 'noches', 'noches'],
    ru: ['ночь', 'ночи', 'ночей'],
  }
  const guestLabel: Record<BookingEmailLocale, [string, string, string]> = {
    it: ['ospite', 'ospiti', 'ospiti'],
    en: ['guest', 'guests', 'guests'],
    fr: ['voyageur', 'voyageurs', 'voyageurs'],
    de: ['Gast', 'Gäste', 'Gäste'],
    es: ['huésped', 'huéspedes', 'huéspedes'],
    ru: ['гость', 'гостя', 'гостей'],
  }
  const pluralCategory = (value: number) => new Intl.PluralRules(INTL_LOCALES[locale]).select(value)
  const selectLabel = (value: number, labels: [string, string, string]) => {
    const category = pluralCategory(value)
    if (locale === 'ru') return labels[category === 'one' ? 0 : category === 'few' ? 1 : 2]
    return labels[value === 1 ? 0 : 1]
  }

  return {
    ...COPY[locale],
    EMAIL_LANGUAGE: locale,
    STAY_SUMMARY: `${nights} ${selectLabel(nights, nightsLabel[locale])} · ${guests} ${selectLabel(guests, guestLabel[locale])}`,
  }
}

export function getBookingEmailIntlLocale(locale: BookingEmailLocale): string {
  return INTL_LOCALES[locale]
}