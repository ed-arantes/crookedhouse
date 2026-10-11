'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Locale } from '@/lib/i18n'
import { apiUrl } from '@/lib/api-url'
import { formatEU, parseEUDate } from '@/lib/format-date'
import { guestDetailsFormValues, type GuestDetailsFormValue } from '@/lib/guest-details-form'

type Booking = {
 id: string
 first_name: string
 last_name: string
 email: string
 check_in: string
 check_out: string
 nights: number
 adults: number
 children: number
 pets: number
 total_price: number
 status: string
}

type Message = {
 id: string
 booking_id: string
 sender: 'guest' | 'host'
 message: string
 created_at: string
}

type GuestDetails = GuestDetailsFormValue

const COPY: Record<Locale, Record<string, string>> = {
 it: { title: 'Area ospiti', intro: 'Accedi con il cognome e l’email usati per la prenotazione.', surname: 'Cognome', email: 'Email', access: 'Accedi', bookings: 'Le tue prenotazioni', dates: 'Soggiorno', guests: 'Ospiti', total: 'Totale', status: 'Stato', pending: 'In attesa', paid: 'Confermata', cancelled: 'Annullata', conversation: 'Messaggi e richieste', request: 'Scrivi un messaggio o chiedi una modifica alla prenotazione. L’host ti risponderà qui.', placeholder: 'Il tuo messaggio...', send: 'Invia', logout: 'Esci', home: 'Torna alla home', empty: 'Non risultano prenotazioni con questi dati.', signInError: 'Accesso non riuscito. Controlla i dati e riprova.', loadError: 'Impossibile caricare i dati. Riprova.', guest: 'Tu', host: 'Host' },
 en: { title: 'Guest area', intro: 'Sign in with the surname and email used for your booking.', surname: 'Surname', email: 'Email', access: 'Sign in', bookings: 'Your bookings', dates: 'Stay', guests: 'Guests', total: 'Total', status: 'Status', pending: 'Pending', paid: 'Confirmed', cancelled: 'Cancelled', conversation: 'Messages and requests', request: 'Send a message or ask to change your booking. Your host will reply here.', placeholder: 'Your message...', send: 'Send', logout: 'Sign out', home: 'Back home', empty: 'No bookings found for these details.', signInError: 'Sign in failed. Check your details and try again.', loadError: 'Unable to load your information. Please retry.', guest: 'You', host: 'Host' },
 fr: { title: 'Espace voyageurs', intro: 'Connectez-vous avec le nom et l’e-mail de la réservation.', surname: 'Nom', email: 'E-mail', access: 'Connexion', bookings: 'Vos réservations', dates: 'Séjour', guests: 'Voyageurs', total: 'Total', status: 'Statut', pending: 'En attente', paid: 'Confirmée', cancelled: 'Annulée', conversation: 'Messages et demandes', request: 'Envoyez un message ou demandez une modification. L’hôte vous répondra ici.', placeholder: 'Votre message...', send: 'Envoyer', logout: 'Déconnexion', home: 'Retour à l’accueil', empty: 'Aucune réservation trouvée.', signInError: 'Connexion impossible. Vérifiez vos informations.', loadError: 'Impossible de charger vos informations.', guest: 'Vous', host: 'Hôte' },
 de: { title: 'Gästebereich', intro: 'Melden Sie sich mit dem Nachnamen und der E-Mail der Buchung an.', surname: 'Nachname', email: 'E-Mail', access: 'Anmelden', bookings: 'Ihre Buchungen', dates: 'Aufenthalt', guests: 'Gäste', total: 'Gesamt', status: 'Status', pending: 'Ausstehend', paid: 'Bestätigt', cancelled: 'Storniert', conversation: 'Nachrichten und Anfragen', request: 'Senden Sie eine Nachricht oder bitten Sie um eine Änderung. Der Gastgeber antwortet hier.', placeholder: 'Ihre Nachricht...', send: 'Senden', logout: 'Abmelden', home: 'Zur Startseite', empty: 'Keine Buchungen gefunden.', signInError: 'Anmeldung fehlgeschlagen. Bitte prüfen Sie Ihre Angaben.', loadError: 'Informationen konnten nicht geladen werden.', guest: 'Sie', host: 'Gastgeber' },
 es: { title: 'Área de huéspedes', intro: 'Accede con el apellido y el correo de la reserva.', surname: 'Apellido', email: 'Correo electrónico', access: 'Acceder', bookings: 'Tus reservas', dates: 'Estancia', guests: 'Huéspedes', total: 'Total', status: 'Estado', pending: 'Pendiente', paid: 'Confirmada', cancelled: 'Cancelada', conversation: 'Mensajes y solicitudes', request: 'Envía un mensaje o solicita un cambio. El anfitrión te responderá aquí.', placeholder: 'Tu mensaje...', send: 'Enviar', logout: 'Salir', home: 'Volver al inicio', empty: 'No se encontraron reservas.', signInError: 'No se pudo acceder. Comprueba tus datos.', loadError: 'No se pudo cargar la información.', guest: 'Tú', host: 'Anfitrión' },
 ru: { title: 'Кабинет гостя', intro: 'Войдите, используя фамилию и электронную почту из бронирования.', surname: 'Фамилия', email: 'Электронная почта', access: 'Войти', bookings: 'Ваши бронирования', dates: 'Проживание', guests: 'Гости', total: 'Итого', status: 'Статус', pending: 'Ожидается', paid: 'Подтверждено', cancelled: 'Отменено', conversation: 'Сообщения и запросы', request: 'Напишите сообщение или запросите изменение бронирования. Хозяин ответит здесь.', placeholder: 'Ваше сообщение...', send: 'Отправить', logout: 'Выйти', home: 'На главную', empty: 'Бронирования не найдены.', signInError: 'Не удалось войти. Проверьте данные.', loadError: 'Не удалось загрузить данные.', guest: 'Вы', host: 'Хозяин' },
}

const DETAILS_COPY: Record<Locale, {
 detailsTitle: string
 detailsIntro: string
 groupLeader: string
 firstName: string
 lastName: string
 dateOfBirth: string
 documentNumber: string
 documentHint: string
 saveDetails: string
 savingDetails: string
 detailsSaved: string
 detailsError: string
 invalidDetailsDate: string
 privacyNotice: string
 deleteDetails: string
 confirmDeleteDetails: string
 detailsDeleted: string
}> = {
 it: {
  detailsTitle: 'Dati personali degli ospiti',
  detailsIntro: 'Inserisci i dati di ogni ospite della prenotazione.',
  groupLeader: 'Capogruppo',
  firstName: 'Nome',
  lastName: 'Cognome',
  dateOfBirth: 'Data di nascita',
  documentNumber: 'Numero carta d’identità o passaporto',
  documentHint: 'Richiesto solo per il capogruppo.',
  saveDetails: 'Salva i dati',
  savingDetails: 'Salvataggio...',
  detailsSaved: 'Dati salvati.',
  detailsError: 'Impossibile caricare o salvare i dati. Riprova.',
  invalidDetailsDate: 'Inserisci tutte le date di nascita nel formato GG/MM/AAAA.',
  privacyNotice: 'I dati sono cifrati nel database e sono visibili a te e all’host della struttura.',
  deleteDetails: 'Elimina i dati personali',
  confirmDeleteDetails: 'Vuoi eliminare definitivamente i dati personali di questa prenotazione?',
  detailsDeleted: 'Dati personali eliminati.',
 },
 en: {
  detailsTitle: 'Guest personal details',
  detailsIntro: 'Enter the personal details for each guest on this booking.',
  groupLeader: 'Group leader',
  firstName: 'First name',
  lastName: 'Last name',
  dateOfBirth: 'Date of birth',
  documentNumber: 'ID card or passport number',
  documentHint: 'Required for the group leader only.',
  saveDetails: 'Save details',
  savingDetails: 'Saving...',
  detailsSaved: 'Details saved.',
  detailsError: 'Unable to load or save details. Please try again.',
  invalidDetailsDate: 'Enter every date of birth in DD/MM/YYYY format.',
  privacyNotice: 'Details are encrypted in the database and visible to you and the property host.',
  deleteDetails: 'Delete personal details',
  confirmDeleteDetails: 'Permanently delete the personal details for this booking?',
  detailsDeleted: 'Personal details deleted.',
 },
 fr: {
  detailsTitle: 'Informations personnelles des voyageurs',
  detailsIntro: 'Saisissez les informations de chaque voyageur de cette réservation.',
  groupLeader: 'Responsable du groupe',
  firstName: 'Prénom',
  lastName: 'Nom',
  dateOfBirth: 'Date de naissance',
  documentNumber: 'Numéro de carte d’identité ou de passeport',
  documentHint: 'Demandé uniquement pour le responsable du groupe.',
  saveDetails: 'Enregistrer',
  savingDetails: 'Enregistrement...',
  detailsSaved: 'Informations enregistrées.',
  detailsError: 'Impossible de charger ou d’enregistrer les informations. Réessayez.',
  invalidDetailsDate: 'Saisissez toutes les dates de naissance au format JJ/MM/AAAA.',
  privacyNotice: 'Les informations sont chiffrées dans la base de données et visibles par vous et l’hôte.',
  deleteDetails: 'Supprimer les informations personnelles',
  confirmDeleteDetails: 'Supprimer définitivement les informations personnelles de cette réservation ?',
  detailsDeleted: 'Informations personnelles supprimées.',
 },
 de: {
  detailsTitle: 'Persönliche Daten der Gäste',
  detailsIntro: 'Geben Sie die persönlichen Daten aller Gäste dieser Buchung ein.',
  groupLeader: 'Gruppenleitung',
  firstName: 'Vorname',
  lastName: 'Nachname',
  dateOfBirth: 'Geburtsdatum',
  documentNumber: 'Personalausweis- oder Reisepassnummer',
  documentHint: 'Nur für die Gruppenleitung erforderlich.',
  saveDetails: 'Daten speichern',
  savingDetails: 'Wird gespeichert...',
  detailsSaved: 'Daten gespeichert.',
  detailsError: 'Daten konnten nicht geladen oder gespeichert werden. Bitte erneut versuchen.',
  invalidDetailsDate: 'Geben Sie alle Geburtsdaten im Format TT/MM/JJJJ ein.',
  privacyNotice: 'Die Daten werden in der Datenbank verschlüsselt und sind für Sie und den Gastgeber sichtbar.',
  deleteDetails: 'Persönliche Daten löschen',
  confirmDeleteDetails: 'Persönliche Daten für diese Buchung endgültig löschen?',
  detailsDeleted: 'Persönliche Daten gelöscht.',
 },
 es: {
  detailsTitle: 'Datos personales de los huéspedes',
  detailsIntro: 'Introduce los datos personales de cada huésped de esta reserva.',
  groupLeader: 'Responsable del grupo',
  firstName: 'Nombre',
  lastName: 'Apellido',
  dateOfBirth: 'Fecha de nacimiento',
  documentNumber: 'Número de documento de identidad o pasaporte',
  documentHint: 'Solo es obligatorio para el responsable del grupo.',
  saveDetails: 'Guardar datos',
  savingDetails: 'Guardando...',
  detailsSaved: 'Datos guardados.',
  detailsError: 'No se pudieron cargar o guardar los datos. Inténtalo de nuevo.',
  invalidDetailsDate: 'Introduce todas las fechas de nacimiento en formato DD/MM/AAAA.',
  privacyNotice: 'Los datos están cifrados en la base de datos y son visibles para ti y el anfitrión.',
  deleteDetails: 'Eliminar datos personales',
  confirmDeleteDetails: '¿Eliminar definitivamente los datos personales de esta reserva?',
  detailsDeleted: 'Datos personales eliminados.',
 },
 ru: {
  detailsTitle: 'Личные данные гостей',
  detailsIntro: 'Укажите личные данные каждого гостя в бронировании.',
  groupLeader: 'Руководитель группы',
  firstName: 'Имя',
  lastName: 'Фамилия',
  dateOfBirth: 'Дата рождения',
  documentNumber: 'Номер удостоверения личности или паспорта',
  documentHint: 'Требуется только для руководителя группы.',
  saveDetails: 'Сохранить данные',
  savingDetails: 'Сохранение...',
  detailsSaved: 'Данные сохранены.',
  detailsError: 'Не удалось загрузить или сохранить данные. Попробуйте ещё раз.',
  invalidDetailsDate: 'Введите все даты рождения в формате ДД/ММ/ГГГГ.',
  privacyNotice: 'Данные зашифрованы в базе данных и доступны вам и хозяину жилья.',
  deleteDetails: 'Удалить личные данные',
  confirmDeleteDetails: 'Безвозвратно удалить личные данные этого бронирования?',
  detailsDeleted: 'Личные данные удалены.',
 },
}

export function GuestAccount({ locale }: { locale: Locale }) {
 const router = useRouter()
 const copy: Record<string, string> = { ...COPY[locale], ...DETAILS_COPY[locale] }
 const [bookings, setBookings] = useState<Booking[]>([])
 const [selected, setSelected] = useState('')
 const [messages, setMessages] = useState<Message[]>([])
 const [surname, setSurname] = useState('')
 const [email, setEmail] = useState('')
 const [draft, setDraft] = useState('')
 const [guestDetails, setGuestDetails] = useState<GuestDetails[]>([])
 const [detailsLoading, setDetailsLoading] = useState(false)
 const [detailsSaving, setDetailsSaving] = useState(false)
 const [detailsStatus, setDetailsStatus] = useState('')
 const [authenticated, setAuthenticated] = useState(false)
 const [loading, setLoading] = useState(true)
 const [sending, setSending] = useState(false)
 const [error, setError] = useState('')

 const loadBookings = useCallback(async () => {
  const response = await fetch(apiUrl('/api/guest/account'), { cache: 'no-store' })
  if (response.status === 401) {
   setAuthenticated(false)
   setBookings([])
   setGuestDetails([])
   setLoading(false)
   return
  }
  const data = await response.json()
  if (!response.ok) throw new Error(data?.error || copy.loadError)
  setBookings(data)
  setAuthenticated(true)
  setSelected((current) => data.some((booking: Booking) => booking.id === current) ? current : data[0]?.id || '')
  setLoading(false)
 }, [copy.loadError])

 useEffect(() => {
  loadBookings().catch(() => {
   setError(copy.loadError)
   setLoading(false)
  })
 }, [loadBookings, copy.loadError])

 const loadMessages = useCallback(async () => {
  if (!selected) return
  const response = await fetch(apiUrl(`/api/guest/messages?booking_id=${encodeURIComponent(selected)}`), { cache: 'no-store' })
  const data = await response.json()
  if (!response.ok) throw new Error(data?.error || copy.loadError)
  setMessages(data)
 }, [selected, copy.loadError])

 useEffect(() => {
  if (!authenticated || !selected) return
  loadMessages().catch(() => setError(copy.loadError))
  const interval = window.setInterval(() => {
   loadMessages().catch(() => setError(copy.loadError))
  }, 15000)
  return () => window.clearInterval(interval)
 }, [authenticated, selected, loadMessages, copy.loadError])

 useEffect(() => {
  const booking = bookings.find((item) => item.id === selected)
  if (!authenticated || !booking) return
  let active = true
  setDetailsLoading(true)
  setDetailsStatus('')
  setGuestDetails(guestDetailsFormValues(booking))
  fetch(apiUrl(`/api/guest/details?booking_id=${encodeURIComponent(booking.id)}`), { cache: 'no-store' })
   .then(async (response) => {
    const data = await response.json()
    if (!response.ok) throw new Error(data?.error || copy.detailsError)
    if (!active) return
    const savedGuests = Array.isArray(data.guests) ? data.guests as Array<{
     first_name: string
     last_name: string
     date_of_birth: string
     document_number?: string
    }> : []
    setGuestDetails(guestDetailsFormValues(booking, savedGuests))
   })
   .catch(() => {
    if (active) setDetailsStatus(copy.detailsError)
   })
   .finally(() => {
    if (active) setDetailsLoading(false)
   })
  return () => { active = false }
 }, [authenticated, bookings, selected, copy.detailsError])

 async function signIn(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault()
  if (surname.trim().toLocaleLowerCase() === 'admin') {
   router.push('/admin')
   return
  }
  setError('')
  setLoading(true)
  try {
   const response = await fetch(apiUrl('/api/guest/auth'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ surname, email }),
   })
   const data = await response.json()
   if (!response.ok) throw new Error(data?.error || copy.signInError)
   await loadBookings()
  } catch (cause) {
   setError(cause instanceof Error ? cause.message : copy.signInError)
   setLoading(false)
  }
 }

 async function signOut() {
  const response = await fetch(apiUrl('/api/guest/auth'), { method: 'DELETE' })
  if (!response.ok) {
   setError(copy.loadError)
   return
  }
  setAuthenticated(false)
  setBookings([])
  setMessages([])
  setSelected('')
  setGuestDetails([])
 }

 async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault()
  if (!selected || !draft.trim()) return
  setSending(true)
  setError('')
  try {
   const response = await fetch(apiUrl('/api/guest/messages'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ booking_id: selected, message: draft }),
   })
   const data = await response.json()
   if (!response.ok) throw new Error(data?.error || copy.loadError)
   setDraft('')
   await loadMessages()
  } catch (cause) {
   setError(cause instanceof Error ? cause.message : copy.loadError)
  } finally {
   setSending(false)
  }
 }

 async function saveGuestDetails(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault()
  if (!selected) return
  const guests = guestDetails.map((guest) => {
   const dateOfBirth = parseEUDate(guest.date_of_birth)
   return {
    first_name: guest.first_name.trim(),
    last_name: guest.last_name.trim(),
    date_of_birth: dateOfBirth ?? '',
    ...(guest.document_number.trim() ? { document_number: guest.document_number.trim() } : {}),
   }
  })
  if (guests.some((guest) => !guest.date_of_birth)) {
   setDetailsStatus(copy.invalidDetailsDate)
   return
  }
  setDetailsSaving(true)
  setDetailsStatus('')
  try {
   const response = await fetch(apiUrl('/api/guest/details'), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ booking_id: selected, guests }),
   })
   const data = await response.json()
   if (!response.ok) throw new Error(data?.error || copy.detailsError)
   setDetailsStatus(copy.detailsSaved)
  } catch {
   setDetailsStatus(copy.detailsError)
  } finally {
   setDetailsSaving(false)
  }
 }

 async function deleteGuestDetails() {
  if (!selected || !window.confirm(copy.confirmDeleteDetails)) return
  setDetailsSaving(true)
  setDetailsStatus('')
  try {
   const response = await fetch(
    apiUrl(`/api/guest/details?booking_id=${encodeURIComponent(selected)}`),
    { method: 'DELETE' },
   )
   if (!response.ok) throw new Error(copy.detailsError)
   setGuestDetails(selectedBooking ? guestDetailsFormValues(selectedBooking) : [])
   setDetailsStatus(copy.detailsDeleted)
  } catch {
   setDetailsStatus(copy.detailsError)
  } finally {
   setDetailsSaving(false)
  }
 }

 const selectedBooking = bookings.find((booking) => booking.id === selected)

 return (
  <main className="min-h-screen bg-background px-5 py-16 text-foreground md:px-8">
   <div className="mx-auto max-w-4xl">
    <Link href={`/${locale}`} className="text-sm underline underline-offset-4">{copy.home}</Link>
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
     <h1 className="type-heading font-serif font-medium">{copy.title}</h1>
     {authenticated && <button type="button" onClick={signOut} className="rounded-full border border-border px-4 py-2 text-sm">{copy.logout}</button>}
    </div>
    {error && <p role="alert" className="mt-5 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    {loading ? <p className="mt-8 text-sm text-muted-foreground">{copy.loadError}</p> : !authenticated ? (
     <form onSubmit={signIn} className="mt-8 max-w-md space-y-4 rounded-2xl border border-border bg-card p-6">
      <p className="text-sm text-muted-foreground">{copy.intro}</p>
      <label className="block text-sm font-medium">{copy.surname}
       <input required autoComplete="family-name" value={surname} onChange={(event) => setSurname(event.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5" />
      </label>
      <label className="block text-sm font-medium">{copy.email}
       <input required={surname.trim().toLocaleLowerCase() !== 'admin'} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5" />
      </label>
      <button disabled={loading} className="w-full rounded-full bg-accent px-4 py-3 text-sm font-medium text-accent-foreground disabled:opacity-60">{copy.access}</button>
     </form>
    ) : bookings.length === 0 ? <p className="mt-8">{copy.empty}</p> : (
     <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <section className="space-y-3">
       <h2 className="font-medium">{copy.bookings}</h2>
       {bookings.map((booking) => (
        <button key={booking.id} type="button" onClick={() => setSelected(booking.id)} className={`w-full rounded-2xl border p-4 text-left transition-colors ${booking.id === selected ? 'border-accent bg-accent/10' : 'border-border bg-card'}`}>
         <span className="block font-medium">{formatEU(booking.check_in)} – {formatEU(booking.check_out)}</span>
         <span className="mt-1 block text-sm text-muted-foreground">{copy.status}: {copy[booking.status] || booking.status}</span>
         <span className="mt-1 block text-sm text-muted-foreground">{copy.guests}: {booking.adults + booking.children} · {copy.total}: €{booking.total_price}</span>
        </button>
       ))}
       {selectedBooking && (
        <form onSubmit={saveGuestDetails} className="mt-5 space-y-4 rounded-2xl border border-border bg-card p-4">
         <div>
          <h2 className="font-medium">{copy.detailsTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{copy.detailsIntro}</p>
         </div>
         {guestDetails.map((guest, index) => (
          <fieldset key={`${selected}-${index}`} className="space-y-3 rounded-xl border border-border p-3">
           <legend className="px-1 text-sm font-medium">
            {copy.guests} {index + 1}{index === 0 ? ` · ${copy.groupLeader}` : ''}
           </legend>
           <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium text-muted-foreground">{copy.firstName}
             <input
              required
              maxLength={120}
              autoComplete={index === 0 ? 'given-name' : 'off'}
              value={guest.first_name}
              onChange={(event) => setGuestDetails((current) => current.map((item, itemIndex) =>
               itemIndex === index ? { ...item, first_name: event.target.value } : item))}
              className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
             />
            </label>
            <label className="text-xs font-medium text-muted-foreground">{copy.lastName}
             <input
              required
              maxLength={120}
              autoComplete={index === 0 ? 'family-name' : 'off'}
              value={guest.last_name}
              onChange={(event) => setGuestDetails((current) => current.map((item, itemIndex) =>
               itemIndex === index ? { ...item, last_name: event.target.value } : item))}
              className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
             />
            </label>
            <label className="text-xs font-medium text-muted-foreground">{copy.dateOfBirth}
             <input
              required
              inputMode="numeric"
              maxLength={10}
              placeholder="gg/mm/aaaa"
              value={guest.date_of_birth}
              onChange={(event) => setGuestDetails((current) => current.map((item, itemIndex) =>
               itemIndex === index ? { ...item, date_of_birth: event.target.value } : item))}
              className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
             />
            </label>
            {index === 0 && (
             <label className="text-xs font-medium text-muted-foreground">{copy.documentNumber}
              <input
               required
               maxLength={100}
               autoComplete="off"
               value={guest.document_number}
               onChange={(event) => setGuestDetails((current) => current.map((item, itemIndex) =>
                itemIndex === index ? { ...item, document_number: event.target.value } : item))}
               className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
              <span className="mt-1 block font-normal">{copy.documentHint}</span>
             </label>
            )}
           </div>
          </fieldset>
         ))}
         <p className="text-xs text-muted-foreground">{copy.privacyNotice}</p>
         {detailsStatus && (
          <p role={detailsStatus === copy.detailsSaved ? 'status' : 'alert'} className="text-sm text-muted-foreground">
           {detailsStatus}
          </p>
         )}
         <button
          disabled={detailsLoading || detailsSaving}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground disabled:opacity-60"
         >
          {detailsSaving ? copy.savingDetails : copy.saveDetails}
         </button>
         <button
          type="button"
          onClick={deleteGuestDetails}
          disabled={detailsLoading || detailsSaving}
          className="ml-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground disabled:opacity-60"
         >
          {copy.deleteDetails}
         </button>
        </form>
       )}
      </section>
      <section className="flex min-h-[28rem] flex-col rounded-2xl border border-border bg-card p-5">
       <h2 className="font-medium">{copy.conversation}</h2>
       <p className="mt-1 text-sm text-muted-foreground">{copy.request}</p>
       <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
        {messages.map((message) => (
         <div key={message.id} className={`max-w-[90%] rounded-xl p-3 text-sm ${message.sender === 'guest' ? 'ml-auto bg-accent/15' : 'bg-secondary'}`}>
          <p className="mb-1 text-xs font-semibold">{message.sender === 'guest' ? copy.guest : copy.host}</p>
          <p className="whitespace-pre-wrap break-words">{message.message}</p>
         </div>
        ))}
       </div>
       <form onSubmit={sendMessage} className="mt-4 space-y-2">
        <textarea required maxLength={2000} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={copy.placeholder} rows={3} className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
        <button disabled={sending || !draft.trim()} className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground disabled:opacity-60">{copy.send}</button>
       </form>
      </section>
     </div>
    )}
   </div>
  </main>
 )
}
