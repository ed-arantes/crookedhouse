export type Review = {
  id: string
  name: string
  location: string
  title?: string
  text: string
  rating?: number
  source: 'booking' | 'agoda' | 'airbnb'
}

export type BlockedDate = {
  date: string
  reason?: string
}

function getPassword(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('admin_password') || ''
}

export function setPassword(password: string) {
  localStorage.setItem('admin_password', password)
}

export function clearPassword() {
  localStorage.removeItem('admin_password')
}

const ADMIN_ERROR_TRANSLATIONS: Record<string, string> = {
  'Admin not configured': 'Accesso amministratore non configurato.',
  'Invalid password': 'Password non corretta.',
  'Locale not available': 'Lingua non disponibile.',
  'Missing locale or overrides': 'Indica la lingua e i contenuti da salvare.',
  'Invalid translation value': 'Valore di traduzione non valido.',
  'Missing id': 'Identificativo mancante.',
  'Booking not found': 'Prenotazione non trovata.',
  'No remaining payment due for this booking': 'Non ci sono importi residui da richiedere per questa prenotazione.',
  'Messaging is not configured': 'Il servizio messaggi non è configurato.',
  'Payment has already been requested or is no longer due': 'Il pagamento è già stato richiesto oppure non è più dovuto.',
  'Unable to record payment request': 'Impossibile registrare la richiesta di pagamento.',
  'Invalid check-in or check-out date': 'La data di arrivo o di partenza non è valida.',
  'Stay must be between 1 and 365 nights': 'Il soggiorno deve essere compreso tra 1 e 365 notti.',
  'Pending bookings cannot be amended until their existing checkout is handled.': 'Le prenotazioni in attesa non possono essere modificate finché il pagamento esistente non è stato gestito.',
  'Dates overlap another confirmed booking': 'Le date si sovrappongono a un’altra prenotazione confermata.',
  'Unable to verify calendar availability. Try again later.': 'Impossibile verificare la disponibilità del calendario. Riprova più tardi.',
  'Base fare is not configured': 'La tariffa base non è configurata.',
  'Booking could not be updated': 'Impossibile aggiornare la prenotazione.',
  'Unable to amend booking': 'Impossibile modificare la prenotazione.',
  'Missing status': 'Stato mancante.',
  'Invalid status': 'Stato non valido.',
  'Missing dates': 'Seleziona le date da bloccare.',
  'Missing date': 'Data mancante.',
  'Date not found': 'Data non trovata.',
  'Missing url': 'URL mancante.',
  'Unable to load messages': 'Impossibile caricare i messaggi.',
  'A booking and a message of up to 2000 characters are required': 'Seleziona una prenotazione e inserisci un messaggio di massimo 2000 caratteri.',
  'Unable to send reply': 'Impossibile inviare la risposta.',
  'Expected multipart/form-data': 'Formato di caricamento non valido.',
  'Missing file or section': 'File o sezione mancante.',
  'File must be an image': 'Il file deve essere un’immagine.',
  'Image not found': 'Immagine non trovata.',
  'Missing section or orderedIds': 'Sezione o ordine delle immagini mancante.',
  'Missing required fields': 'Compila tutti i campi obbligatori.',
  'Review not found': 'Recensione non trovata.',
  'Missing ids': 'Identificativi mancanti.',
  'Missing pairs array': 'Elenco dei testi da tradurre mancante.',
  'Invalid pricing condition': 'Condizione di prezzo non valida.',
  'Invalid date adjustment condition': 'Variazione per date non valida.',
  'Invalid recurring date adjustment condition': 'Variazione ricorrente annuale non valida.',
  'Invalid night discount condition': 'Sconto per durata non valido.',
  'Invalid council tax amount': 'Importo della tassa di soggiorno non valido.',
  'Invalid animal surcharge': 'Importo del supplemento animali non valido.',
  'Invalid base fare': 'Tariffa base non valida.',
  'Guest details encryption is not configured': 'La cifratura dei dati degli ospiti non è configurata.',
  'Missing booking id': 'Identificativo della prenotazione mancante.',
  'Unable to load guest details': 'Impossibile caricare i dati degli ospiti.',
  'Unable to save guest details': 'Impossibile salvare i dati degli ospiti.',
  'Unable to delete guest details': 'Impossibile eliminare i dati degli ospiti.',
  'Enter valid details for each guest and a document number for the group leader': 'Inserisci i dati validi di ogni ospite e il  del documento del capogruppo.',
  'Resend API key is not configured': 'La chiave API Resend non è configurata nell’ambiente Cloudflare Pages.',
  'Booking confirmation template is not configured': 'Configura RESEND_BOOKING_CONFIRMATION_TEMPLATE_ID con l’ID del template confirmation-it pubblicato.',
}

function translateAdminError(message: string, status: number): string {
  const knownTranslation = ADMIN_ERROR_TRANSLATIONS[message]
  if (knownTranslation) return knownTranslation
  const invalidSection = /^Invalid section: (.+)$/.exec(message)
  if (invalidSection) return `Sezione non valida: ${invalidSection[1]}`
  const invalidDate = /^Invalid date format: (.+)$/.exec(message)
  if (invalidDate) return `Formato data non valido: ${invalidDate[1]}`
  if (/^Date .+ is unavailable$/.test(message)) return 'La data selezionata non è disponibile.'
  const resendFailure = /^(?:Resend could not send the booking confirmation test|Unable to send the booking confirmation test): (.+)$/.exec(message)
  if (resendFailure) return `Invio del test di conferma non riuscito. Dettagli Resend: ${resendFailure[1]}`
  if (status === 401 || status === 403) return 'Accesso non autorizzato. Verifica la password amministratore.'
  if (status >= 500) return 'Si è verificato un errore del server. Riprova più tardi.'
  return 'Impossibile completare l’operazione. Verifica i dati e riprova.'
}

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${getPassword()}` }
}

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(apiUrl(path), {
      ...init,
      headers: { ...authHeaders(), ...init?.headers },
    })
  } catch {
    throw new Error('Impossibile connettersi al server. Controlla la connessione e riprova.')
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    const message = typeof body.error === 'string' ? body.error : res.statusText
    throw new Error(translateAdminError(message, res.status))
  }
  try {
    return await res.json()
  } catch {
    throw new Error('Il server ha restituito una risposta non valida.')
  }
}

export async function adminLogin(password: string): Promise<boolean> {
  let res: Response
  try {
    res = await fetch(apiUrl('/api/admin/auth'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
  } catch {
    throw new Error('Impossibile connettersi al server. Controlla la connessione e riprova.')
  }
  if (res.status === 401) return false
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    const message = typeof body.error === 'string' ? body.error : res.statusText
    throw new Error(translateAdminError(message, res.status))
  }
  setPassword(password)
  return true
}

export function fetchReviews(): Promise<Review[]> {
  return adminFetch('/api/admin/reviews')
}

export function sendTestEmail(to: string): Promise<{ ok: boolean; id: string }> {
  return adminFetch('/api/admin/test-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to }),
  })
}

export type BookingConfirmationTest = {
  to: string
  guestName: string
  checkIn: string
  checkOut: string
  nights: number
  guests: number
  totalPaid: number
  bookingReference: string
}

export function sendTestBookingConfirmation(
  confirmation: BookingConfirmationTest,
): Promise<{ ok: boolean; id: string }> {
  return adminFetch('/api/admin/test-confirmation-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(confirmation),
  })
}

export function createReview(review: Omit<Review, 'id'>): Promise<Review> {
  return adminFetch('/api/admin/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review),
  })
}

export function updateReview(review: Review): Promise<Review> {
  return adminFetch('/api/admin/reviews', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review),
  })
}

export function deleteReview(id: string): Promise<{ ok: boolean }> {
  return adminFetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' })
}

export function reorderReviews(ids: string[]): Promise<Review[]> {
  return adminFetch('/api/admin/reviews', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  })
}

export function fetchBlockedDates(): Promise<BlockedDate[]> {
  return adminFetch('/api/admin/blocked-dates')
}

export function addBlockedDates(dates: string[], reason?: string): Promise<BlockedDate[]> {
  return adminFetch('/api/admin/blocked-dates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dates, reason }),
  })
}

export function removeBlockedDate(date: string): Promise<{ ok: boolean }> {
  return adminFetch(`/api/admin/blocked-dates?date=${date}`, { method: 'DELETE' })
}

export function fetchAllContent(): Promise<
  Record<string, Record<string, string | string[]>>
> {
  return adminFetch('/api/admin/content')
}

export function saveContent(locale: string, overrides: Record<string, string | string[]>): Promise<{ ok: boolean }> {
  return adminFetch('/api/admin/content', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locale, overrides }),
  })
}

export interface TranslateResponse {
  translations: Record<string, Record<string, string>>
}

export function translateContent(pairs: { key: string; value: string }[], targetLocale?: string): Promise<TranslateResponse> {
  return adminFetch('/api/admin/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pairs, targetLocale }),
  })
}

export function fetchIcalUrls(): Promise<{ airbnbUrl: string; bookingUrl: string; exportUrl: string }> {
  return adminFetch('/api/admin/ical')
}

export type ICalSource = 'airbnb' | 'booking'

export type ICalEvent = {
  summary: string
  start: string
  end: string
  nights: number
}

export type ICalFeedPreview = {
  source: ICalSource
  url: string
  events: ICalEvent[]
  error?: string
}

export function fetchIcalPreview(): Promise<{ feeds: ICalFeedPreview[] }> {
  return adminFetch('/api/admin/ical?preview=1')
}

export function saveIcalUrls(airbnbUrl: string, bookingUrl: string): Promise<{ ok: boolean }> {
  return adminFetch('/api/admin/ical', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ airbnbUrl, bookingUrl }),
  })
}

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------

export type AdminImage = {
  id: string
  section: string
  url: string
  alt: string
  span: string
  sort_order: number
}

export function fetchAllImages(): Promise<AdminImage[]> {
  return adminFetch('/api/admin/images')
}

export function uploadImage(file: File, section: string, alt: string, span?: string): Promise<AdminImage> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('section', section)
  formData.append('alt', alt)
  if (span) formData.append('span', span)

  return adminFetch('/api/admin/images', {
    method: 'POST',
    body: formData,
  })
}

export function updateImage(id: string, fields: { alt?: string; span?: string; section?: string }): Promise<{ ok: boolean }> {
  return adminFetch('/api/admin/images', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...fields }),
  })
}

export function deleteImage(id: string): Promise<{ ok: boolean }> {
  return adminFetch(`/api/admin/images?id=${id}`, { method: 'DELETE' })
}

export function reorderImages(section: string, orderedIds: string[]): Promise<AdminImage[]> {
  return adminFetch('/api/admin/images', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ section, orderedIds }),
  })
}

export function fetchR2BaseUrl(): Promise<{ url: string }> {
  return adminFetch('/api/admin/images/settings')
}

export function saveR2BaseUrl(url: string): Promise<{ ok: boolean }> {
  return adminFetch('/api/admin/images/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

export type AdminBooking = {
  id: string
  session_id: string
  first_name: string
  last_name: string
  email: string
  check_in: string
  check_out: string
  nights: number
  adults: number
  children: number
  pets: number
  message: string
  total_price: number
  paid_amount: number
  credit_amount: number
  payment_requested_at: string | null
  status: string
  created_at: string
}

export type BookingGuestDetails = {
  first_name: string
  last_name: string
  date_of_birth: string
  place_of_birth?: string
  document_type?: string
  document_number?: string
}

export function fetchBookingGuestDetails(
  bookingId: string,
): Promise<{ guests: BookingGuestDetails[] | null }> {
  return adminFetch(`/api/admin/guest-details?booking_id=${encodeURIComponent(bookingId)}`)
}

export function saveBookingGuestDetails(
  bookingId: string,
  guests: BookingGuestDetails[],
): Promise<{ ok: boolean }> {
  return adminFetch('/api/admin/guest-details', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ booking_id: bookingId, guests }),
  })
}

export function deleteBookingGuestDetails(bookingId: string): Promise<{ ok: boolean; deleted: boolean }> {
  return adminFetch(`/api/admin/guest-details?booking_id=${encodeURIComponent(bookingId)}`, {
    method: 'DELETE',
  })
}

export type AdminMessage = {
  id: string
  booking_id: string
  sender: 'guest' | 'host'
  message: string
  created_at: string
  guest_name: string
  guest_email: string
  check_in: string
  check_out: string
}

export function fetchAdminMessages(): Promise<AdminMessage[]> {
  return adminFetch('/api/admin/messages')
}

export function replyToGuest(bookingId: string, message: string): Promise<{ ok: boolean }> {
  return adminFetch('/api/admin/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ booking_id: bookingId, message }),
  })
}

export function fetchBookings(status?: string): Promise<AdminBooking[]> {
  const qs = status ? `?status=${status}` : ''
  return adminFetch(`/api/admin/bookings${qs}`)
}

export function updateBookingStatus(id: string, status: string): Promise<{ ok: boolean }> {
  return adminFetch('/api/admin/bookings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status }),
  })
}

export type BookingAmendmentResult = {
  ok: boolean
  check_in: string
  check_out: string
  nights: number
  total_price: number
  paid_amount: number
  due_amount: number
  credit_amount: number
}

export function amendBooking(
  id: string,
  checkIn: string,
  checkOut: string,
): Promise<BookingAmendmentResult> {
  return adminFetch('/api/admin/bookings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, action: 'amend', check_in: checkIn, check_out: checkOut }),
  })
}

export function requestBookingPayment(id: string): Promise<{ ok: boolean; payment_connected: boolean }> {
  return adminFetch('/api/admin/bookings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, action: 'request_payment' }),
  })
}

export function deleteBooking(id: string): Promise<{ ok: boolean }> {
  return adminFetch(`/api/admin/bookings?id=${id}`, { method: 'DELETE' })
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export type AnalyticsData = {
  byDay: { day: string; count: number }[]
  topPages: { path: string; count: number }[]
  topReferrers: { referrer: string; count: number }[]
  topCountries: { country: string; count: number }[]
  total: { total: number; unique_visitors: number }
}

export function fetchAnalytics(range = '30'): Promise<AnalyticsData> {
  return adminFetch(`/api/admin/analytics?range=${range}`)
}

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

export type PricingRule = {
  id: string
  name: string
  type: 'date_adjustment' | 'annual_adjustment' | 'nights_discount'
  start_date: string
  end_date: string
  price_per_night: number
  min_nights: number
  discount_percent: number
  priority: number
}

export type PricingData = {
  rules: PricingRule[]
  council_tax_per_person_per_night: number
  base_fare_per_night: number | null
  animal_surcharge: number
  animal_surcharge_active: boolean
}

export function fetchPricingData(): Promise<PricingData> {
  return adminFetch('/api/admin/pricing')
}

export function createPricingRule(rule: Omit<PricingRule, 'id'>): Promise<PricingRule> {
  return adminFetch('/api/admin/pricing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rule),
  })
}

export function updatePricingRule(rule: PricingRule): Promise<{ ok: boolean }> {
  return adminFetch('/api/admin/pricing', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rule),
  })
}

export function updateCouncilTax(councilTax: number): Promise<{ ok: boolean }> {
  return adminFetch('/api/admin/pricing', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ council_tax: councilTax }),
  })
}

export function updateBaseFare(baseFare: number): Promise<{ ok: boolean }> {
  return adminFetch('/api/admin/pricing', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base_fare: baseFare }),
  })
}

export function updateAnimalSurcharge(amount: number, active: boolean): Promise<{ ok: boolean }> {
  return adminFetch('/api/admin/pricing', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ animal_surcharge: amount, animal_surcharge_active: active }),
  })
}

export function deletePricingRule(id: string): Promise<{ ok: boolean }> {
  return adminFetch(`/api/admin/pricing?id=${id}`, { method: 'DELETE' })
}

// ---------------------------------------------------------------------------
// Usage
// ---------------------------------------------------------------------------

export type UsageData = {
  d1?: {
    database: string
    tables: Record<string, number>
    totalRows: number
    freeLimit: number
    readsPerDay: number
    writesPerDay: number
  }
  r2?: {
    bucket: string
    objectCount: number
    truncated: boolean
    totalSizeBytes: number
    totalSizeMB: string
    freeStorageGB: number
    freeClassARequests: number
    freeClassBRequests: number
  }
}

export function fetchUsage(): Promise<UsageData> {
  return adminFetch('/api/admin/usage')
}

import { apiUrl } from '@/lib/api-url'
