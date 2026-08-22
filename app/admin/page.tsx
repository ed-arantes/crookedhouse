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
  fetchIcalUrl,
  saveIcalUrl,
  fetchAllImages,
  uploadImage,
  updateImage,
  deleteImage,
  reorderImages,
  fetchR2BaseUrl,
  saveR2BaseUrl,
  type Review,
  type BlockedDate,
  type AdminImage,
} from '@/lib/admin-api'
import { LogOut, Plus, Pencil, Trash2, Save, Calendar, Star, MessageSquareQuote, FileText, Link, Bold, GripVertical, Image as ImageIcon, Upload } from 'lucide-react'
import { RichText } from '@/components/rich-text'
import { ARRAY_CONTENT_KEYS, CONTENT_SECTIONS } from '@/lib/content-schema'
import { usesRemoteApi } from '@/lib/api-url'
import { IMAGE_SECTIONS } from '@/lib/images'

type Tab = 'reviews' | 'blocked' | 'content' | 'ical' | 'images'

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
    const ok = await adminLogin(passwordInput)
    if (ok) {
      setAuthenticated(true)
      setPasswordInput('')
    } else {
      setLoginError('Password errata')
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
            Admin
          </h1>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Password"
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
            Pannello Admin
          </h1>
          {usesRemoteApi && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              Online / Produzione
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
            ['ical', <Link key="i" className="h-4 w-4" />, 'iCal'],
            ['reviews', <MessageSquareQuote key="r" className="h-4 w-4" />, 'Recensioni'],
            ['content', <FileText key="c" className="h-4 w-4" />, 'Contenuti'],
            ['images', <ImageIcon key="m" className="h-4 w-4" />, 'Immagini'],
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
      </div>
    </div>
  )
}

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero',
  gallery: 'Galleria',
  apartment: 'Appartamento',
  layout: 'Layout',
  services: 'Servizi',
  location: 'Posizione',
  explore: 'Esplora',
}

const SPAN_OPTIONS = [
  { value: '', label: 'Normale' },
  { value: 'md:col-span-2 md:row-span-2', label: '2 colonne x 2 righe' },
  { value: 'md:col-span-2', label: '2 colonne' },
  { value: 'col-span-2 md:col-span-1', label: '2 colonne (mobile)' },
]

function ImagesTab() {
  const [images, setImages] = useState<AdminImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragIdx, setDragIdx] = useState<{ section: string; index: number } | null>(null)
  const [overIdx, setOverIdx] = useState<{ section: string; index: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingSection, setPendingSection] = useState('gallery')
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
          Inserisci il tuo dominio custom R2 (es. <code>https://img.tuodominio.it</code>) oppure il URL R2.dev pubblico (es. <code>https://pub-xxxxx.r2.dev</code>).
        </p>
        <div className="flex gap-2">
          <input
            type="url"
            value={r2BaseUrl}
            onChange={(e) => setR2BaseUrl(e.target.value)}
            placeholder="https://img.tuodominio.it"
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
                placeholder="Alt text"
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
                      <button onClick={() => handleSaveAlt(img)} className="text-[10px] text-accent">OK</button>
                    </div>
                  ) : (
                    <p
                      className="truncate text-[10px] text-muted-foreground cursor-pointer hover:text-foreground"
                      onClick={() => { setEditingAlt(img.id); setAltValue(img.alt) }}
                      title="Click to edit alt text"
                    >
                      {img.alt || '(no alt)'}
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
        <p className="text-sm text-muted-foreground">{reviews.length} recensioni</p>
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
                  <span className="text-xs text-muted-foreground">({review.source})</span>
                  {typeof review.rating === 'number' && (
                    <span className="flex items-center gap-0.5 text-xs text-accent">
                      <Star className="h-3 w-3 fill-current" /> {review.rating}
                    </span>
                  )}
                </div>
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

function BlockedDatesTab() {
  const [blocked, setBlocked] = useState<BlockedDate[]>([])
  const [loading, setLoading] = useState(true)
  const [reason, setReason] = useState('')
  const today = new Date()
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())

  const load = useCallback(async () => {
    setLoading(true)
    try { setBlocked(await fetchBlockedDates()) } catch { /* */ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const blockedSet = new Set(blocked.map((d) => d.date))

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

        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'].map((d) => (
            <div key={d} className="py-1 font-medium">{d}</div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            if (day === null) return <div key={`e${i}`} />
            const dateStr = formatDate(viewYear, viewMonth, day)
            const isBlocked = blockedSet.has(dateStr)
            const isPast = new Date(dateStr) < new Date(today.toISOString().slice(0, 10))
            return (
              <button
                key={dateStr}
                onClick={() => !isPast && toggleDate(dateStr)}
                disabled={isPast}
                className={`aspect-square rounded-lg text-sm transition-colors ${
                  isPast
                    ? 'text-muted-foreground/30 cursor-not-allowed'
                    : isBlocked
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'hover:bg-muted text-foreground'
                }`}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>

      {blocked.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Date bloccate ({blocked.length})</p>
          <div className="flex flex-wrap gap-2">
            {blocked.sort((a, b) => a.date.localeCompare(b.date)).map((d) => (
              <span key={d.date} className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs text-red-600">
                {d.date}
                {d.reason && <span className="text-red-400">· {d.reason}</span>}
                <button onClick={() => removeBlockedDate(d.date).then(load)} className="ml-0.5 hover:text-red-800">&times;</button>
              </span>
            ))}
          </div>
        </div>
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
  const activeLocale = 'it'
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [status, setStatus] = useState('')
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['Hero']))

  useEffect(() => {
    fetchAllContent().then((c) => { setContent(c); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const current: Record<string, string | string[]> = content[activeLocale] ?? {}

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
      setContent(await fetchAllContent())
      setDirty(false)
      setStatus('Contenuti salvati in D1.')
    } catch {
      setStatus('Salvataggio non riuscito. Riprova.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Caricamento...</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground">Italiano</span>
        <div className="flex-1" />
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> {saving ? 'Salvataggio...' : 'Salva'}
        </button>
      </div>
      {status && <p className="text-sm text-muted-foreground" role="status">{status}</p>}

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
                  {section.label}
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
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function IcalTab() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchIcalUrl().then((data) => { setUrl(data.url); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    await saveIcalUrl(url)
    setSaving(false)
  }

  if (loading) return <p className="text-sm text-muted-foreground">Caricamento...</p>

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Inserisci l&apos;URL del calendario iCal dalla tua piattaforma (Airbnb, Booking.com, etc.) per visualizzare le prenotazioni esistenti.
      </p>
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://ical.booking.com/ical/..."
          className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> {saving ? 'Salvataggio...' : 'Salva'}
        </button>
      </div>
      {url && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">URL attuale:</p>
          <a href={url} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate text-sm text-accent underline">
            {url}
          </a>
        </div>
      )}
    </div>
  )
}
