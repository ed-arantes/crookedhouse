import {
  json,
  requireAdmin,
  d1ListReviews,
  d1UpsertReview,
  d1DeleteReview,
  d1ReorderReviews,
  type AdminEnv,
} from '../../_lib/admin'
import type { ReviewSource } from '../../../lib/reviews'

type Review = {
  id: string
  name: string
  location: string
  text: string
  rating?: number
  source: ReviewSource
}

type PagesContext = {
  request: Request
  env: AdminEnv
  params?: Promise<{ id?: string }>
}

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const rows = await d1ListReviews(env.DB)
  const reviews: Review[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    location: r.location,
    text: r.text,
    rating: r.rating ?? undefined,
    source: r.source as ReviewSource,
  }))
  return json(reviews)
}

export const onRequestPost = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const body = await request.json().catch(() => null) as Omit<Review, 'id'> | null
  if (!body?.name || !body?.text || !body?.source) {
    return json({ error: 'Missing required fields' }, 400)
  }

  const existing = await d1ListReviews(env.DB)
  const newReview = {
    id: crypto.randomUUID(),
    name: body.name,
    location: body.location ?? '',
    text: body.text,
    rating: body.rating,
    source: body.source,
    sort_order: existing.length,
  }
  await d1UpsertReview(env.DB, newReview)

  return json({
    id: newReview.id,
    name: newReview.name,
    location: newReview.location,
    text: newReview.text,
    rating: newReview.rating,
    source: newReview.source,
  }, 201)
}

export const onRequestPut = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const body = await request.json().catch(() => null) as Review | null
  if (!body?.id || !body?.name || !body?.text || !body?.source) {
    return json({ error: 'Missing required fields' }, 400)
  }

  const existing = await d1ListReviews(env.DB)
  const row = existing.find((r) => r.id === body.id)
  const sort_order = row?.sort_order ?? 0

  await d1UpsertReview(env.DB, {
    id: body.id,
    name: body.name,
    location: body.location ?? '',
    text: body.text,
    rating: body.rating,
    source: body.source,
    sort_order,
  })

  return json(body)
}

export const onRequestDelete = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return json({ error: 'Missing id' }, 400)

  const deleted = await d1DeleteReview(env.DB, id)
  if (!deleted) return json({ error: 'Review not found' }, 404)

  return json({ ok: true })
}

export const onRequestPatch = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const body = await request.json().catch(() => null) as { ids: string[] } | null
  if (!body?.ids?.length) return json({ error: 'Missing ids' }, 400)

  await d1ReorderReviews(env.DB, body.ids)
  const reordered = await d1ListReviews(env.DB)
  return json(reordered.map((r) => ({
    id: r.id,
    name: r.name,
    location: r.location,
    text: r.text,
    rating: r.rating ?? undefined,
    source: r.source,
  })))
}
