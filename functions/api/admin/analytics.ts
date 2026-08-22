import {
  json,
  requireAdmin,
  type AdminEnv,
} from '../../_lib/admin'

type PagesContext = {
  request: Request
  env: AdminEnv
}

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const url = new URL(request.url)
  const range = url.searchParams.get('range') || '30'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = env.DB as any

  const { results: byDay } = await db.prepare(`
    SELECT date(timestamp) as day, COUNT(*) as count
    FROM page_views
    WHERE timestamp >= datetime('now', '-' || ? || ' days')
    GROUP BY day
    ORDER BY day ASC
  `).bind(range).all()

  const { results: topPages } = await db.prepare(`
    SELECT path, COUNT(*) as count
    FROM page_views
    WHERE timestamp >= datetime('now', '-' || ? || ' days')
    GROUP BY path
    ORDER BY count DESC
    LIMIT 10
  `).bind(range).all()

  const { results: topReferrers } = await db.prepare(`
    SELECT COALESCE(referrer, 'Direct') as referrer, COUNT(*) as count
    FROM page_views
    WHERE timestamp >= datetime('now', '-' || ? || ' days')
    GROUP BY referrer
    ORDER BY count DESC
    LIMIT 10
  `).bind(range).all()

  const { results: topCountries } = await db.prepare(`
    SELECT COALESCE(country, 'Unknown') as country, COUNT(*) as count
    FROM page_views
    WHERE timestamp >= datetime('now', '-' || ? || ' days')
    GROUP BY country
    ORDER BY count DESC
    LIMIT 10
  `).bind(range).all()

  const { results: totalRows } = await db.prepare(`
    SELECT COUNT(*) as total, COUNT(DISTINCT ip_hash) as unique_visitors
    FROM page_views
    WHERE timestamp >= datetime('now', '-' || ? || ' days')
  `).bind(range).all()

  return json({
    byDay,
    topPages,
    topReferrers,
    topCountries,
    total: totalRows[0] || { total: 0, unique_visitors: 0 },
  })
}
