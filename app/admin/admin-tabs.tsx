'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  fetchBookings,
  updateBookingStatus,
  amendBooking,
  requestBookingPayment,
  deleteBooking,
  fetchAnalytics,
  fetchPricingData,
  createPricingRule,
  updatePricingRule,
  updateCouncilTax,
  updateBaseFare,
  deletePricingRule,
  fetchUsage,
  fetchAdminMessages,
  replyToGuest,
  type AdminBooking,
  type AdminMessage,
  type AnalyticsData,
  type PricingRule,
} from '@/lib/admin-api'
import { Plus, Pencil, Trash2, Save } from 'lucide-react'
import { formatEU } from '@/lib/format-date'

export function BookingsTab() {
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [lastAction, setLastAction] = useState<{ id: string; from: string; to: string } | null>(null)
  const [editingBooking, setEditingBooking] = useState<string | null>(null)
  const [editCheckIn, setEditCheckIn] = useState('')
  const [editCheckOut, setEditCheckOut] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [editResult, setEditResult] = useState<{ bookingId: string; due: number; credit: number } | null>(null)
  const [actionError, setActionError] = useState('')
  const [requestingPayment, setRequestingPayment] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try { setBookings(await fetchBookings(filter || undefined)) } catch { /* */ }
    setLoading(false)
  }, [filter])

  useEffect(() => { load() }, [load])

  async function handleStatusChange(id: string, newStatus: string) {
    const booking = bookings.find((b) => b.id === id)
    if (!booking) return
    const oldStatus = booking.status
    await updateBookingStatus(id, newStatus)
    setLastAction({ id, from: oldStatus, to: newStatus })
    load()
  }

  async function handleUndo() {
    if (!lastAction) return
    await updateBookingStatus(lastAction.id, lastAction.from)
    setLastAction(null)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Eliminare questa prenotazione?')) return
    await deleteBooking(id)
    load()
  }

  function startEditing(booking: AdminBooking) {
    setEditingBooking(booking.id)
    setEditCheckIn(booking.check_in)
    setEditCheckOut(booking.check_out)
    setEditResult(null)
    setActionError('')
  }

  async function saveAmendment(event: React.FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault()
    setSavingEdit(true)
    setActionError('')
    try {
      const result = await amendBooking(id, editCheckIn, editCheckOut)
      setEditResult({ bookingId: id, due: result.due_amount, credit: result.credit_amount })
      setEditingBooking(null)
      await load()
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Impossibile modificare la prenotazione.')
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleRequestPayment(id: string) {
    setRequestingPayment(id)
    setActionError('')
    try {
      await requestBookingPayment(id)
      await load()
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Impossibile registrare la richiesta di pagamento.')
    } finally {
      setRequestingPayment(null)
    }
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    paid: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  const statusLabels: Record<string, string> = {
    pending: 'In attesa',
    paid: 'Pagata',
    cancelled: 'Annullata',
  }

  if (loading) return <p className="text-sm text-muted-foreground">Caricamento...</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="">Tutte</option>
          <option value="pending">In attesa</option>
          <option value="paid">Pagate</option>
          <option value="cancelled">Annullate</option>
        </select>
        <span className="text-sm text-muted-foreground">{bookings.length} {bookings.length === 1 ? 'prenotazione' : 'prenotazioni'}</span>
      </div>
      {actionError && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{actionError}</p>}
      {editResult && (
        <p role="status" className="rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm">
          Modifica salvata.
          {editResult.due > 0 && ` Importo ancora da pagare: €${editResult.due}.`}
          {editResult.credit > 0 && ` Credito/rimborso da gestire: €${editResult.credit}.`}
        </p>
      )}

      {lastAction && (
        <div className="flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-sm">
          <span className="text-foreground">
            Stato aggiornato: <span className="font-medium">{statusLabels[lastAction.to] || lastAction.to}</span>
          </span>
          <button
            onClick={handleUndo}
            className="rounded-lg bg-accent px-3 py-1 text-xs font-medium text-accent-foreground hover:bg-accent/90"
          >
            Annulla
          </button>
          <button
            onClick={() => setLastAction(null)}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
          >
            Chiudi
          </button>
        </div>
      )}

      {bookings.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nessuna prenotazione trovata.</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span>{b.first_name} {b.last_name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[b.status] || ''}`}>
                      {statusLabels[b.status] || b.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{b.email}</p>
                  <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-5">
                    <span>Check-in: <span className="text-foreground">{formatEU(b.check_in)}</span></span>
                    <span>Check-out: <span className="text-foreground">{formatEU(b.check_out)}</span></span>
                    <span>Notti: <span className="text-foreground">{b.nights}</span></span>
                    <span>Ospiti: <span className="text-foreground">{b.adults} adult{b.adults !== 1 ? 'i' : 'o'}{b.children > 0 ? `, ${b.children} bambin${b.children !== 1 ? 'i' : 'o'}` : ''}{b.pets ? `, ${b.pets} animale${b.pets !== 1 ? 'i' : ''}` : ''}</span></span>
                    <span>Totale: <span className="text-foreground">&euro;{b.total_price}</span></span>
                  </div>
                  {b.paid_amount > 0 && (
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      <span className="text-muted-foreground">Incassato: <span className="text-foreground">€{b.paid_amount}</span></span>
                      {b.total_price > b.paid_amount && (
                        <span className="font-medium text-amber-700">Residuo: €{b.total_price - b.paid_amount}</span>
                      )}
                      {b.credit_amount > 0 && (
                        <span className="font-medium text-blue-700">Credito/rimborso: €{b.credit_amount}</span>
                      )}
                      {b.payment_requested_at && (
                        <span className="text-muted-foreground">Richiesta pagamento registrata (collegamento pagamento non attivo)</span>
                      )}
                    </div>
                  )}
                  {b.message && (
                    <p className="mt-2 text-xs text-muted-foreground italic">&ldquo;{b.message}&rdquo;</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-1">
                  {b.status !== 'pending' ? (
                    <button
                      type="button"
                      onClick={() => editingBooking === b.id ? setEditingBooking(null) : startEditing(b)}
                      className="rounded-lg border border-border px-2 py-1 text-xs font-medium hover:bg-muted"
                    >
                      {editingBooking === b.id ? 'Chiudi' : 'Modifica date'}
                    </button>
                  ) : (
                    <span className="self-center text-xs text-muted-foreground" title="The current checkout keeps its original dates and total.">
                      Modifica dopo la gestione del checkout
                    </span>
                  )}
                  {b.status === 'paid' && b.total_price > b.paid_amount && !b.payment_requested_at && (
                    <button
                      type="button"
                      onClick={() => handleRequestPayment(b.id)}
                      disabled={requestingPayment === b.id}
                      className="rounded-lg bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 disabled:opacity-60"
                    >
                      {requestingPayment === b.id ? 'Salvataggio...' : 'Richiedi pagamento residuo'}
                    </button>
                  )}
                  {b.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange(b.id, 'paid')}
                      className="rounded-lg bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                    >
                      Segna pagata
                    </button>
                  )}
                  {b.status !== 'cancelled' && (
                    <button
                      onClick={() => handleStatusChange(b.id, 'cancelled')}
                      className="rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                    >
                      Annulla
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="rounded-lg p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {editingBooking === b.id && (
                <form onSubmit={(event) => saveAmendment(event, b.id)} className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                  <label className="text-xs font-medium text-muted-foreground">
                    Check-in
                    <input required type="date" value={editCheckIn} onChange={(event) => setEditCheckIn(event.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
                  </label>
                  <label className="text-xs font-medium text-muted-foreground">
                    Check-out
                    <input required type="date" min={editCheckIn} value={editCheckOut} onChange={(event) => setEditCheckOut(event.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
                  </label>
                  <button disabled={savingEdit} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-60">
                    {savingEdit ? 'Salvataggio...' : 'Salva modifica'}
                  </button>
                  <p className="text-xs text-muted-foreground sm:col-span-3">
                    Notti e totale saranno ricalcolati con i prezzi attuali. Le date non disponibili o già occupate non possono essere selezionate. Le modifiche non aggiornano un checkout Stripe.
                  </p>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function MessagesTab() {
  const [messages, setMessages] = useState<AdminMessage[]>([])
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    let active = true
    fetchAdminMessages()
      .then((data) => {
        if (active) {
          setMessages(data)
          setError('')
        }
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Impossibile caricare i messaggi.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [refresh])

  async function sendReply(bookingId: string) {
    const message = drafts[bookingId]?.trim()
    if (!message) return
    setSending(bookingId)
    setError('')
    try {
      await replyToGuest(bookingId, message)
      setDrafts((current) => ({ ...current, [bookingId]: '' }))
      setLoading(true)
      setRefresh((value) => value + 1)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossibile inviare la risposta.')
    } finally {
      setSending(null)
    }
  }

  const conversations = Array.from(
    messages.reduce((groups, message) => {
      const group = groups.get(message.booking_id) ?? []
      group.push(message)
      groups.set(message.booking_id, group)
      return groups
    }, new Map<string, AdminMessage[]>()),
    ([bookingId, items]) => ({ bookingId, items }),
  )

  if (loading && messages.length === 0) return <p className="text-sm text-muted-foreground">Caricamento messaggi...</p>

  return (
    <div className="space-y-4">
      {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <div className="flex justify-end">
        <button onClick={() => { setLoading(true); setRefresh((value) => value + 1) }} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">
          Aggiorna
        </button>
      </div>
      {conversations.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nessun messaggio dagli ospiti.</p>
      ) : conversations.map(({ bookingId, items }) => {
        const latest = items[0]
        return (
          <section key={bookingId} className="space-y-3 rounded-xl border border-border bg-card p-4">
            <div>
              <p className="font-medium">{latest.guest_name} <span className="font-normal text-muted-foreground">({latest.guest_email})</span></p>
              <p className="text-sm text-muted-foreground">Soggiorno: {formatEU(latest.check_in)} – {formatEU(latest.check_out)}</p>
            </div>
            <div className="max-h-80 space-y-3 overflow-y-auto rounded-lg bg-background p-3">
              {items.slice().reverse().map((message) => (
                <article key={message.id} className={`rounded-lg p-3 text-sm ${message.sender === 'host' ? 'ml-6 bg-accent/10' : 'mr-6 bg-secondary'}`}>
                  <div className="mb-1 flex justify-between gap-3 text-xs text-muted-foreground">
                    <span>{message.sender === 'host' ? 'Host' : latest.guest_name}</span>
                    <time>{message.created_at}</time>
                  </div>
                  <p className="whitespace-pre-wrap break-words">{message.message}</p>
                </article>
              ))}
            </div>
            <form onSubmit={(event) => { event.preventDefault(); void sendReply(bookingId) }} className="flex flex-col gap-2 sm:flex-row">
              <textarea
                value={drafts[bookingId] ?? ''}
                maxLength={2000}
                onChange={(event) => setDrafts((current) => ({ ...current, [bookingId]: event.target.value }))}
                placeholder="Rispondi all'ospite..."
                rows={2}
                className="min-w-0 flex-1 resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <button disabled={sending === bookingId || !drafts[bookingId]?.trim()} className="self-end rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50">
                {sending === bookingId ? 'Invio...' : 'Rispondi'}
              </button>
            </form>
          </section>
        )
      })}
    </div>
  )
}

export function AnalyticsTab() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('30')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [usageData, setUsageData] = useState<Record<string, any> | null>(null)
  const [usageLoading, setUsageLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try { setData(await fetchAnalytics(range)) } catch { /* */ }
    setLoading(false)
  }, [range])

  const loadUsage = useCallback(async () => {
    setUsageLoading(true)
    try { setUsageData(await fetchUsage()) } catch { /* */ }
    setUsageLoading(false)
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { loadUsage() }, [loadUsage])

  if (loading) return <p className="text-sm text-muted-foreground">Caricamento...</p>
  if (!data) return <p className="text-sm text-muted-foreground">Nessun dato disponibile.</p>

  const maxViews = Math.max(...data.byDay.map((d) => d.count), 1)

  const d1 = usageData?.d1_api
  const r2 = usageData?.r2_api
  const local = usageData?.d1_local
  const r2Local = usageData?.r2_local

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="7">Ultimi 7 giorni</option>
          <option value="30">Ultimi 30 giorni</option>
          <option value="90">Ultimi 90 giorni</option>
          <option value="365">Ultimo anno</option>
        </select>
        <div className="flex gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Visite totali: </span>
            <span className="font-medium text-foreground">{data.total.total}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Visitatori unici: </span>
            <span className="font-medium text-foreground">{data.total.unique_visitors}</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-medium text-foreground">Visite giornaliere</h3>
        <div className="flex items-end gap-1" style={{ height: '120px' }}>
          {data.byDay.map((d) => (
            <div key={d.day} className="group relative flex-1" style={{ height: `${(d.count / maxViews) * 100}%` }}>
              <div className="h-full w-full rounded-t bg-accent/60 hover:bg-accent transition-colors" />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-0.5 text-[10px] text-background opacity-0 group-hover:opacity-100 transition-opacity">
                {formatEU(d.day)}: {d.count}
              </div>
            </div>
          ))}
        </div>
        {data.byDay.length > 0 && (
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>{formatEU(data.byDay[0]?.day || '')}</span>
            <span>{formatEU(data.byDay[data.byDay.length - 1]?.day || '')}</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium text-foreground">Pagine visitate</h3>
          {data.topPages.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nessun dato.</p>
          ) : (
            <div className="space-y-2">
              {data.topPages.map((p) => {
                const pct = (p.count / (data.total.total || 1)) * 100
                return (
                  <div key={p.path}>
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground">{p.path}</span>
                      <span className="text-muted-foreground">{p.count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-muted">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium text-foreground">Referrer</h3>
          {data.topReferrers.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nessun dato.</p>
          ) : (
            <div className="space-y-2">
              {data.topReferrers.map((r) => {
                const pct = (r.count / (data.total.total || 1)) * 100
                return (
                  <div key={r.referrer}>
                    <div className="flex justify-between text-xs">
                      <span className="truncate text-foreground">{r.referrer}</span>
                      <span className="shrink-0 pl-2 text-muted-foreground">{r.count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-muted">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {data.topCountries.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium text-foreground">Paesi</h3>
          <div className="flex flex-wrap gap-2">
            {data.topCountries.map((c) => (
              <span key={c.country} className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-foreground">
                {c.country}: {c.count}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-medium text-foreground">Utilizzo risorse Cloudflare</h3>
        {usageLoading ? (
          <p className="text-xs text-muted-foreground">Caricamento...</p>
        ) : usageData ? (
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 text-xs font-medium text-muted-foreground">D1 — crookedhouse-translations</h4>
              {d1 ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Storage</p>
                    <p className="text-lg font-medium text-foreground">{d1.storage?.current_bytes ? (d1.storage.current_bytes / (1024 * 1024)).toFixed(2) + ' MB' : 'N/A'}</p>
                    <p className="text-[10px] text-muted-foreground">limite gratuito: 5 GB</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Letture (24h)</p>
                    <p className="text-lg font-medium text-foreground">{d1.reads?.total ? d1.reads.total.toLocaleString() : 'N/A'}</p>
                    <p className="text-[10px] text-muted-foreground">limite gratuito: 100M/giorno</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Scritture (24h)</p>
                    <p className="text-lg font-medium text-foreground">{d1.writes?.total ? d1.writes.total.toLocaleString() : 'N/A'}</p>
                    <p className="text-[10px] text-muted-foreground">limite gratuito: 50M/giorno</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">API non disponibile</p>
              )}
              {local && (
                <div className="mt-3">
                  <p className="mb-2 text-[10px] font-medium text-muted-foreground">Righi per tabella</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {Object.entries(local.tables).map(([table, count]) => (
                      <div key={table} className="rounded-lg bg-muted/30 px-3 py-2 text-xs">
                        <span className="text-muted-foreground">{table}: </span>
                        <span className="font-medium text-foreground">{(count as number).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h4 className="mb-2 text-xs font-medium text-muted-foreground">R2 — crookedhouse-images</h4>
              <div className="grid gap-3 sm:grid-cols-3">
                {r2 ? (
                  <>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Storage</p>
                      <p className="text-lg font-medium text-foreground">{r2.storage?.current_bytes ? (r2.storage.current_bytes / (1024 * 1024)).toFixed(2) + ' MB' : 'N/A'}</p>
                      <p className="text-[10px] text-muted-foreground">limite gratuito: 10 GB</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Class A (mese)</p>
                      <p className="text-lg font-medium text-foreground">{r2.requests?.class_a_total ? r2.requests.class_a_total.toLocaleString() : 'N/A'}</p>
                      <p className="text-[10px] text-muted-foreground">limite gratuito: 1M/mese</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Class B (mese)</p>
                      <p className="text-lg font-medium text-foreground">{r2.requests?.class_b_total ? r2.requests.class_b_total.toLocaleString() : 'N/A'}</p>
                      <p className="text-[10px] text-muted-foreground">limite gratuito: 10M/mese</p>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground col-span-3">API non disponibile</p>
                )}
                {r2Local && (
                  <>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Oggetti locali</p>
                      <p className="text-lg font-medium text-foreground">{r2Local.objectCount.toLocaleString()}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Spazio locale</p>
                      <p className="text-lg font-medium text-foreground">{r2Local.totalSizeMB} MB</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Nessun dato disponibile.</p>
        )}
      </div>
    </div>
  )
}

export function PricingTab() {
  const [rules, setRules] = useState<PricingRule[]>([])
  const [councilTax, setCouncilTax] = useState('2')
  const [baseFare, setBaseFare] = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<PricingRule | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [taxSaving, setTaxSaving] = useState(false)
  const [taxStatus, setTaxStatus] = useState('')
  const [fareSaving, setFareSaving] = useState(false)
  const [fareStatus, setFareStatus] = useState('')
  const [loadError, setLoadError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchPricingData()
      setRules(data.rules)
      setCouncilTax(String(data.council_tax_per_person_per_night))
      setBaseFare(data.base_fare_per_night === null ? '' : String(data.base_fare_per_night))
      setLoadError('')
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Impossibile caricare i prezzi.')
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSave(rule: PricingRule) {
    setSaving(true)
    try {
      if (rules.find((r) => r.id === rule.id)) {
        await updatePricingRule(rule)
      } else {
        await createPricingRule(rule)
      }
      setEditing(null)
      setIsAdding(false)
      load()
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Impossibile salvare la condizione.')
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Eliminare questa regola?')) return
    await deletePricingRule(id)
    load()
  }

  async function handleSaveTax() {
    const value = Number(councilTax)
    if (!councilTax.trim() || !Number.isFinite(value) || value < 0) {
      setTaxStatus('Inserisci un importo valido (zero o superiore).')
      return
    }
    setTaxSaving(true)
    setTaxStatus('')
    try {
      await updateCouncilTax(value)
      setTaxStatus('Tassa salvata.')
    } catch {
      setTaxStatus('Errore nel salvataggio.')
    }
    setTaxSaving(false)
  }

  async function handleSaveFare() {
    const value = Number(baseFare)
    if (!baseFare.trim() || !Number.isFinite(value) || value < 0) {
      setFareStatus('Inserisci un importo valido (zero o superiore).')
      return
    }
    setFareSaving(true)
    setFareStatus('')
    try {
      await updateBaseFare(value)
      setFareStatus('Tariffa base salvata.')
    } catch (error) {
      setFareStatus(error instanceof Error ? error.message : 'Errore nel salvataggio.')
    } finally {
      setFareSaving(false)
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Caricamento...</p>

  return (
    <div className="space-y-6">
      {loadError && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{loadError}</p>}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-medium text-foreground">Tariffa base</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Prezzo per notte prima delle condizioni di prezzo e dello sconto per durata.
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">€</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={baseFare}
              onChange={(event) => setBaseFare(event.target.value)}
              className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={handleSaveFare}
            disabled={fareSaving}
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {fareSaving ? '...' : 'Salva'}
          </button>
          {fareStatus && <span role="status" className="text-xs text-muted-foreground">{fareStatus}</span>}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-medium text-foreground">Tassa di soggiorno</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Tassa per persona, bambini esclusi.
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">€</span>
            <input
              type="number"
              min="0"
              step="1"
              value={councilTax}
              onChange={(e) => setCouncilTax(e.target.value)}
              className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={handleSaveTax}
            disabled={taxSaving}
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {taxSaving ? '...' : 'Salva'}
          </button>
          {taxStatus && <span className="text-xs text-muted-foreground">{taxStatus}</span>}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{rules.length} {rules.length === 1 ? 'regola' : 'regole'} di prezzo</p>
        <button
          onClick={() => { setIsAdding(true); setEditing(null) }}
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90"
        >
          <Plus className="h-4 w-4" /> Aggiungi
        </button>
      </div>

      {(isAdding || editing) && (
        <PricingRuleForm
          rule={editing}
          onSave={handleSave}
          onCancel={() => { setEditing(null); setIsAdding(false) }}
          saving={saving}
        />
      )}

      {rules.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nessuna regola di prezzo. Aggiungine una per impostare prezzi personalizzati per periodi specifici.</p>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span>{rule.name || 'Regola senza nome'}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {rule.type === 'nights_discount'
                        ? 'Sconto durata'
                        : rule.type === 'annual_adjustment'
                          ? 'Variazione ricorrente annuale'
                          : 'Variazione date'}
                    </span>
                  </div>
                  {rule.type === 'date_adjustment' || rule.type === 'annual_adjustment' ? (
                    <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-4">
                      <span>Dal: <span className="text-foreground">{rule.type === 'annual_adjustment' ? formatMonthDay(rule.start_date) : formatEU(rule.start_date)}</span></span>
                      <span>Al: <span className="text-foreground">{rule.type === 'annual_adjustment' ? formatMonthDay(rule.end_date) : formatEU(rule.end_date)}</span></span>
                      <span>Variazione: <span className={`font-medium ${rule.adjustment_percent < 0 ? 'text-green-700' : 'text-foreground'}`}>{rule.adjustment_percent > 0 ? '+' : ''}{rule.adjustment_percent}%</span></span>
                      <span>Applicata insieme alle altre variazioni sulle stesse date</span>
                    </div>
                  ) : (
                    <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground">
                      <span>Min. notti: <span className="text-foreground">{rule.min_nights}</span></span>
                      <span>Sconto: <span className="text-foreground">{rule.discount_percent}%</span></span>
                    </div>
                  )}
                  {rule.priority > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">Priorità: {rule.priority}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => { setEditing(rule); setIsAdding(false) }}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatMonthDay(value: string): string {
  const [month, day] = value.split('-')
  return `${day}/${month}`
}

function toMonthDay(value: string): string {
  const match = /^(\d{2})\/(\d{2})$/.exec(value)
  return match ? `${match[2]}-${match[1]}` : ''
}

function isValidDayMonth(value: string): boolean {
  if (!/^\d{2}\/\d{2}$/.test(value)) return false
  const monthDay = toMonthDay(value)
  const date = new Date(`2000-${monthDay}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(5, 10) === monthDay
}

function PricingRuleForm({
  rule,
  onSave,
  onCancel,
  saving,
}: {
  rule: PricingRule | null
  onSave: (r: PricingRule) => void
  onCancel: () => void
  saving: boolean
}) {
  const initialType = rule?.type ?? 'date_adjustment'
  const [form, setForm] = useState({
    name: rule?.name ?? '',
    type: initialType as 'date_adjustment' | 'annual_adjustment' | 'nights_discount',
    start_date: rule?.type === 'annual_adjustment'
      ? formatMonthDay(rule.start_date)
      : rule?.start_date ?? new Date().toISOString().slice(0, 10),
    end_date: rule?.type === 'annual_adjustment'
      ? formatMonthDay(rule.end_date)
      : rule?.end_date ?? new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    adjustment_percent: rule ? String(rule.adjustment_percent) : '',
    min_nights: String(rule?.min_nights ?? 1),
    discount_percent: rule ? String(rule.discount_percent) : '',
    priority: rule?.priority ?? 0,
  })
  const [validationError, setValidationError] = useState('')

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSave() {
    const adjustmentPercent = Number(form.adjustment_percent)
    const minNights = Number(form.min_nights)
    const discountPercent = Number(form.discount_percent)
    if ((form.type === 'date_adjustment' || form.type === 'annual_adjustment') &&
      (!form.adjustment_percent.trim() || !Number.isFinite(adjustmentPercent) || adjustmentPercent < -100 || adjustmentPercent > 1000)) {
      setValidationError('Inserisci una variazione percentuale tra -100 e 1000.')
      return
    }
    if (form.type === 'annual_adjustment' &&
      ![form.start_date, form.end_date].every(isValidDayMonth)) {
      setValidationError('Inserisci date valide nel formato giorno/mese.')
      return
    }
    if (form.type === 'nights_discount' &&
      (!form.min_nights.trim() || !Number.isInteger(minNights) || minNights < 1 ||
        !form.discount_percent.trim() || !Number.isFinite(discountPercent) || discountPercent < 1 || discountPercent > 100)) {
      setValidationError('Inserisci almeno 1 notte e uno sconto tra 1% e 100%.')
      return
    }
    setValidationError('')
    onSave({
      id: rule?.id ?? '',
      ...form,
      start_date: form.type === 'annual_adjustment' ? toMonthDay(form.start_date) : form.start_date,
      end_date: form.type === 'annual_adjustment' ? toMonthDay(form.end_date) : form.end_date,
      adjustment_percent: form.type !== 'nights_discount' ? adjustmentPercent : 0,
      min_nights: minNights,
      discount_percent: form.type === 'nights_discount' ? discountPercent : 0,
    })
  }

  return (
    <div className="rounded-xl border border-accent/30 bg-card p-5 space-y-4">
      <h3 className="font-medium text-foreground">{rule ? 'Modifica regola' : 'Nuova regola'}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          placeholder="Nome (es. Alta stagione)"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <select
          value={form.type}
          onChange={(e) => {
            const type = e.target.value as 'date_adjustment' | 'annual_adjustment' | 'nights_discount'
            if (type === 'annual_adjustment' && form.type === 'date_adjustment') {
              update('start_date', formatMonthDay(form.start_date.slice(5)))
              update('end_date', formatMonthDay(form.end_date.slice(5)))
            } else if (type === 'date_adjustment' && form.type === 'annual_adjustment') {
              const year = new Date().getUTCFullYear()
              update('start_date', `${year}-${toMonthDay(form.start_date)}`)
              update('end_date', `${year}-${toMonthDay(form.end_date)}`)
            }
            update('type', type)
          }}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="date_adjustment">Aumento / diminuzione per date</option>
          <option value="annual_adjustment">Aumento / diminuzione ricorrente ogni anno</option>
          <option value="nights_discount">Sconto per notti</option>
        </select>
      </div>

      {form.type === 'date_adjustment' || form.type === 'annual_adjustment' ? (
        <>
          {form.type === 'annual_adjustment' && (
            <p className="text-xs text-muted-foreground">
              Questa variazione si ripete ogni anno. L’anno selezionato non viene considerato.
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Dal</label>
              <input
                type={form.type === 'annual_adjustment' ? 'text' : 'date'}
                inputMode={form.type === 'annual_adjustment' ? 'numeric' : undefined}
                placeholder={form.type === 'annual_adjustment' ? 'GG/MM' : undefined}
                value={form.start_date}
                onChange={(e) => update('start_date', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Al</label>
              <input
                type={form.type === 'annual_adjustment' ? 'text' : 'date'}
                inputMode={form.type === 'annual_adjustment' ? 'numeric' : undefined}
                placeholder={form.type === 'annual_adjustment' ? 'GG/MM' : undefined}
                value={form.end_date}
                onChange={(e) => update('end_date', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Aumento / diminuzione percentuale</label>
            <div className="relative">
              <input
                type="number"
                min="-100"
                max="1000"
                step="0.1"
                value={form.adjustment_percent}
                onChange={(e) => update('adjustment_percent', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-8 text-sm outline-none focus:border-primary"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Usa valori positivi per aumentare o negativi per diminuire. Le condizioni sovrapposte si sommano.</p>
          </div>
        </>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Notti minime</label>
            <input
              type="number"
              min="1"
              value={form.min_nights}
              onChange={(e) => update('min_nights', e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Sconto (%)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={form.discount_percent}
              onChange={(e) => update('discount_percent', e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <p className="text-xs text-muted-foreground sm:col-span-2">
            Se più condizioni sono valide, si applica a tutto il soggiorno lo sconto della condizione con il numero più alto di notti minime.
          </p>
        </div>
      )}

      {validationError && <p role="alert" className="text-sm text-destructive">{validationError}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> {saving ? 'Salvataggio...' : 'Salva'}
        </button>
        <button onClick={onCancel} className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted">
          Annulla
        </button>
      </div>
    </div>
  )
}
