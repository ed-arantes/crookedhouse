'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  fetchBookings,
  updateBookingStatus,
  deleteBooking,
  fetchAnalytics,
  fetchPricingData,
  createPricingRule,
  updatePricingRule,
  updateCouncilTax,
  deletePricingRule,
  fetchUsage,
  type AdminBooking,
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
  const [councilTax, setCouncilTax] = useState(2)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<PricingRule | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [taxSaving, setTaxSaving] = useState(false)
  const [taxStatus, setTaxStatus] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchPricingData()
      setRules(data.rules)
      setCouncilTax(data.council_tax_per_person_per_night)
    } catch { /* */ }
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
    } catch { /* */ }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Eliminare questa regola?')) return
    await deletePricingRule(id)
    load()
  }

  async function handleSaveTax() {
    setTaxSaving(true)
    setTaxStatus('')
    try {
      await updateCouncilTax(councilTax)
      setTaxStatus('Tassa salvata.')
    } catch {
      setTaxStatus('Errore nel salvataggio.')
    }
    setTaxSaving(false)
  }

  function formatPrice(cents: number): string {
    return `€${(cents / 100).toFixed(0)}`
  }

  if (loading) return <p className="text-sm text-muted-foreground">Caricamento...</p>

  return (
    <div className="space-y-6">
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
              onChange={(e) => setCouncilTax(Number(e.target.value))}
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
                      {rule.type === 'nights_discount' ? 'Sconto' : 'Prezzo'}
                    </span>
                  </div>
                  {rule.type === 'date_range' ? (
                    <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-4">
                      <span>Dal: <span className="text-foreground">{formatEU(rule.start_date)}</span></span>
                      <span>Al: <span className="text-foreground">{formatEU(rule.end_date)}</span></span>
                      <span>Prezzo: <span className="text-foreground">{formatPrice(rule.price_per_night)}/notte</span></span>
                      <span>Min. notti: <span className="text-foreground">{rule.min_nights}</span></span>
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
  const [form, setForm] = useState({
    name: rule?.name ?? '',
    type: rule?.type ?? 'date_range' as 'date_range' | 'nights_discount',
    start_date: rule?.start_date ?? new Date().toISOString().slice(0, 10),
    end_date: rule?.end_date ?? new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    price_per_night: rule?.price_per_night ? rule.price_per_night / 100 : 95,
    min_nights: rule?.min_nights ?? 1,
    discount_percent: rule?.discount_percent ?? 10,
    priority: rule?.priority ?? 0,
  })

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSave() {
    onSave({
      id: rule?.id ?? '',
      ...form,
      price_per_night: form.price_per_night * 100,
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
          onChange={(e) => update('type', e.target.value as 'date_range' | 'nights_discount')}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="date_range">Prezzo per date</option>
          <option value="nights_discount">Sconto per notti</option>
        </select>
      </div>

      {form.type === 'date_range' ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Dal</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => update('start_date', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Al</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => update('end_date', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Prezzo a notte (€)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.price_per_night}
                onChange={(e) => update('price_per_night', Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Notti minime</label>
              <input
                type="number"
                min="1"
                value={form.min_nights}
                onChange={(e) => update('min_nights', Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
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
              onChange={(e) => update('min_nights', Number(e.target.value))}
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
              onChange={(e) => update('discount_percent', Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
      )}

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
