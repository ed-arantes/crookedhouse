export type AdminEnv = {
  KV: Record<string, unknown>
  DB: Record<string, unknown>
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

export async function kvGet<T>(kv: Record<string, unknown>, key: string, fallback: T): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await (kv as any).get(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export async function kvSet(kv: Record<string, unknown>, key: string, value: unknown): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (kv as any).put(key, JSON.stringify(value))
}

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
