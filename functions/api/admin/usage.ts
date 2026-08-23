import { requireAdmin, type AdminEnv } from '../../_lib/admin'

type PagesContext = {
  request: Request
  env: AdminEnv & { CLOUDFLARE_API_TOKEN: string; CF_ACCOUNT_ID: string }
}

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const token = env.CLOUDFLARE_API_TOKEN
  const accountId = env.CF_ACCOUNT_ID
  const headers = { Authorization: `Bearer ${token}` }

  const result: Record<string, unknown> = {}

  // D1 usage via API
  if (token && accountId) {
    try {
      const dbId = 'a3b9127b-ee7a-450c-84a6-97c162453803'
      const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/usage`, { headers })
      const data = await res.json()
      if (data.success) {
        result.d1_api = data.result
      }
    } catch { /* */ }

    // R2 usage via API
    try {
      const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/crookedhouse-images/usage`, { headers })
      const data = await res.json()
      if (data.success) {
        result.r2_api = data.result
      }
    } catch { /* */ }

    // Workers analytics (last 24h)
    try {
      const now = new Date()
      const since = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/analytics?since=${since.toISOString()}&until=${now.toISOString()}&summarize=true`,
        { headers }
      )
      const data = await res.json()
      if (data.success) {
        result.workers_analytics = data.result
      }
    } catch { /* */ }
  }

  // D1 local stats
  try {
    const tables = ['translations', 'reviews', 'blocked_dates', 'settings', 'images', 'bookings', 'page_views', 'pricing_rules']
    const tableStats: Record<string, number> = {}
    let totalRows = 0

    for (const table of tables) {
      try {
        const { results } = await (env.DB as any)
          .prepare(`SELECT COUNT(*) as count FROM ${table}`)
          .all()
        const count = results?.[0]?.count ?? 0
        tableStats[table] = count
        totalRows += count
      } catch {
        tableStats[table] = 0
      }
    }

    result.d1_local = {
      tables: tableStats,
      totalRows,
    }
  } catch { /* */ }

  // R2 local stats
  try {
    const images = env.IMAGES as unknown as { list: (opts?: { limit?: number }) => Promise<{ objects: { size: number }[]; truncated: boolean }> }
    const listed = await images.list({ limit: 1000 })
    let totalSize = 0
    for (const obj of listed.objects) {
      totalSize += obj.size
    }

    result.r2_local = {
      objectCount: listed.objects.length,
      truncated: listed.truncated,
      totalSizeBytes: totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
    }
  } catch { /* */ }

  return json(result)
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  })
}
