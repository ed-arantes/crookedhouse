'use client'

import { useState } from 'react'
import { areGuestDetailsComplete, formatGuestDate, parseGuestDate, guestDetailsFormValues, type GuestDetailsFormValue } from '@/lib/guest-details-form'
import type { Locale } from '@/lib/i18n'

type BookingGuestInfo = {
 first_name: string
 last_name: string
 adults: number
 children: number
 check_in: string
 nights: number
}

type CheckoutGuestDetails = Omit<GuestDetailsFormValue, 'date_of_birth'> & {
 date_of_birth: string
}

const COPY: Record<Locale, Record<string, string>> = {
 it: {
  title: 'Dati degli ospiti',
  intro: 'Inserisci i dati di ogni ospite ora, oppure scegli “Lo farò più tardi” per completarli dopo la prenotazione.',
  legal: 'Per il self check-in, i dati identificativi di tutti gli ospiti sono richiesti dalla legge prima del check-in. Rifiutarsi di fornirli o ometterli può costituire una violazione degli obblighi di legge.',
  role: 'Ruolo dell’ospite',
  head: 'Capofamiglia',
  leader: 'Capogruppo',
  single: 'Ospite singolo',
  arrival: 'Data di arrivo',
  nights: 'Numero di notti',
  first: 'Nome',
  last: 'Cognome',
  dob: 'Data di nascita',
  dobPlaceholder: 'gg/mm/aaaa',
  nationality: 'Nazionalità',
  birthplace: 'Luogo di nascita',
  gender: 'Genere',
  issuePlace: 'Luogo di rilascio',
  documentType: 'Tipo di documento',
  documentNumber: 'Numero del documento',
  identityCard: 'Carta d’identità',
  passport: 'Passaporto',
  other: 'Altro',
  invalidDate: 'Inserisci tutte le date di nascita nel formato gg/mm/aaaa.',
  submit: 'Continua al pagamento',
  skip: 'Lo farò più tardi',
  close: 'Chiudi',
 },
 en: {
  title: 'Guest details',
  intro: 'Enter each guest’s details now, or choose “I’ll do this later” to complete them after booking.',
  legal: 'For self check-in, the law requires identifying details for every guest before check-in. Refusing or failing to provide them may violate applicable legal obligations.',
  role: 'Guest role',
  head: 'Head of family',
  leader: 'Group leader',
  single: 'Single guest',
  arrival: 'Arrival date',
  nights: 'Number of nights',
  first: 'First name',
  last: 'Last name',
  dob: 'Date of birth',
  dobPlaceholder: 'mm/dd/yyyy',
  nationality: 'Nationality',
  birthplace: 'Place of birth',
  gender: 'Gender',
  issuePlace: 'Place of issue',
  documentType: 'Document type',
  documentNumber: 'Document number',
  identityCard: 'Identity card',
  passport: 'Passport',
  other: 'Other',
  invalidDate: 'Enter every date of birth in MM/DD/YYYY format.',
  submit: 'Continue to payment',
  skip: 'I’ll do this later',
  close: 'Close',
 },
 fr: {
  title: 'Informations des voyageurs',
  intro: 'Saisissez les informations de chaque voyageur maintenant, ou choisissez « Je le ferai plus tard » pour les compléter après la réservation.',
  legal: 'Pour l’arrivée autonome, la loi exige les informations d’identité de chaque voyageur avant l’arrivée. Refuser ou omettre de les fournir peut enfreindre les obligations légales applicables.',
  role: 'Rôle du voyageur',
  head: 'Chef de famille',
  leader: 'Responsable du groupe',
  single: 'Voyageur seul',
  arrival: 'Date d’arrivée',
  nights: 'Nombre de nuits',
  first: 'Prénom',
  last: 'Nom',
  dob: 'Date de naissance',
  dobPlaceholder: 'jj/mm/aaaa',
  nationality: 'Nationalité',
  birthplace: 'Lieu de naissance',
  gender: 'Genre',
  issuePlace: 'Lieu de délivrance',
  documentType: 'Type de document',
  documentNumber: 'Numéro du document',
  identityCard: 'Carte d’identité',
  passport: 'Passeport',
  other: 'Autre',
  invalidDate: 'Saisissez toutes les dates de naissance au format jj/mm/aaaa.',
  submit: 'Continuer vers le paiement',
  skip: 'Je le ferai plus tard',
  close: 'Fermer',
 },
 de: {
  title: 'Angaben zu den Gästen',
  intro: 'Geben Sie die Angaben für alle Gäste jetzt ein oder wählen Sie „Später erledigen“, um sie nach der Buchung zu ergänzen.',
  legal: 'Beim Self-Check-in verlangt das Gesetz die Identitätsdaten aller Gäste vor dem Check-in. Die Verweigerung oder Nichtangabe kann gegen geltende gesetzliche Pflichten verstoßen.',
  role: 'Rolle des Gastes',
  head: 'Familienoberhaupt',
  leader: 'Gruppenleitung',
  single: 'Einzelgast',
  arrival: 'Anreisedatum',
  nights: 'Anzahl der Nächte',
  first: 'Vorname',
  last: 'Nachname',
  dob: 'Geburtsdatum',
  dobPlaceholder: 'tt.mm.jjjj',
  nationality: 'Staatsangehörigkeit',
  birthplace: 'Geburtsort',
  gender: 'Geschlecht',
  issuePlace: 'Ausstellungsort',
  documentType: 'Dokumenttyp',
  documentNumber: 'Dokumentnummer',
  identityCard: 'Personalausweis',
  passport: 'Reisepass',
  other: 'Sonstiges',
  invalidDate: 'Geben Sie alle Geburtsdaten im Format tt.mm.jjjj ein.',
  submit: 'Weiter zur Zahlung',
  skip: 'Später erledigen',
  close: 'Schließen',
 },
 es: {
  title: 'Datos de los huéspedes',
  intro: 'Introduce ahora los datos de cada huésped o elige «Lo haré más tarde» para completarlos después de reservar.',
  legal: 'Para el auto check-in, la ley exige los datos identificativos de todos los huéspedes antes del check-in. Negarse a facilitarlos u omitirlos puede incumplir las obligaciones legales aplicables.',
  role: 'Rol del huésped',
  head: 'Cabeza de familia',
  leader: 'Responsable del grupo',
  single: 'Huésped individual',
  arrival: 'Fecha de llegada',
  nights: 'Número de noches',
  first: 'Nombre',
  last: 'Apellido',
  dob: 'Fecha de nacimiento',
  dobPlaceholder: 'dd/mm/aaaa',
  nationality: 'Nacionalidad',
  birthplace: 'Lugar de nacimiento',
  gender: 'Género',
  issuePlace: 'Lugar de expedición',
  documentType: 'Tipo de documento',
  documentNumber: 'Número del documento',
  identityCard: 'Documento de identidad',
  passport: 'Pasaporte',
  other: 'Otro',
  invalidDate: 'Introduce todas las fechas de nacimiento en formato dd/mm/aaaa.',
  submit: 'Continuar al pago',
  skip: 'Lo haré más tarde',
  close: 'Cerrar',
 },
 ru: {
  title: 'Данные гостей',
  intro: 'Введите данные каждого гостя сейчас или выберите «Заполню позже», чтобы добавить их после бронирования.',
  legal: 'При самостоятельном заселении закон требует предоставить идентификационные данные всех гостей до заезда. Отказ или непредоставление данных может нарушать применимые требования закона.',
  role: 'Роль гостя',
  head: 'Глава семьи',
  leader: 'Руководитель группы',
  single: 'Один гость',
  arrival: 'Дата заезда',
  nights: 'Количество ночей',
  first: 'Имя',
  last: 'Фамилия',
  dob: 'Дата рождения',
  dobPlaceholder: 'дд.мм.гггг',
  nationality: 'Гражданство',
  birthplace: 'Место рождения',
  gender: 'Пол',
  issuePlace: 'Место выдачи',
  documentType: 'Тип документа',
  documentNumber: 'Номер документа',
  identityCard: 'Удостоверение личности',
  passport: 'Паспорт',
  other: 'Другое',
  invalidDate: 'Введите все даты рождения в формате дд.мм.гггг.',
  submit: 'Перейти к оплате',
  skip: 'Заполню позже',
  close: 'Закрыть',
 },
}

export function CheckoutGuestDialog({
 locale,
 booking,
 submitting,
 error,
 onSubmit,
 onSkip,
 onClose,
}: {
 locale: Locale
 booking: BookingGuestInfo
 submitting: boolean
 error: string
 onSubmit: (guests: CheckoutGuestDetails[]) => void
 onSkip: () => void
 onClose: () => void
}) {
 const copy = COPY[locale]
 const [guests, setGuests] = useState(() => guestDetailsFormValues(booking, [], locale))
 const [validationError, setValidationError] = useState('')
 const guestDetailsComplete = areGuestDetailsComplete(guests, locale)

 function submit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault()
  const prepared = guests.map((guest) => ({
   ...guest,
   first_name: guest.first_name.trim(),
   last_name: guest.last_name.trim(),
   date_of_birth: parseGuestDate(guest.date_of_birth, locale) ?? '',
   place_of_birth: guest.place_of_birth.trim(),
   nationality: guest.nationality.trim(),
   gender: guest.gender.trim(),
   place_of_issue: guest.place_of_issue.trim(),
   document_type: guest.document_type.trim(),
   document_number: guest.document_number.trim(),
  }))
  if (prepared.some((guest) => !guest.date_of_birth)) {
   setValidationError(copy.invalidDate)
   return
  }
  setValidationError('')
  onSubmit(prepared)
 }

 function updateGuest(index: number, key: keyof GuestDetailsFormValue, value: string) {
  setGuests((current) => current.map((guest, itemIndex) =>
   itemIndex === index ? { ...guest, [key]: value } : guest))
 }

 const inputClass = 'mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground'

 return (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/60 p-4">
   <section
    role="dialog"
    aria-modal="true"
    aria-labelledby="checkout-guest-dialog-title"
    className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card p-5 text-foreground shadow-2xl md:p-7"
   >
    <div className="flex items-start justify-between gap-4">
     <div>
      <h2 id="checkout-guest-dialog-title" className="text-xl font-medium">{copy.title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{copy.intro}</p>
     </div>
     <button type="button" onClick={onClose} disabled={submitting} className="rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50">
      {copy.close}
     </button>
    </div>
    <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">{copy.legal}</p>
    <form onSubmit={submit} className="mt-5 space-y-4">
     {guests.map((guest, index) => (
      <fieldset key={index} className="space-y-3 rounded-xl border border-border p-3">
       <legend className="px-1 text-sm font-medium">{locale === 'it' ? 'Ospite' : locale === 'fr' ? 'Voyageur' : locale === 'de' ? 'Gast' : locale === 'es' ? 'Huésped' : locale === 'ru' ? 'Гость' : 'Guest'} {index + 1}</legend>
       <div className="grid gap-3 sm:grid-cols-2">
        {index === 0 && (
         <>
          <label className="text-xs font-medium text-muted-foreground">{copy.role}
           <select required value={guest.guest_role} onChange={(event) => updateGuest(index, 'guest_role', event.target.value)} className={inputClass}>
            <option value="">—</option>
            <option value="head_of_family">{copy.head}</option>
            <option value="group_leader">{copy.leader}</option>
            <option value="single_guest">{copy.single}</option>
           </select>
          </label>
          <label className="text-xs font-medium text-muted-foreground">{copy.arrival}
           <input readOnly value={formatGuestDate(booking.check_in, locale)} className={`${inputClass} bg-muted`} />
          </label>
          <label className="text-xs font-medium text-muted-foreground">{copy.nights}
           <input readOnly value={String(booking.nights)} className={`${inputClass} bg-muted`} />
          </label>
         </>
        )}
        <label className="text-xs font-medium text-muted-foreground">{copy.first}
         <input required maxLength={120} autoComplete={index === 0 ? 'given-name' : 'off'} value={guest.first_name} onChange={(event) => updateGuest(index, 'first_name', event.target.value)} className={inputClass} />
        </label>
        <label className="text-xs font-medium text-muted-foreground">{copy.last}
         <input required maxLength={120} autoComplete={index === 0 ? 'family-name' : 'off'} value={guest.last_name} onChange={(event) => updateGuest(index, 'last_name', event.target.value)} className={inputClass} />
        </label>
        <label className="text-xs font-medium text-muted-foreground">{copy.dob}
         <input required inputMode="numeric" maxLength={10} placeholder={copy.dobPlaceholder} value={guest.date_of_birth} onChange={(event) => updateGuest(index, 'date_of_birth', event.target.value)} className={inputClass} />
        </label>
        <label className="text-xs font-medium text-muted-foreground">{copy.nationality}
         <input required maxLength={120} autoComplete="country-name" value={guest.nationality} onChange={(event) => updateGuest(index, 'nationality', event.target.value)} className={inputClass} />
        </label>
        <label className="text-xs font-medium text-muted-foreground">{copy.birthplace}
         <input required maxLength={120} value={guest.place_of_birth} onChange={(event) => updateGuest(index, 'place_of_birth', event.target.value)} className={inputClass} />
        </label>
        <label className="text-xs font-medium text-muted-foreground">{copy.gender}
         <input required maxLength={60} value={guest.gender} onChange={(event) => updateGuest(index, 'gender', event.target.value)} className={inputClass} />
        </label>
        {index === 0 && (
         <>
          <label className="text-xs font-medium text-muted-foreground">{copy.issuePlace}
           <input required maxLength={120} value={guest.place_of_issue} onChange={(event) => updateGuest(index, 'place_of_issue', event.target.value)} className={inputClass} />
          </label>
          <label className="text-xs font-medium text-muted-foreground">{copy.documentType}
           <input required maxLength={100} value={guest.document_type} onChange={(event) => updateGuest(index, 'document_type', event.target.value)} className={inputClass} />
          </label>
          <label className="text-xs font-medium text-muted-foreground">{copy.documentNumber}
           <input required maxLength={100} value={guest.document_number} onChange={(event) => updateGuest(index, 'document_number', event.target.value)} className={inputClass} />
          </label>
         </>
        )}
       </div>
      </fieldset>
     ))}
     {validationError && <p role="alert" className="text-sm text-destructive">{validationError}</p>}
     {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
     <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button type="button" onClick={onSkip} disabled={submitting} className="rounded-xl border border-border px-5 py-3 text-sm font-medium disabled:opacity-50">
       {copy.skip}
      </button>
      <button type="submit" disabled={submitting || !guestDetailsComplete} className="rounded-xl bg-accent px-5 py-3 text-sm font-medium text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50">
       {copy.submit}
      </button>
     </div>
    </form>
   </section>
  </div>
 )
}
