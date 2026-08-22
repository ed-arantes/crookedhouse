export type AdminEnv = {
  DB: Record<string, unknown>
  IMAGES: Record<string, unknown>
  ADMIN_PASSWORD?: string
}

export type AdminContext = {
  request: Request
  env: AdminEnv
  params?: Record<string, string>
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

export function requireAdmin(env: AdminEnv, request: Request): Response | null {
  const password = env.ADMIN_PASSWORD
  if (!password) return json({ error: 'Admin not configured' }, 500)

  const auth = request.headers.get('Authorization')
  if (!auth || auth !== `Bearer ${password}`) {
    return json({ error: 'Unauthorized' }, 401)
  }
  return null
}

// ---------------------------------------------------------------------------
// D1 helpers
// ---------------------------------------------------------------------------

type TranslationValue = string | string[]

export async function d1GetTranslations(
  db: Record<string, unknown>,
  locale: string,
): Promise<Record<string, TranslationValue>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { results } = await (db as any)
    .prepare('SELECT key, value FROM translations WHERE locale = ?')
    .bind(locale)
    .all()

  const translations: Record<string, TranslationValue> = {}
  for (const row of results ?? []) {
    try {
      translations[row.key] = JSON.parse(row.value)
    } catch {
      translations[row.key] = row.value
    }
  }
  return translations
}

export async function d1UpsertTranslations(
  db: Record<string, unknown>,
  locale: string,
  entries: Record<string, TranslationValue>,
): Promise<void> {
  const stmts = Object.entries(entries).map(([key, value]) => {
    const stored = Array.isArray(value) ? JSON.stringify(value) : String(value)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (db as any)
      .prepare(
        'INSERT INTO translations (locale, key, value) VALUES (?, ?, ?) ' +
          'ON CONFLICT(locale, key) DO UPDATE SET value = excluded.value',
      )
      .bind(locale, key, stored)
  })

  if (stmts.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).batch(stmts)
  }
}

// ---------------------------------------------------------------------------
// Reviews (D1)
// ---------------------------------------------------------------------------

export type D1Review = {
  id: string
  name: string
  location: string
  text: string
  rating: number | null
  source: string
  sort_order: number
}

export async function d1ListReviews(db: Record<string, unknown>): Promise<D1Review[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { results } = await (db as any)
    .prepare('SELECT id, name, location, text, rating, source, sort_order FROM reviews ORDER BY sort_order ASC, rowid ASC')
    .all()
  return (results ?? []) as D1Review[]
}

export async function d1UpsertReview(
  db: Record<string, unknown>,
  review: { id: string; name: string; location: string; text: string; rating?: number; source: string; sort_order: number },
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any)
    .prepare(
      'INSERT INTO reviews (id, name, location, text, rating, source, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?) ' +
        'ON CONFLICT(id) DO UPDATE SET name=excluded.name, location=excluded.location, text=excluded.text, rating=excluded.rating, source=excluded.source, sort_order=excluded.sort_order',
    )
    .bind(review.id, review.name, review.location, review.text, review.rating ?? null, review.source, review.sort_order)
    .run()
}

export async function d1DeleteReview(db: Record<string, unknown>, id: string): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { meta } = await (db as any)
    .prepare('DELETE FROM reviews WHERE id = ?')
    .bind(id)
    .run()
  return meta.changes > 0
}

export async function d1ReorderReviews(db: Record<string, unknown>, orderedIds: string[]): Promise<void> {
  const stmts = orderedIds.map((id, i) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any)
      .prepare('UPDATE reviews SET sort_order = ? WHERE id = ?')
      .bind(i, id),
  )
  if (stmts.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).batch(stmts)
  }
}

// ---------------------------------------------------------------------------
// Blocked dates (D1)
// ---------------------------------------------------------------------------

export type D1BlockedDate = { date: string; reason?: string }

export async function d1ListBlockedDates(db: Record<string, unknown>): Promise<D1BlockedDate[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { results } = await (db as any)
    .prepare('SELECT date, reason FROM blocked_dates ORDER BY date ASC')
    .all()
  return (results ?? []) as D1BlockedDate[]
}

export async function d1AddBlockedDates(
  db: Record<string, unknown>,
  dates: { date: string; reason?: string }[],
): Promise<void> {
  const stmts = dates.map((d) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any)
      .prepare('INSERT OR IGNORE INTO blocked_dates (date, reason) VALUES (?, ?)')
      .bind(d.date, d.reason ?? null),
  )
  if (stmts.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).batch(stmts)
  }
}

export async function d1DeleteBlockedDate(db: Record<string, unknown>, date: string): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { meta } = await (db as any)
    .prepare('DELETE FROM blocked_dates WHERE date = ?')
    .bind(date)
    .run()
  return meta.changes > 0
}

// ---------------------------------------------------------------------------
// Settings (D1)
// ---------------------------------------------------------------------------

export async function d1GetSetting(db: Record<string, unknown>, key: string, fallback: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { results } = await (db as any)
    .prepare('SELECT value FROM settings WHERE key = ?')
    .bind(key)
    .all()
  return results?.[0]?.value ?? fallback
}

export async function d1SetSetting(db: Record<string, unknown>, key: string, value: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any)
    .prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .bind(key, value)
    .run()
}

// ---------------------------------------------------------------------------
// Images (D1 + R2)
// ---------------------------------------------------------------------------

export type D1Image = {
  id: string
  section: string
  url: string
  alt: string
  span: string
  sort_order: number
}

export async function d1ListImages(db: Record<string, unknown>): Promise<D1Image[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { results } = await (db as any)
    .prepare('SELECT id, section, url, alt, span, sort_order FROM images ORDER BY section, sort_order ASC')
    .all()
  return (results ?? []) as D1Image[]
}

export async function d1ListImagesBySection(db: Record<string, unknown>, section: string): Promise<D1Image[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { results } = await (db as any)
    .prepare('SELECT id, section, url, alt, span, sort_order FROM images WHERE section = ? ORDER BY sort_order ASC')
    .bind(section)
    .all()
  return (results ?? []) as D1Image[]
}

export async function d1InsertImage(
  db: Record<string, unknown>,
  image: { id: string; section: string; url: string; alt: string; span: string; sort_order: number },
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any)
    .prepare(
      'INSERT INTO images (id, section, url, alt, span, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .bind(image.id, image.section, image.url, image.alt, image.span, image.sort_order)
    .run()
}

export async function d1UpdateImage(
  db: Record<string, unknown>,
  id: string,
  fields: { alt?: string; span?: string; section?: string },
): Promise<void> {
  const sets: string[] = []
  const vals: unknown[] = []
  if (fields.alt !== undefined) { sets.push('alt = ?'); vals.push(fields.alt) }
  if (fields.span !== undefined) { sets.push('span = ?'); vals.push(fields.span) }
  if (fields.section !== undefined) { sets.push('section = ?'); vals.push(fields.section) }
  if (sets.length === 0) return
  vals.push(id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any)
    .prepare(`UPDATE images SET ${sets.join(', ')} WHERE id = ?`)
    .bind(...vals)
    .run()
}

export async function d1DeleteImage(db: Record<string, unknown>, id: string): Promise<D1Image | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { results } = await (db as any)
    .prepare('SELECT id, section, url FROM images WHERE id = ?')
    .bind(id)
    .all()
  const row = results?.[0] as D1Image | undefined
  if (!row) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any)
    .prepare('DELETE FROM images WHERE id = ?')
    .bind(id)
    .run()
  return row
}

export async function d1ReorderImages(db: Record<string, unknown>, section: string, orderedIds: string[]): Promise<void> {
  const stmts = orderedIds.map((id, i) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any)
      .prepare('UPDATE images SET sort_order = ? WHERE id = ?')
      .bind(i, id),
  )
  if (stmts.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).batch(stmts)
  }
}
