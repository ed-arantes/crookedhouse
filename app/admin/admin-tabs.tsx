'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  fetchBookings,
  updateBookingStatus,
  deleteBooking,
  fetchAnalytics,
  type AdminBooking,
  type AnalyticsData,
} from '@/lib/admin-api'
import { Trash2 } from 'lucide-react'

export function BookingsTab() {
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try { setBookings(await fetchBookings(filter || undefined)) } catch { /* */ }
    setLoading(false)
  }, [filter])

  useEffect(() => { load() }, [load])

  async function handleStatusChange(id: string, status: string) {
    await updateBookingStatus(id, status)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Eliminare questa prenotazione?')) return
    await deleteBooking(id)
    load()
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
        <span className="text-sm text-muted-foreground">{bookings.length} prenotazioni</span>
      </div>

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
                  <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-4">
                    <span>Check-in: <span className="text-foreground">{b.check_in}</span></span>
                    <span>Check-out: <span className="text-foreground">{b.check_out}</span></span>
                    <span>Ospiti: <span className="text-foreground">{b.adults + b.children}{b.pets ? ` + ${b.pets} animali` : ''}</span></span>
                    <span>Totale: <span className="text-foreground">&euro;{b.total_price}</span></span>
                  </div>
                  {b.message && (
                    <p className="mt-2 text-xs text-muted-foreground italic">&ldquo;{b.message}&rdquo;</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function AnalyticsTab() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('30')

  const load = useCallback(async () => {
    setLoading(true)
    try { setData(await fetchAnalytics(range)) } catch { /* */ }
    setLoading(false)
  }, [range])

  useEffect(() => { load() }, [load])

  if (loading) return <p className="text-sm text-muted-foreground">Caricamento...</p>
  if (!data) return <p className="text-sm text-muted-foreground">Nessun dato disponibile.</p>

  const maxViews = Math.max(...data.byDay.map((d) => d.count), 1)

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
                {d.day}: {d.count}
              </div>
            </div>
          ))}
        </div>
        {data.byDay.length > 0 && (
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>{data.byDay[0]?.day}</span>
            <span>{data.byDay[data.byDay.length - 1]?.day}</span>
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
    </div>
  )
}
