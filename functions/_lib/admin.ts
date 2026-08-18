export type AdminEnv = {
  KV: Record<string, unknown>
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
