'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  adminLogin,
  clearPassword,
  fetchReviews,
  createReview,
  updateReview,
  deleteReview,
  reorderReviews,
  fetchBlockedDates,
  addBlockedDates,
  removeBlockedDate,
  fetchAllContent,
  saveContent,
  translateContent,
  fetchIcalUrls,
  saveIcalUrls,
  fetchIcalPreview,
  fetchAllImages,
  uploadImage,
  updateImage,
  deleteImage,
  reorderImages,
  fetchR2BaseUrl,
  saveR2BaseUrl,
  fetchBookings,
  sendTestEmail,
  sendTestBookingConfirmation,
  type Review,
  type BlockedDate,
  type AdminImage,
  type AdminBooking,
  type ICalFeedPreview,
  type ICalSource,
  type BookingConfirmationTest,
} from '@/lib/admin-api'
import { LogOut, Plus, Pencil, Trash2, Save, Calendar, Star, MessageSquareQuote, FileText, Link, Bold, GripVertical, Image as ImageIcon, Upload, CalendarCheck, BarChart3, DollarSign, MessagesSquare, Copy, Mail } from 'lucide-react'
import { RichText } from '@/components/rich-text'
import { ARRAY_CONTENT_KEYS, CONTENT_SECTIONS } from '@/lib/content-schema'
import { DEFAULT_FAQ_ITEMS, type FaqItem } from '@/lib/faq-content'
import { usesRemoteApi } from '@/lib/api-url'
import { IMAGE_SECTIONS } from '@/lib/images'
import { BookingsTab, AnalyticsTab, PricingTab, MessagesTab } from './admin-tabs'
import { formatEU } from '@/lib/format-date'
type Tab = 'reviews' | 'blocked' | 'content' | 'ical' | 'images' | 'bookings' | 'messages' | 'pricing' | 'analytics' | 'email'

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [loginError, setLoginError] = useState('')
  const [tab, setTab] = useState<Tab>('blocked')

  useEffect(() => {
    const stored = localStorage.getItem('admin_password')
    if (stored) {
      fetchReviews().then(() => setAuthenticated(true)).catch(() => clearPassword())
    }
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    try {
      const ok = await adminLogin(passwordInput)
      if (ok) {
        setAuthenticated(true)
        setPasswordInput('')
      } else {
        setLoginError('Password errata')
      }
    } catch (cause) {
      setLoginError(cause instanceof Error ? cause.message : 'Accesso non riuscito. Riprova.')
    }
  }

  function handleLogout() {
    clearPassword()
    setAuthenticated(false)
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-5">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          <h1 className="type-heading font-serif text-center text-2xl font-medium text-foreground">
            Amministrazione
          </h1>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Password amministratore"
            autoFocus
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
          />
          {loginError && <p className="text-sm text-red-500">{loginError}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-medium text-accent-foreground hover:bg-accent/90"
          >
            Accedi
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-5 py-8 md:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="type-heading font-serif text-2xl font-medium text-foreground">
            Pannello amministratore
          </h1>
          {usesRemoteApi && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              Ambiente di produzione
            </span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-card"
          >
            <LogOut className="h-4 w-4" /> Esci
          </button>
        </div>

        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border">
          {([
            ['blocked', <Calendar key="b" className="h-4 w-4" />, 'Calendario'],
            ['bookings', <CalendarCheck key="k" className="h-4 w-4" />, 'Prenotazioni'],
            ['messages', <MessagesSquare key="m" className="h-4 w-4" />, 'Messaggi'],
            ['pricing', <DollarSign key="p" className="h-4 w-4" />, 'Prezzi'],
            ['reviews', <MessageSquareQuote key="r" className="h-4 w-4" />, 'Recensioni'],
            ['content', <FileText key="c" className="h-4 w-4" />, 'Contenuti'],
            ['images', <ImageIcon key="m" className="h-4 w-4" />, 'Immagini'],
            ['analytics', <BarChart3 key="a" className="h-4 w-4" />, 'Analisi'],
            ['email', <Mail key="e" className="h-4 w-4" />, 'Email'],
            ['ical', <Link key="i" className="h-4 w-4" />, 'iCal'],
          ] as const).map(([key, icon, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                tab === key
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {tab === 'reviews' && <ReviewsTab />}
        {tab === 'blocked' && <BlockedDatesTab />}
        {tab === 'content' && <ContentTab />}
        {tab === 'ical' && <IcalTab />}
        {tab === 'images' && <ImagesTab />}
        {tab === 'bookings' && <BookingsTab />}
        {tab === 'messages' && <MessagesTab />}
        {tab === 'pricing' && <PricingTab />}
        {tab === 'analytics' && <AnalyticsTab />}
        {tab === 'email' && <ResendTestTab />}
      </div>
    </div>
  )
}

function ResendTestTab() {
  const [recipient, setRecipient] = useState('')
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState<BookingConfirmationTest>({
    locale: 'it',
    to: '',
    guestName: '',
    checkIn: '',
    checkOut: '',
    nights: 1,
    guests: 1,
    totalPaid: 0,
    bookingReference: '',
  })
  const [sendingConfirmation, setSendingConfirmation] = useState(false)
  const [confirmationStatus, setConfirmationStatus] = useState('')
  const [confirmationError, setConfirmationError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSending(true)
    setStatus('')
    setError('')
    try {
      const result = await sendTestEmail(recipient)
      setStatus(`Email di prova inviata. ID Resend: ${result.id}`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Invio non riuscito. Riprova.')
    } finally {
      setSending(false)
    }
  }

  async function handleConfirmationSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSendingConfirmation(true)
    setConfirmationStatus('')
    setConfirmationError('')
    try {
      const result = await sendTestBookingConfirmation(confirmation)
      setConfirmationStatus(`Email di conferma inviata. ID Resend: ${result.id}`)
    } catch (cause) {
      setConfirmationError(cause instanceof Error ? cause.message : 'Invio non riuscito. Riprova.')
    } finally {
      setSendingConfirmation(false)
    }
  }

  function updateConfirmation<K extends keyof BookingConfirmationTest>(
    key: K,
    value: BookingConfirmationTest[K],
  ) {
    setConfirmation((current) => ({ ...current, [key]: value }))
  }

  return (
    <div className="grid max-w-4xl gap-6">
      <section className="max-w-2xl rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Test email Resend</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Invia un messaggio di prova all’indirizzo indicato usando la configurazione Resend del server.
        </p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="test-email-recipient" className="mb-1.5 block text-sm font-medium text-foreground">
              Indirizzo email destinatario
            </label>
            <input
              id="test-email-recipient"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Mail className="h-4 w-4" />
            {sending ? 'Invio in corso…' : 'Invia email di prova'}
          </button>
          {status && <p role="status" className="text-sm text-green-700">{status}</p>}
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        </form>
      </section>

      <section className="max-w-2xl rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Test template di conferma</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Invia un’anteprima del template di conferma configurato, senza creare o modificare una prenotazione.
        </p>
        <form onSubmit={handleConfirmationSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="confirmation-test-to" className="mb-1.5 block text-sm font-medium text-foreground">
              Indirizzo email destinatario
            </label>
            <input
              id="confirmation-test-to"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={confirmation.to}
              onChange={(event) => updateConfirmation('to', event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="confirmation-test-locale" className="mb-1.5 block text-sm font-medium text-foreground">
              Lingua email
            </label>
            <select
              id="confirmation-test-locale"
              value={confirmation.locale}
              onChange={(event) => updateConfirmation('locale', event.target.value as BookingConfirmationTest['locale'])}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="it">Italiano</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="es">Español</option>
              <option value="ru">Русский</option>
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="confirmation-test-name" className="mb-1.5 block text-sm font-medium text-foreground">
                Nome ospite
              </label>
              <input
                id="confirmation-test-name"
                type="text"
                required
                maxLength={120}
                value={confirmation.guestName}
                onChange={(event) => updateConfirmation('guestName', event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="confirmation-test-reference" className="mb-1.5 block text-sm font-medium text-foreground">
                Riferimento prenotazione
              </label>
              <input
                id="confirmation-test-reference"
                type="text"
                required
                maxLength={80}
                value={confirmation.bookingReference}
                onChange={(event) => updateConfirmation('bookingReference', event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="confirmation-test-check-in" className="mb-1.5 block text-sm font-medium text-foreground">
                Check-in
              </label>
              <input
                id="confirmation-test-check-in"
                type="date"
                required
                value={confirmation.checkIn}
                onChange={(event) => updateConfirmation('checkIn', event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="confirmation-test-check-out" className="mb-1.5 block text-sm font-medium text-foreground">
                Check-out
              </label>
              <input
                id="confirmation-test-check-out"
                type="date"
                required
                value={confirmation.checkOut}
                onChange={(event) => updateConfirmation('checkOut', event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="confirmation-test-nights" className="mb-1.5 block text-sm font-medium text-foreground">
                Notti
              </label>
              <input
                id="confirmation-test-nights"
                type="number"
                min={1}
                max={365}
                step={1}
                required
                value={confirmation.nights}
                onChange={(event) => updateConfirmation('nights', Number(event.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="confirmation-test-guests" className="mb-1.5 block text-sm font-medium text-foreground">
                Ospiti
              </label>
              <input
                id="confirmation-test-guests"
                type="number"
                min={1}
                max={50}
                step={1}
                required
                value={confirmation.guests}
                onChange={(event) => updateConfirmation('guests', Number(event.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="confirmation-test-total" className="mb-1.5 block text-sm font-medium text-foreground">
                Totale pagato (€)
              </label>
              <input
                id="confirmation-test-total"
                type="number"
                min={0}
                max={1000000}
                step="0.01"
                required
                value={confirmation.totalPaid}
                onChange={(event) => updateConfirmation('totalPaid', Number(event.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={sendingConfirmation}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Mail className="h-4 w-4" />
            {sendingConfirmation ? 'Invio in corso…' : 'Invia test template di conferma'}
          </button>
          {confirmationStatus && <p role="status" className="text-sm text-green-700">{confirmationStatus}</p>}
          {confirmationError && <p role="alert" className="text-sm text-red-600">{confirmationError}</p>}
        </form>
      </section>
    </div>
  )
}

const SECTION_LABELS: Record<string, string> = {
  hero: 'Intestazione',
  apartment: 'Appartamento',
  layout: 'Disposizione',
  location: 'Posizione',
  explore: 'Esplora',
}

const SPAN_OPTIONS = [
  { value: '', label: 'Normale' },
  { value: 'md:col-span-2 md:row-span-2', label: '2 colonne x 2 righe' },
  { value: 'md:col-span-2', label: '2 colonne' },
  { value: 'col-span-2 md:col-span-1', label: '2 colonne (mobile)' },
]

const CONTENT_SECTION_LABELS: Record<string, string> = {
  Hero: 'Intestazione',
  Layout: 'Disposizione',
  Footer: 'Piè di pagina',
}

function ImagesTab() {
  const [images, setImages] = useState<AdminImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragIdx, setDragIdx] = useState<{ section: string; index: number } | null>(null)
  const [overIdx, setOverIdx] = useState<{ section: string; index: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingSection, setPendingSection] = useState('layout')
  const [pendingAlt, setPendingAlt] = useState('')
  const [pendingSpan, setPendingSpan] = useState('')
  const [editingAlt, setEditingAlt] = useState<string | null>(null)
  const [altValue, setAltValue] = useState('')
  const [r2BaseUrl, setR2BaseUrl] = useState('')
  const [r2Saving, setR2Saving] = useState(false)
  const [r2Status, setR2Status] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [imgs, settings] = await Promise.all([fetchAllImages(), fetchR2BaseUrl()])
      setImages(imgs)
      setR2BaseUrl(settings.url)
    } catch { /* */ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function grouped(): Record<string, AdminImage[]> {
    const g: Record<string, AdminImage[]> = {}
    for (const s of IMAGE_SECTIONS) g[s] = []
    for (const img of images) {
      if (g[img.section]) g[img.section].push(img)
    }
    for (const s of Object.keys(g)) {
      g[s].sort((a, b) => a.sort_order - b.sort_order)
    }
    return g
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadImage(file, pendingSection, pendingAlt || file.name.replace(/\.[^.]+$/, ''), pendingSpan)
      setPendingAlt('')
      setPendingSpan('')
      load()
    } catch (err) {
      alert(`Upload fallito: ${err instanceof Error ? err.message : 'errore sconosciuto'}`)
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleDelete(id: string) {
    if (!confirm('Eliminare questa immagine?')) return
    await deleteImage(id)
    load()
  }

  function handleDragStart(e: React.DragEvent, section: string, index: number) {
    setDragIdx({ section, index })
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent, section: string, index: number) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setOverIdx({ section, index })
  }

  async function handleDrop(e: React.DragEvent, section: string) {
    e.preventDefault()
    if (!dragIdx || !overIdx || dragIdx.section !== section) {
      setDragIdx(null)
      setOverIdx(null)
      return
    }
    const g = grouped()
    const list = [...g[section]]
    const [moved] = list.splice(dragIdx.index, 1)
    list.splice(overIdx.index, 0, moved)
    setDragIdx(null)
    setOverIdx(null)
    await reorderImages(section, list.map((r) => r.id))
    load()
  }

  async function handleSaveAlt(img: AdminImage) {
    if (altValue !== img.alt) {
      await updateImage(img.id, { alt: altValue })
    }
    setEditingAlt(null)
    load()
  }

  async function handleSpanChange(img: AdminImage, span: string) {
    await updateImage(img.id, { span })
    load()
  }

  async function handleSaveR2Url() {
    setR2Saving(true)
    setR2Status('')
    try {
      await saveR2BaseUrl(r2BaseUrl.replace(/\/+$/, ''))
      setR2Status('URL salvato.')
    } catch {
      setR2Status('Errore nel salvataggio.')
    }
    setR2Saving(false)
  }

  if (loading) return <p className="text-sm text-muted-foreground">Caricamento...</p>

  const g = grouped()

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-medium text-foreground mb-2">URL base immagini (R2)</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Inserisci il tuo sottodominio R2 (es. <code>https://images.crookedhouse.it</code>).
        </p>
        <div className="flex gap-2">
          <input
            type="url"
            value={r2BaseUrl}
            onChange={(e) => setR2BaseUrl(e.target.value)}
            placeholder="https://images.crookedhouse.it"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            onClick={handleSaveR2Url}
            disabled={r2Saving || !r2BaseUrl}
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {r2Saving ? '...' : 'Salva'}
          </button>
        </div>
        {r2Status && <p className="text-xs text-muted-foreground mt-2">{r2Status}</p>}
      </div>
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />

      {IMAGE_SECTIONS.map((section) => (
        <div key={section} className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">{SECTION_LABELS[section] || section}</h3>
            <div className="flex items-center gap-2">
              <select
                value={pendingSection === section ? pendingSection : section}
                onChange={(e) => setPendingSection(e.target.value)}
                className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-muted-foreground"
              >
                {IMAGE_SECTIONS.map((s) => (
                  <option key={s} value={s}>{SECTION_LABELS[s] || s}</option>
                ))}
              </select>
              {section === 'layout' && (
                <select
                  value={pendingSpan}
                  onChange={(e) => setPendingSpan(e.target.value)}
                  className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-muted-foreground"
                >
                  {SPAN_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              )}
              <input
                type="text"
                value={pendingSection === section ? pendingAlt : ''}
                onChange={(e) => { setPendingSection(section); setPendingAlt(e.target.value) }}
                onFocus={() => setPendingSection(section)}
                placeholder="Testo alternativo"
                className="w-32 rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:border-primary"
              />
              <button
                onClick={() => { setPendingSection(section); fileInputRef.current?.click() }}
                disabled={uploading}
                className="flex items-center gap-1 rounded-lg bg-accent px-3 py-1 text-xs font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
              >
                <Upload className="h-3 w-3" /> {uploading ? '...' : 'Carica'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {g[section].map((img, idx) => (
              <div
                key={img.id}
                draggable
                onDragStart={(e) => handleDragStart(e, section, idx)}
                onDragOver={(e) => handleDragOver(e, section, idx)}
                onDrop={(e) => handleDrop(e, section)}
                className={`group relative overflow-hidden rounded-xl border bg-background transition-colors ${
                  overIdx?.section === section && overIdx?.index === idx && dragIdx?.section === section
                    ? 'border-accent border-dashed'
                    : 'border-border'
                }`}
              >
                <div className="aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 transition-colors group-hover:bg-foreground/40">
                  <button
                    type="button"
                    className="cursor-grab rounded-full bg-background/80 p-1.5 text-foreground opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-background/80 px-2 py-1 backdrop-blur-sm">
                  {editingAlt === img.id ? (
                    <div className="flex gap-1">
                      <input
                        autoFocus
                        value={altValue}
                        onChange={(e) => setAltValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSaveAlt(img); if (e.key === 'Escape') setEditingAlt(null) }}
                        className="min-w-0 flex-1 rounded border border-border bg-background px-1 py-0.5 text-[10px] outline-none"
                      />
                      <button onClick={() => handleSaveAlt(img)} className="text-[10px] text-accent">Ok</button>
                    </div>
                  ) : (
                    <p
                      className="truncate text-[10px] text-muted-foreground cursor-pointer hover:text-foreground"
                      onClick={() => { setEditingAlt(img.id); setAltValue(img.alt) }}
                      title="Fai clic per modificare il testo alternativo"
                    >
                      {img.alt || '(senza testo alternativo)'}
                    </p>
                  )}
                </div>
                {section === 'layout' && (
                  <select
                    value={img.span}
                    onChange={(e) => handleSpanChange(img, e.target.value)}
                    className="absolute top-1 right-1 rounded border border-border bg-background/80 px-1 py-0.5 text-[9px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-sm"
                  >
                    {SPAN_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
                <button
                  onClick={() => handleDelete(img.id)}
                  className="absolute top-1 left-1 rounded-full bg-background/80 p-1 text-red-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 backdrop-blur-sm"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          {g[section].length === 0 && (
            <p className="text-xs text-muted-foreground/60">Nessuna immagine. Carica la prima.</p>
          )}
        </div>
      ))}
    </div>
    </>
  )
}

function ReviewsTab() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Review | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try { setReviews(await fetchReviews()) } catch { /* */ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSave(review: Review) {
    if (editing && reviews.find((r) => r.id === review.id)) {
      await updateReview(review)
    } else {
      await createReview(review)
    }
    setEditing(null)
    setIsAdding(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Eliminare questa recensione?')) return
    await deleteReview(id)
    load()
  }

  function handleDragStart(e: React.DragEvent, idx: number) {
    setDragIdx(idx)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setOverIdx(idx)
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    if (dragIdx === null || overIdx === null || dragIdx === overIdx) {
      setDragIdx(null)
      setOverIdx(null)
      return
    }
    const next = [...reviews]
    const [moved] = next.splice(dragIdx, 1)
    next.splice(overIdx, 0, moved)
    setReviews(next)
    setDragIdx(null)
    setOverIdx(null)
    await reorderReviews(next.map((r) => r.id))
  }

  function handleDragEnd() {
    setDragIdx(null)
    setOverIdx(null)
  }

  if (loading) return <p className="text-sm text-muted-foreground">Caricamento...</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{reviews.length} {reviews.length === 1 ? 'recensione' : 'recensioni'}</p>
        <button
          onClick={() => { setIsAdding(true); setEditing(null) }}
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90"
        >
          <Plus className="h-4 w-4" /> Aggiungi
        </button>
      </div>

      {(isAdding || editing) && (
        <ReviewForm
          review={editing}
          onSave={handleSave}
          onCancel={() => { setEditing(null); setIsAdding(false) }}
        />
      )}

      <div className="space-y-3">
        {reviews.map((review, idx) => (
          <div
            key={review.id}
            draggable
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            className={`rounded-xl border bg-card p-4 transition-colors ${
              overIdx === idx && dragIdx !== null && dragIdx !== idx
                ? 'border-accent border-dashed'
                : 'border-border'
            }`}
          >
            <div className="flex items-start gap-2">
              <button type="button" className="mt-1 cursor-grab text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing">
                <GripVertical className="h-4 w-4" />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {review.name}
                  <span className="text-xs text-muted-foreground">
                    ({review.source === 'booking' ? 'Booking.com' : review.source === 'agoda' ? 'Agoda' : 'Airbnb'})
                  </span>
                  {typeof review.rating === 'number' && (
                    <span className="flex items-center gap-0.5 text-xs text-accent">
                      <Star className="h-3 w-3 fill-current" /> {review.rating}
                    </span>
                  )}
                </div>
                {review.title && (
                  <p className="mt-1 text-sm font-semibold text-foreground">{review.title}</p>
                )}
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{review.text}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(review); setIsAdding(false) }} className="rounded-lg p-2 text-muted-foreground hover:bg-muted">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(review.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReviewForm({ review, onSave, onCancel }: { review: Review | null; onSave: (r: Review) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Omit<Review, 'id'>>({
    name: review?.name ?? '',
    location: review?.location ?? '',
    title: review?.title ?? '',
    text: review?.text ?? '',
    rating: review?.rating,
    source: review?.source ?? 'booking',
  })

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  return (
    <div className="rounded-xl border border-accent/30 bg-card p-5 space-y-4">
      <h3 className="font-medium text-foreground">{review ? 'Modifica recensione' : 'Nuova recensione'}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <input placeholder="Nome" value={form.name} onChange={(e) => update('name', e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        <input placeholder="Paese" value={form.location} onChange={(e) => update('location', e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </div>
      <input placeholder="Titolo della recensione (facoltativo)" value={form.title ?? ''} onChange={(e) => update('title', e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      <textarea placeholder="Testo della recensione" value={form.text} onChange={(e) => update('text', e.target.value)} rows={3} className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      <div className="grid gap-3 sm:grid-cols-3">
        <select value={form.source} onChange={(e) => update('source', e.target.value as Review['source'])} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          <option value="booking">Booking.com</option>
          <option value="agoda">Agoda</option>
          <option value="airbnb">Airbnb</option>
        </select>
        {form.source !== 'airbnb' ? (
          <input type="number" placeholder="Punteggio (0-10)" min="0" max="10" step="0.1" value={form.rating ?? ''} onChange={(e) => update('rating', e.target.value ? Number(e.target.value) : undefined)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        ) : (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button" onClick={() => update('rating', s)} className="p-0.5">
                <Star className={`h-5 w-5 ${s <= (form.rating ?? 0) ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`} />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave({ ...form, id: review?.id ?? '' })} className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90">
          <Save className="h-4 w-4" /> Salva
        </button>
        <button onClick={onCancel} className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted">
          Annulla
        </button>
      </div>
    </div>
  )
}

function groupByYearMonth<T>(
  items: T[],
  getDate: (item: T) => string,
): Array<{ year: string; month: number; items: T[] }> {
  const groups = new Map<string, T[]>()
  for (const item of items) {
    const date = getDate(item)
    const key = date.slice(0, 7)
    const group = groups.get(key) ?? []
    group.push(item)
    groups.set(key, group)
  }

  return Array.from(groups, ([key, groupItems]) => ({
    year: key.slice(0, 4),
    month: Number(key.slice(5, 7)) - 1,
    items: groupItems,
  })).sort((a, b) => a.year.localeCompare(b.year) || a.month - b.month)
}

function groupByYear<T>(
  items: T[],
  getDate: (item: T) => string,
): Array<{ year: string; months: Array<{ month: number; items: T[] }> }> {
  const years = new Map<string, Array<{ month: number; items: T[] }>>()
  for (const group of groupByYearMonth(items, getDate)) {
    const months = years.get(group.year) ?? []
    months.push({ month: group.month, items: group.items })
    years.set(group.year, months)
  }

  return Array.from(years, ([year, months]) => ({ year, months }))
}

function BlockedDatesTab() {
  const [blocked, setBlocked] = useState<BlockedDate[]>([])
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [icalDates, setIcalDates] = useState<Array<{ date: string; source: ICalSource }>>([])
  const [loading, setLoading] = useState(true)
  const [reason, setReason] = useState('')
  const today = new Date()
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [b, bk, icalData] = await Promise.all([fetchBlockedDates(), fetchBookings(), fetchIcalPreview()])
      setBlocked(b)
      setBookings(bk)
      const dates = new Map<string, { date: string; source: ICalSource }>()
      for (const feed of icalData.feeds) {
        for (const ev of feed.events) {
          const start = new Date(`${ev.start}T00:00:00.000Z`)
          const end = new Date(`${ev.end}T00:00:00.000Z`)
          const nights = Math.round((end.getTime() - start.getTime()) / 86400000)
          for (let i = 0; i < nights; i++) {
            const d = new Date(start)
            d.setUTCDate(d.getUTCDate() + i)
            const date = d.toISOString().slice(0, 10)
            dates.set(`${feed.source}:${date}`, { date, source: feed.source })
          }
        }
      }
      setIcalDates(Array.from(dates.values()))
    } catch { /* */ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const blockedSet = new Set(blocked.map((d) => d.date))
  const icalSourceMap = new Map<string, Set<ICalSource>>()
  for (const item of icalDates) {
    const sources = icalSourceMap.get(item.date) ?? new Set<ICalSource>()
    sources.add(item.source)
    icalSourceMap.set(item.date, sources)
  }

  // Build a map of date -> booking status for confirmed bookings
  const bookingDateMap = new Map<string, string>()
  for (const b of bookings) {
    if (b.status !== 'paid' && b.status !== 'pending') continue
    const start = new Date(`${b.check_in}T00:00:00.000Z`)
    const end = new Date(`${b.check_out}T00:00:00.000Z`)
    const nights = Math.round((end.getTime() - start.getTime()) / 86400000)
    for (let i = 0; i < nights; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      const iso = d.toISOString().slice(0, 10)
      if (!bookingDateMap.has(iso)) {
        bookingDateMap.set(iso, b.status)
      }
    }
  }

  function formatDate(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  async function toggleDate(dateStr: string) {
    if (blockedSet.has(dateStr)) {
      await removeBlockedDate(dateStr)
    } else {
      await addBlockedDates([dateStr], reason || undefined)
    }
    load()
  }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7
  const days: (number | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
  const groupedBlocked = groupByYear(
    [...blocked].sort((a, b) => a.date.localeCompare(b.date)),
    (date) => date.date,
  )
  const groupedIcal = groupByYear(
    [...icalDates].sort((a, b) => a.date.localeCompare(b.date) || a.source.localeCompare(b.source)),
    (item) => item.date,
  )
  const groupedBookings = groupByYear(
    [...bookings].sort((a, b) => a.check_in.localeCompare(b.check_in)),
    (booking) => booking.check_in,
  )

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  if (loading) return <p className="text-sm text-muted-foreground">Caricamento...</p>

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1 block text-sm text-muted-foreground">Motivo (opzionale)</label>
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="es. Manutenzione, Personale..." className="w-full max-w-md rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary" />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={prevMonth} className="rounded-lg px-3 py-1 text-sm hover:bg-muted">&larr;</button>
          <span className="font-medium text-foreground">{monthNames[viewMonth]} {viewYear}</span>
          <button onClick={nextMonth} className="rounded-lg px-3 py-1 text-sm hover:bg-muted">&rarr;</button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] text-muted-foreground">
          {['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'].map((d) => (
            <div key={d} className="py-0.5 font-medium">{d}</div>
          ))}
        </div>

        <div className="mt-0.5 grid grid-cols-7 gap-0.5">
          {days.map((day, i) => {
            if (day === null) return <div key={`e${i}`} />
            const dateStr = formatDate(viewYear, viewMonth, day)
            const isBlocked = blockedSet.has(dateStr)
            const icalSources = icalSourceMap.get(dateStr)
            const hasIcal = !!icalSources?.size
            const hasBothIcalSources = icalSources?.has('airbnb') && icalSources.has('booking')
            const bookingStatus = bookingDateMap.get(dateStr)
            const isPast = new Date(dateStr) < new Date(today.toISOString().slice(0, 10))
            const cellClass = isPast
              ? 'text-muted-foreground/30 cursor-not-allowed'
              : isBlocked
                ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                : hasBothIcalSources
                  ? 'text-white hover:brightness-110'
                  : icalSources?.has('airbnb')
                  ? 'bg-[#FD5C63] text-white hover:bg-[#e85359]'
                  : icalSources?.has('booking')
                  ? 'bg-[#003B95] text-white hover:bg-[#02337c]'
                  : bookingStatus === 'paid'
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : bookingStatus === 'pending'
                      ? 'bg-amber-400 text-white hover:bg-amber-500'
                      : 'hover:bg-muted text-foreground'

            let tooltip = ''
            if (bookingStatus) {
              const booking = bookings.find((b) => {
                if (b.status !== bookingStatus) return false
                return dateStr >= b.check_in && dateStr < b.check_out
              })
              if (booking) {
                tooltip = `${booking.first_name} ${booking.last_name} · ${formatEU(booking.check_in)} → ${formatEU(booking.check_out)} (${booking.nights} ${booking.nights === 1 ? 'notte' : 'notti'}) · ${bookingStatus === 'paid' ? 'Pagata' : 'In attesa'}`
              }
            } else if (isBlocked) {
              const reason = blocked.find((b) => b.date === dateStr)?.reason
              tooltip = reason ? `Bloccata: ${reason}` : 'Bloccata dall’amministratore'
            } else if (hasIcal) {
              tooltip = `Bloccata (${Array.from(icalSources ?? []).map((source) => source === 'airbnb' ? 'Airbnb' : 'Booking').join(' e ')})`
            }

            return (
              <button
                key={dateStr}
                onClick={() => !isPast && !bookingStatus && toggleDate(dateStr)}
                disabled={isPast || !!bookingStatus}
                title={tooltip}
                className={`h-7 w-7 rounded text-[11px] transition-colors ${cellClass}`}
                style={hasBothIcalSources && !isBlocked
                  ? { background: 'linear-gradient(to right, #FD5C63 0 50%, #003B95 50% 100%)' }
                  : undefined}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm bg-accent" /> Bloccata dall’amministratore</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm bg-[#FD5C63]" /> Airbnb</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm bg-[#003B95]" /> Booking</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm" style={{ background: 'linear-gradient(to right, #FD5C63 0 50%, #003B95 50% 100%)' }} /> Airbnb + Booking</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm bg-amber-400" /> In attesa di pagamento</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm bg-green-500" /> Pagata / Prenotata</span>
      </div>

      {(blocked.length > 0 || icalDates.length > 0) && (
        <details className="rounded-xl border border-border bg-card">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-foreground marker:hidden">
            Date bloccate ({blocked.length + icalDates.length})
          </summary>
          <div className="space-y-4 border-t border-border p-3">
            {groupedBlocked.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Bloccate dall’amministratore</p>
                {groupedBlocked.map((yearGroup) => (
                  <details key={yearGroup.year} className="rounded-lg border border-border">
                    <summary className="cursor-pointer list-none px-3 py-2 text-sm font-medium marker:hidden">
                      {yearGroup.year} <span className="text-xs font-normal text-muted-foreground">({yearGroup.months.reduce((sum, month) => sum + month.items.length, 0)})</span>
                    </summary>
                    <div className="space-y-2 border-t border-border p-2">
                      {yearGroup.months.map((monthGroup) => (
                        <details key={monthGroup.month} className="rounded-lg border border-border bg-background">
                          <summary className="cursor-pointer list-none px-3 py-2 text-xs font-medium marker:hidden">
                            {monthNames[monthGroup.month]} <span className="font-normal text-muted-foreground">({monthGroup.items.length})</span>
                          </summary>
                          <div className="flex flex-wrap gap-2 border-t border-border px-3 py-3">
                            {monthGroup.items.map((date) => (
                              <span key={date.date} className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs text-red-600">
                                {formatEU(date.date)}
                                {date.reason && <span className="text-red-400">· {date.reason}</span>}
                                <button onClick={() => removeBlockedDate(date.date).then(load)} className="ml-0.5 hover:text-red-800">&times;</button>
                              </span>
                            ))}
                          </div>
                        </details>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            )}

            {groupedIcal.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Bloccate da iCal</p>
                {groupedIcal.map((yearGroup) => (
                  <details key={yearGroup.year} className="rounded-lg border border-border">
                    <summary className="cursor-pointer list-none px-3 py-2 text-sm font-medium marker:hidden">
                      {yearGroup.year} <span className="text-xs font-normal text-muted-foreground">({yearGroup.months.reduce((sum, month) => sum + month.items.length, 0)})</span>
                    </summary>
                    <div className="space-y-2 border-t border-border p-2">
                      {yearGroup.months.map((monthGroup) => (
                        <details key={monthGroup.month} className="rounded-lg border border-border bg-background">
                          <summary className="cursor-pointer list-none px-3 py-2 text-xs font-medium marker:hidden">
                            {monthNames[monthGroup.month]} <span className="font-normal text-muted-foreground">({monthGroup.items.length})</span>
                          </summary>
                          <div className="flex flex-wrap gap-2 border-t border-border px-3 py-3">
                            {monthGroup.items.map((date) => (
                              <span
                                key={`${date.source}:${date.date}`}
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${
                                  date.source === 'airbnb'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-[#003B95]/10 text-[#003B95]'
                                }`}
                              >
                                <span className={`inline-block h-2.5 w-2.5 rounded-sm ${date.source === 'airbnb' ? 'bg-[#FD5C63]' : 'bg-[#003B95]'}`} />
                                {formatEU(date.date)}
                              </span>
                            ))}
                          </div>
                        </details>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>
        </details>
      )}

      {bookings.length > 0 && (
        <details className="rounded-xl border border-border bg-card">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-foreground marker:hidden">
            Prenotazioni ({bookings.length})
          </summary>
          <div className="space-y-2 border-t border-border p-3">
            {groupedBookings.map((yearGroup) => (
              <details key={yearGroup.year} className="rounded-lg border border-border">
                <summary className="cursor-pointer list-none px-3 py-2 text-sm font-medium marker:hidden">
                  {yearGroup.year} <span className="text-xs font-normal text-muted-foreground">({yearGroup.months.reduce((sum, month) => sum + month.items.length, 0)})</span>
                </summary>
                <div className="space-y-2 border-t border-border p-2">
                  {yearGroup.months.map((monthGroup) => (
                    <details key={monthGroup.month} className="rounded-lg border border-border bg-background">
                      <summary className="cursor-pointer list-none px-3 py-2 text-xs font-medium marker:hidden">
                        {monthNames[monthGroup.month]} <span className="font-normal text-muted-foreground">({monthGroup.items.length})</span>
                      </summary>
                      <div className="space-y-2 border-t border-border p-2">
                        {monthGroup.items.map((booking) => (
                          <div key={booking.id} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${
                            booking.status === 'paid'
                              ? 'border-green-500 bg-green-500 text-white'
                              : 'border-amber-400 bg-amber-400 text-white'
                          }`}>
                            <span>{booking.first_name} {booking.last_name} · {formatEU(booking.check_in)} → {formatEU(booking.check_out)} ({booking.nights} {booking.nights === 1 ? 'notte' : 'notti'})</span>
                            <span className="font-semibold">{booking.status === 'paid' ? 'Pagata' : 'In attesa'}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

function BoldTextarea({
  value,
  onChange,
  rows = 2,
}: {
  value: string
  onChange: (v: string) => void
  rows?: number
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  function toggleBold() {
    const ta = ref.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = value.slice(start, end)
    if (!selected) return
    const isBold = selected.startsWith('**') && selected.endsWith('**')
    const replacement = isBold ? selected.slice(2, -2) : `**${selected}**`
    const next = value.slice(0, start) + replacement + value.slice(end)
    onChange(next)
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={toggleBold}
          title="Grassa (seleziona il testo prima)"
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <span className="text-[10px] text-muted-foreground/50">seleziona testo e premi</span>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary font-mono"
      />
      {value.includes('**') && (
        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
          <RichText text={value} className="font-semibold text-accent" />
        </div>
      )}
    </div>
  )
}

function ContentTab() {
  const [content, setContent] = useState<Record<string, Record<string, string | string[]>>>({})
  const [loading, setLoading] = useState(true)
  const [activeLocale, setActiveLocale] = useState('it')
  const [saving, setSaving] = useState(false)
  const [savingFooterLinks, setSavingFooterLinks] = useState(false)
  const [footerLinksDirty, setFooterLinksDirty] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [status, setStatus] = useState('')
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['Hero']))
  const [translating, setTranslating] = useState(false)
  const [translateProgress, setTranslateProgress] = useState({
    done: 0,
    total: 0,
    currentLocale: '',
    doneItems: 0,
    totalItems: 0,
    currentKey: '',
  })
  const [translateLog, setTranslateLog] = useState<{ key: string; text: string; locale: string }[]>([])
  const translateLogRef = useRef<HTMLDivElement>(null)

  const LOCALE_LABELS: Record<string, string> = {
    it: 'Italiano',
    en: 'English',
    fr: 'Français',
    de: 'Deutsch',
    es: 'Español',
    ru: 'Русский',
  }

  useEffect(() => {
    fetchAllContent().then((c) => { setContent(c); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    translateLogRef.current?.scrollTo({
      top: translateLogRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [translateLog])

  const current: Record<string, string | string[]> = content[activeLocale] ?? {}
  const italianContent = content.it ?? {}
  const footerLinkKeys = ['footer.bookingUrl', 'footer.airbnbUrl', 'footer.googleUrl', 'footer.instagramUrl'] as const
  const storedQuestions = current['faq.questions']
  const storedAnswers = current['faq.answers']
  const faqItems: FaqItem[] = Array.isArray(storedQuestions) || Array.isArray(storedAnswers)
    ? Array.from(
        { length: Math.max(
          Array.isArray(storedQuestions) ? storedQuestions.length : 0,
          Array.isArray(storedAnswers) ? storedAnswers.length : 0,
        ) },
        (_, index) => ({
          question: Array.isArray(storedQuestions) ? String(storedQuestions[index] ?? '') : '',
          answer: Array.isArray(storedAnswers) ? String(storedAnswers[index] ?? '') : '',
        }),
      )
    : activeLocale === 'it' ? DEFAULT_FAQ_ITEMS : []
  const storedServiceTitles = current['servicesPage.sectionTitles']
  const storedServiceBodies = current['servicesPage.sectionBodies']
  const serviceSections: FaqItem[] = Array.isArray(storedServiceTitles) || Array.isArray(storedServiceBodies)
    ? Array.from(
        { length: Math.max(
          Array.isArray(storedServiceTitles) ? storedServiceTitles.length : 0,
          Array.isArray(storedServiceBodies) ? storedServiceBodies.length : 0,
        ) },
        (_, index) => ({
          question: Array.isArray(storedServiceTitles) ? String(storedServiceTitles[index] ?? '') : '',
          answer: Array.isArray(storedServiceBodies) ? String(storedServiceBodies[index] ?? '') : '',
        }),
      )
    : [{
        question: String(current['servicesPage.title'] ?? (activeLocale === 'it' ? 'Colazioni e pasti' : '')),
        answer: String(current['servicesPage.body'] ?? ''),
      }]
  const getPolicySections = (prefix: 'privacyPage' | 'termsPage'): FaqItem[] => {
    const storedTitles = current[`${prefix}.sectionTitles`]
    const storedBodies = current[`${prefix}.sectionBodies`]
    if (!Array.isArray(storedTitles) && !Array.isArray(storedBodies)) return []
    return Array.from(
      { length: Math.max(
        Array.isArray(storedTitles) ? storedTitles.length : 0,
        Array.isArray(storedBodies) ? storedBodies.length : 0,
      ) },
      (_, index) => ({
        question: Array.isArray(storedTitles) ? String(storedTitles[index] ?? '') : '',
        answer: Array.isArray(storedBodies) ? String(storedBodies[index] ?? '') : '',
      }),
    )
  }
  const privacySections = getPolicySections('privacyPage')
  const termsSections = getPolicySections('termsPage')

  function updateOverride(key: string, value: string) {
    setContent((prev) => {
      const copy = { ...prev }
      copy[activeLocale] = {
        ...copy[activeLocale],
        [key]: ARRAY_CONTENT_KEYS.has(key) ? value.split('\n').filter(Boolean) : value,
      }
      return copy
    })
    setDirty(true)
    setStatus('')
  }

  function updateFooterLink(key: (typeof footerLinkKeys)[number], value: string) {
    setContent((previous) => ({
      ...previous,
      it: { ...previous.it, [key]: value },
    }))
    setFooterLinksDirty(true)
    setStatus('')
  }

  async function handleSaveFooterLinks() {
    setSavingFooterLinks(true)
    setStatus('')
    try {
      const links = Object.fromEntries(
        footerLinkKeys.map((key) => [key, String(italianContent[key] ?? '')]),
      )
      await saveContent('it', links)
      setFooterLinksDirty(false)
      setStatus('Link del footer salvati.')
    } catch {
      setStatus('Salvataggio dei link non riuscito. Riprova.')
    } finally {
      setSavingFooterLinks(false)
    }
  }

  function updateFaqItems(items: FaqItem[]) {
    setContent((previous) => ({
      ...previous,
      [activeLocale]: {
        ...previous[activeLocale],
        'faq.questions': items.map((item) => item.question),
        'faq.answers': items.map((item) => item.answer),
      },
    }))
    setDirty(true)
    setStatus('')
  }

  function updateServiceSections(sections: FaqItem[]) {
    setContent((previous) => ({
      ...previous,
      [activeLocale]: {
        ...previous[activeLocale],
        'servicesPage.sectionTitles': sections.map((section) => section.question),
        'servicesPage.sectionBodies': sections.map((section) => section.answer),
      },
    }))
    setDirty(true)
    setStatus('')
  }

  function updatePolicySections(prefix: 'privacyPage' | 'termsPage', sections: FaqItem[]) {
    setContent((previous) => ({
      ...previous,
      [activeLocale]: {
        ...previous[activeLocale],
        [`${prefix}.sectionTitles`]: sections.map((section) => section.question),
        [`${prefix}.sectionBodies`]: sections.map((section) => section.answer),
      },
    }))
    setDirty(true)
    setStatus('')
  }

  function toggleSection(label: string) {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  async function handleSave() {
    setSaving(true)
    setStatus('')
    try {
      await saveContent(activeLocale, current)
      setDirty(false)
      if (activeLocale === 'it') setFooterLinksDirty(false)
      setStatus(`Contenuti ${LOCALE_LABELS[activeLocale]} salvati.`)
      setContent(await fetchAllContent())
    } catch {
      setStatus('Salvataggio non riuscito. Riprova.')
    } finally {
      setSaving(false)
    }
  }

  async function handleTranslate() {
    setTranslating(true)
    setTranslateLog([])
    try {
      const pairs = Object.entries(current)
        .filter(([key, value]) =>
          !footerLinkKeys.includes(key as (typeof footerLinkKeys)[number]) &&
          typeof value === 'string' &&
          value.trim(),
        )
        .map(([key, value]) => ({ key, value: value as string }))
      if (activeLocale === 'it' && !pairs.some(({ key }) => key === 'servicesPage.title')) {
        pairs.push({ key: 'servicesPage.title', value: 'Colazioni e pasti' })
      }
      const faqPairs = faqItems.flatMap((item, index) => [
        ...(item.question.trim() ? [{ key: `faq.questions.${index}`, value: item.question }] : []),
        ...(item.answer.trim() ? [{ key: `faq.answers.${index}`, value: item.answer }] : []),
      ])
      const servicePairs = serviceSections.flatMap((section, index) => [
        ...(section.question.trim() ? [{ key: `servicesPage.sectionTitles.${index}`, value: section.question }] : []),
        ...(section.answer.trim() ? [{ key: `servicesPage.sectionBodies.${index}`, value: section.answer }] : []),
      ])
      const privacyPairs = privacySections.flatMap((section, index) => [
        ...(section.question.trim() ? [{ key: `privacyPage.sectionTitles.${index}`, value: section.question }] : []),
        ...(section.answer.trim() ? [{ key: `privacyPage.sectionBodies.${index}`, value: section.answer }] : []),
      ])
      const termsPairs = termsSections.flatMap((section, index) => [
        ...(section.question.trim() ? [{ key: `termsPage.sectionTitles.${index}`, value: section.question }] : []),
        ...(section.answer.trim() ? [{ key: `termsPage.sectionBodies.${index}`, value: section.answer }] : []),
      ])
      pairs.push(...faqPairs, ...servicePairs, ...privacyPairs, ...termsPairs)

      const targetLocales = ['en', 'fr', 'de', 'es', 'ru']
      setTranslateProgress({
        done: 0,
        total: targetLocales.length,
        currentLocale: '',
        doneItems: 0,
        totalItems: pairs.length,
        currentKey: '',
      })

      for (let i = 0; i < targetLocales.length; i++) {
        const locale = targetLocales[i]
        setTranslateProgress((progress) => ({
          ...progress,
          done: i,
          currentLocale: LOCALE_LABELS[locale],
          doneItems: 0,
          currentKey: '',
        }))
        const localeTranslations: Record<string, string> = {}
        const translatedQuestions = Array.from({ length: faqItems.length }, () => '')
        const translatedAnswers = Array.from({ length: faqItems.length }, () => '')
        const translatedServiceTitles = Array.from({ length: serviceSections.length }, () => '')
        const translatedServiceBodies = Array.from({ length: serviceSections.length }, () => '')
        const translatedPrivacyTitles = Array.from({ length: privacySections.length }, () => '')
        const translatedPrivacyBodies = Array.from({ length: privacySections.length }, () => '')
        const translatedTermsTitles = Array.from({ length: termsSections.length }, () => '')
        const translatedTermsBodies = Array.from({ length: termsSections.length }, () => '')
        for (let itemIndex = 0; itemIndex < pairs.length; itemIndex++) {
          const pair = pairs[itemIndex]
          setTranslateProgress((progress) => ({ ...progress, currentKey: pair.key }))
          const { translations } = await translateContent([pair], locale)
          const translatedText = translations[locale]?.[pair.key]
          if (typeof translatedText !== 'string') {
            throw new Error(`Missing translation for ${pair.key} (${locale})`)
          }
          const questionMatch = pair.key.match(/^faq\.questions\.(\d+)$/)
          const answerMatch = pair.key.match(/^faq\.answers\.(\d+)$/)
          const serviceTitleMatch = pair.key.match(/^servicesPage\.sectionTitles\.(\d+)$/)
          const serviceBodyMatch = pair.key.match(/^servicesPage\.sectionBodies\.(\d+)$/)
          const privacyTitleMatch = pair.key.match(/^privacyPage\.sectionTitles\.(\d+)$/)
          const privacyBodyMatch = pair.key.match(/^privacyPage\.sectionBodies\.(\d+)$/)
          const termsTitleMatch = pair.key.match(/^termsPage\.sectionTitles\.(\d+)$/)
          const termsBodyMatch = pair.key.match(/^termsPage\.sectionBodies\.(\d+)$/)
          if (questionMatch) {
            translatedQuestions[Number(questionMatch[1])] = translatedText
          } else if (answerMatch) {
            translatedAnswers[Number(answerMatch[1])] = translatedText
          } else if (serviceTitleMatch) {
            translatedServiceTitles[Number(serviceTitleMatch[1])] = translatedText
          } else if (serviceBodyMatch) {
            translatedServiceBodies[Number(serviceBodyMatch[1])] = translatedText
          } else if (privacyTitleMatch) {
            translatedPrivacyTitles[Number(privacyTitleMatch[1])] = translatedText
          } else if (privacyBodyMatch) {
            translatedPrivacyBodies[Number(privacyBodyMatch[1])] = translatedText
          } else if (termsTitleMatch) {
            translatedTermsTitles[Number(termsTitleMatch[1])] = translatedText
          } else if (termsBodyMatch) {
            translatedTermsBodies[Number(termsBodyMatch[1])] = translatedText
          } else {
            localeTranslations[pair.key] = translatedText
          }
          setTranslateLog((previous) => [...previous, { key: pair.key, text: translatedText, locale }])
          setTranslateProgress((progress) => ({
            ...progress,
            doneItems: itemIndex + 1,
            currentKey: '',
          }))
        }
        await saveContent(locale, {
          ...localeTranslations,
          'faq.questions': translatedQuestions,
          'faq.answers': translatedAnswers,
          'servicesPage.sectionTitles': translatedServiceTitles,
          'servicesPage.sectionBodies': translatedServiceBodies,
          'privacyPage.sectionTitles': translatedPrivacyTitles,
          'privacyPage.sectionBodies': translatedPrivacyBodies,
          'termsPage.sectionTitles': translatedTermsTitles,
          'termsPage.sectionBodies': translatedTermsBodies,
        })
      }
      setTranslateProgress((progress) => ({
        ...progress,
        done: targetLocales.length,
        currentLocale: '',
        currentKey: '',
      }))
      setStatus('Traduzione completata in 5 lingue.')
    } catch {
      setStatus('Traduzione fallita. Riprova.')
    } finally {
      setTranslating(false)
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Caricamento...</p>

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(LOCALE_LABELS) as string[]).map((loc) => (
          <button
            key={loc}
            onClick={() => { setActiveLocale(loc); setDirty(false); setStatus('') }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeLocale === loc
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {LOCALE_LABELS[loc]}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={handleSave}
          disabled={!dirty || saving || translating || (footerLinksDirty && activeLocale !== 'it')}
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> {saving ? 'Salvataggio...' : 'Salva'}
        </button>
        {activeLocale === 'it' && (
          <button
            onClick={handleTranslate}
            disabled={saving || translating}
            className="flex items-center gap-2 rounded-xl border border-accent bg-background px-4 py-2 text-sm font-medium text-accent hover:bg-accent/10 disabled:opacity-50"
          >
            {translating ? 'Traduzione...' : 'Traduci in 5 lingue'}
          </button>
        )}
      </div>
      {status && <p className="text-sm text-muted-foreground" role="status">{status}</p>}
      {activeLocale !== 'it' && !translating && (
        <p className="text-xs text-muted-foreground/70">
          Le modifiche vanno salvate singolarmente per ogni lingua. Usa &quot;Traduci in 5 lingue&quot; dall'italiano per tradurre automaticamente.
        </p>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('Pagina servizi')}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
        >
          <span>Pagina servizi</span>
          <span className="text-muted-foreground text-xs">{openSections.has('Pagina servizi') ? '−' : '+'}</span>
        </button>
        {openSections.has('Pagina servizi') && (
          <div className="space-y-3 border-t border-border px-4 pb-4 pt-3">
            {serviceSections.map((section, index) => (
              <div key={index} className="space-y-3 rounded-lg border border-border bg-background/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Sezione {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => updateServiceSections(serviceSections.filter((_, itemIndex) => itemIndex !== index))}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Rimuovi
                  </button>
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Titolo</span>
                  <BoldTextarea
                    value={section.question}
                    onChange={(value) => updateServiceSections(serviceSections.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, question: value } : item))}
                    rows={2}
                  />
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Testo</span>
                  <BoldTextarea
                    value={section.answer}
                    onChange={(value) => updateServiceSections(serviceSections.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, answer: value } : item))}
                    rows={6}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateServiceSections([...serviceSections, { question: '', answer: '' }])}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted/50"
            >
              <Plus className="h-4 w-4" /> Aggiungi sezione
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {([
          { prefix: 'privacyPage', label: 'Pagina privacy', sections: privacySections },
          { prefix: 'termsPage', label: 'Pagina termini', sections: termsSections },
        ] as const).map(({ prefix, label, sections }) => (
          <section key={prefix} className="border-b border-border last:border-b-0">
            <button
              type="button"
              onClick={() => toggleSection(label)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
            >
              <span>{label}</span>
              <span className="text-muted-foreground text-xs">{openSections.has(label) ? '−' : '+'}</span>
            </button>
            {openSections.has(label) && (
              <div className="space-y-3 border-t border-border px-4 pb-4 pt-3">
                {sections.map((section, index) => (
                  <div key={index} className="space-y-3 rounded-lg border border-border bg-background/50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Sezione {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => updatePolicySections(prefix, sections.filter((_, itemIndex) => itemIndex !== index))}
                        className="flex items-center gap-1 rounded px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Rimuovi
                      </button>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Titolo</span>
                      <BoldTextarea
                        value={section.question}
                        onChange={(value) => updatePolicySections(prefix, sections.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, question: value } : item))}
                        rows={2}
                      />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Testo</span>
                      <BoldTextarea
                        value={section.answer}
                        onChange={(value) => updatePolicySections(prefix, sections.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, answer: value } : item))}
                        rows={6}
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => updatePolicySections(prefix, [...sections, { question: '', answer: '' }])}
                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted/50"
                >
                  <Plus className="h-4 w-4" /> Aggiungi sezione
                </button>
              </div>
            )}
          </section>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('FAQ')}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
        >
          <span>FAQ</span>
          <span className="text-muted-foreground text-xs">{openSections.has('FAQ') ? '−' : '+'}</span>
        </button>
        {openSections.has('FAQ') && (
          <div className="space-y-3 border-t border-border px-4 pb-4 pt-3">
            {faqItems.map((item, index) => (
              <div key={index} className="space-y-3 rounded-lg border border-border bg-background/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">FAQ {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => updateFaqItems(faqItems.filter((_, itemIndex) => itemIndex !== index))}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Rimuovi
                  </button>
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Domanda</span>
                  <BoldTextarea
                    value={item.question}
                    onChange={(value) => updateFaqItems(faqItems.map((faq, itemIndex) =>
                      itemIndex === index ? { ...faq, question: value } : faq))}
                    rows={2}
                  />
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Risposta</span>
                  <p className="mt-1 text-[10px] text-muted-foreground/70">
                    Per aggiungere un link usa [testo](https://esempio.com).
                  </p>
                  <BoldTextarea
                    value={item.answer}
                    onChange={(value) => updateFaqItems(faqItems.map((faq, itemIndex) =>
                      itemIndex === index ? { ...faq, answer: value } : faq))}
                    rows={4}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateFaqItems([...faqItems, { question: '', answer: '' }])}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted/50"
            >
              <Plus className="h-4 w-4" /> Aggiungi FAQ
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {CONTENT_SECTIONS.map((section) => {
          const isOpen = openSections.has(section.label)

          return (
            <div key={section.label} className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection(section.label)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  {CONTENT_SECTION_LABELS[section.label] || section.label}
                </span>
                <span className="text-muted-foreground text-xs">{isOpen ? '−' : '+'}</span>
              </button>

              {isOpen && (
                <div className="space-y-3 border-t border-border px-4 pb-4 pt-3">
                  {section.keys.map((key) => {
                    const value = current[key] ?? (ARRAY_CONTENT_KEYS.has(key) ? [] : '')
                    const label = key.split('.').pop() ?? key

                    return (
                      <div key={key} className="rounded-lg border border-border bg-background/50 p-3">
                        <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          {label}
                          <span className="text-[10px] text-muted-foreground/50">{key}</span>
                        </label>
                        {Array.isArray(value) ? (
                          <BoldTextarea
                            value={value.join('\n')}
                            onChange={(v) => updateOverride(key, v)}
                            rows={3}
                          />
                        ) : (
                          <BoldTextarea
                            value={String(value)}
                            onChange={(v) => updateOverride(key, v)}
                            rows={2}
                          />
                        )}
                      </div>
                    )
                  })}
                  {section.label === 'Footer' && (
                    <div className="space-y-3 rounded-lg border border-accent/30 bg-background/50 p-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Link pulsanti footer</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Impostazioni globali: questi link sono condivisi da tutte le lingue.
                        </p>
                      </div>
                      {([
                        ['footer.bookingUrl', 'Booking'],
                        ['footer.airbnbUrl', 'Airbnb'],
                        ['footer.googleUrl', 'Google'],
                        ['footer.instagramUrl', 'Instagram'],
                      ] as const).map(([key, label]) => (
                        <label key={key} className="block text-xs font-medium text-muted-foreground">
                          {label}
                          <input
                            type="url"
                            value={String(italianContent[key] ?? '')}
                            onChange={(event) => updateFooterLink(key, event.target.value)}
                            placeholder="https://..."
                            className="mt-1.5 block w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
                          />
                        </label>
                      ))}
                      <button
                        type="button"
                        onClick={handleSaveFooterLinks}
                        disabled={!footerLinksDirty || savingFooterLinks || translating}
                        className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        {savingFooterLinks ? 'Salvataggio...' : 'Salva link footer'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {translating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl max-w-lg w-full space-y-4 max-h-[80vh] flex flex-col">
            <div className="text-lg font-medium text-foreground text-center">Traduzione in corso...</div>
            <div className="text-sm text-muted-foreground text-center">
              {translateProgress.currentLocale || 'Preparazione...'}
              {translateProgress.currentKey && ` · ${translateProgress.currentKey}`}
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${translateProgress.total ? (translateProgress.done / translateProgress.total) * 100 : 0}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {translateProgress.done} / {translateProgress.total} lingue
              {translateProgress.currentLocale && translateProgress.totalItems > 0 && (
                <>
                  {' · contenuto '}
                  {translateProgress.doneItems + (translateProgress.currentKey ? 1 : 0)} / {translateProgress.totalItems}
                </>
              )}
            </div>
            {translateLog.length > 0 && (
              <div ref={translateLogRef} className="flex-1 overflow-y-auto rounded-lg border border-border bg-muted/30 p-3 font-mono text-xs space-y-1.5 max-h-60">
                {translateLog.map((entry) => (
                  <div key={`${entry.locale}-${entry.key}`} className="flex gap-2">
                    <span className="shrink-0 text-muted-foreground/60">{entry.locale}.</span>
                    <span className="shrink-0 text-accent font-medium">{entry.key}</span>
                    <span className="text-foreground break-words">{entry.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function IcalTab() {
  const [airbnbUrl, setAirbnbUrl] = useState('')
  const [bookingUrl, setBookingUrl] = useState('')
  const [exportUrl, setExportUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feeds, setFeeds] = useState<ICalFeedPreview[]>([])
  const [saveError, setSaveError] = useState('')
  const [copyStatus, setCopyStatus] = useState('')

  const loadPreview = useCallback(async () => {
    try {
      const data = await fetchIcalPreview()
      setFeeds(data.feeds)
    } catch {
      setFeeds([])
      setSaveError('Impossibile caricare i calendari iCal')
    }
  }, [])

  useEffect(() => {
    fetchIcalUrls().then((data) => {
      setAirbnbUrl(data.airbnbUrl)
      setBookingUrl(data.bookingUrl)
      setExportUrl(data.exportUrl)
      setLoading(false)
      if (data.airbnbUrl || data.bookingUrl) loadPreview()
    }).catch((error) => {
      setSaveError(error instanceof Error ? error.message : 'Impossibile caricare il link iCal')
      setLoading(false)
    })
  }, [loadPreview])

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    try {
      await saveIcalUrls(airbnbUrl, bookingUrl)
      await loadPreview()
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Impossibile salvare i calendari')
    } finally {
      setSaving(false)
    }
  }

  async function handleCopyExportUrl() {
    try {
      await navigator.clipboard.writeText(exportUrl)
      setCopyStatus('Link copiato.')
    } catch {
      setCopyStatus('Impossibile copiare il link.')
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Caricamento...</p>

  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-medium text-foreground">Calendario iCal Crooked House</h3>
        <p className="text-xs text-muted-foreground">
          Usa questo link di sola lettura per importare le prenotazioni pagate e le date bloccate manualmente. Il link è fisso e non può essere cambiato. Chiunque ne sia in possesso può vedere i nomi degli ospiti e le date.
        </p>
        <div className="flex gap-2">
          <input
            type="url"
            aria-label="Link calendario iCal Crooked House"
            value={exportUrl}
            readOnly
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground"
          />
          <button
            type="button"
            onClick={handleCopyExportUrl}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-accent-foreground hover:bg-accent/90"
          >
            <Copy className="h-3.5 w-3.5" /> Copia link
          </button>
        </div>
        {copyStatus && <p role="status" className="text-xs text-muted-foreground">{copyStatus}</p>}
        <p className="text-xs text-muted-foreground">
          Il link serve solo il calendario iCal su ical.crookedhouse.it; non espone il sito. Il calendario viene aggiornato a ogni richiesta, ma la frequenza di aggiornamento dipende dal sito a cui lo colleghi.
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        Inserisci i link iCal di Airbnb e Booking. Le prenotazioni importate bloccano automaticamente le date e sono mostrate con colori diversi.
      </p>
      <div className="space-y-3">
        <label className="block space-y-1.5">
          <span className="flex items-center gap-2 text-sm font-medium text-[#FD5C63]"><span className="inline-block h-3.5 w-3.5 rounded-sm bg-[#FD5C63]" /> Airbnb URL</span>
          <input
            type="url"
            value={airbnbUrl}
            onChange={(e) => setAirbnbUrl(e.target.value)}
            placeholder="https://www.airbnb.com/calendar/ical/..."
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="flex items-center gap-2 text-sm font-medium text-[#003B95]"><span className="inline-block h-3.5 w-3.5 rounded-sm bg-[#003B95]" /> Booking URL</span>
          <input
            type="url"
            value={bookingUrl}
            onChange={(e) => setBookingUrl(e.target.value)}
            placeholder="https://ical.booking.com/ical/..."
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
      >
        <Save className="h-4 w-4" /> {saving ? 'Salvataggio...' : 'Salva calendari'}
      </button>
      {saveError && <p className="text-sm text-destructive">{saveError}</p>}
      {feeds.map((feed) => {
        const isAirbnb = feed.source === 'airbnb'
        const providerName = isAirbnb ? 'Airbnb' : 'Booking'
        return (
          <details key={feed.source} className="rounded-xl border border-border bg-card">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:hidden">
              <span className={`flex items-center gap-2 text-sm font-medium ${isAirbnb ? 'text-[#FD5C63]' : 'text-[#003B95]'}`}>
                <span className={`inline-block h-3.5 w-3.5 rounded-sm ${isAirbnb ? 'bg-[#FD5C63]' : 'bg-[#003B95]'}`} /> {providerName}
              </span>
              <span className="text-xs text-muted-foreground">
                {feed.error ? 'Errore' : feed.url ? `Prenotazioni iCal (${feed.events.length})` : 'Nessun calendario configurato'}
              </span>
            </summary>
            <div className="space-y-2 border-t border-border p-4">
              {feed.error ? (
                <p className="text-sm text-destructive">{feed.error}</p>
              ) : feed.url ? (
                <>
                  <p className="mb-3 truncate text-xs text-muted-foreground">{feed.url}</p>
                  {feed.events.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Nessuna prenotazione importata.</p>
                  ) : (
                    <div className="space-y-2">
                      {feed.events.map((event, index) => (
                        <div
                          key={`${event.start}:${event.end}:${index}`}
                          className={`rounded-lg border px-3 py-2 text-xs ${
                            isAirbnb
                              ? 'border-red-200 bg-red-50 text-red-800'
                              : 'border-[#003B95]/20 bg-[#003B95]/5 text-[#003B95]'
                          }`}
                        >
                          {event.summary} · {formatEU(event.start)} → {formatEU(event.end)} ({event.nights} {event.nights === 1 ? 'notte' : 'notti'})
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-muted-foreground">Nessun calendario configurato.</p>
              )}
            </div>
          </details>
        )
      })}
    </div>
  )
}
