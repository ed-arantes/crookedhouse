import { json, kvGet, kvSet, requireAdmin, type AdminEnv } from '../../_lib/admin'
import reviewsData from '../../../lib/reviews.json'
import type { ReviewSource } from '../../../lib/reviews'

type Review = {
  id: string
  name: string
  location: string
  text: string
  rating?: number
  source: ReviewSource
}

const REVIEWS_KEY = 'reviews'

function reviewsWithId(reviews: Review[]): Review[] {
  return reviews.map((r) => ({
    ...r,
    id: r.id || crypto.randomUUID(),
  }))
}

function seedReviews(): Review[] {
  return reviewsWithId(reviewsData.map((r) => ({
    ...r,
    id: crypto.randomUUID(),
    source: r.source as ReviewSource,
  })))
}

type PagesContext = {
  request: Request
  env: AdminEnv
  params?: Promise<{ id?: string }>
}

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  let reviews = await kvGet<Review[]>(env.KV, REVIEWS_KEY, [])
  if (reviews.length === 0) {
    reviews = seedReviews()
    await kvSet(env.KV, REVIEWS_KEY, reviews)
  }

  return json(reviews)
}

export const onRequestPost = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const body = await request.json().catch(() => null) as Omit<Review, 'id'> | null
  if (!body?.name || !body?.text || !body?.source) {
    return json({ error: 'Missing required fields' }, 400)
  }

  const reviews = await kvGet<Review[]>(env.KV, REVIEWS_KEY, [])
  const newReview: Review = {
    ...body,
    id: crypto.randomUUID(),
  }
  reviews.push(newReview)
  await kvSet(env.KV, REVIEWS_KEY, reviews)

  return json(newReview, 201)
}

export const onRequestPut = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const body = await request.json().catch(() => null) as Review | null
  if (!body?.id || !body?.name || !body?.text || !body?.source) {
    return json({ error: 'Missing required fields' }, 400)
  }

  const reviews = await kvGet<Review[]>(env.KV, REVIEWS_KEY, [])
  const idx = reviews.findIndex((r) => r.id === body.id)
  if (idx === -1) return json({ error: 'Review not found' }, 404)

  reviews[idx] = { ...body }
  await kvSet(env.KV, REVIEWS_KEY, reviews)

  return json(reviews[idx])
}

export const onRequestDelete = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return json({ error: 'Missing id' }, 400)

  const reviews = await kvGet<Review[]>(env.KV, REVIEWS_KEY, [])
  const filtered = reviews.filter((r) => r.id !== id)
  if (filtered.length === reviews.length) return json({ error: 'Review not found' }, 404)

  await kvSet(env.KV, REVIEWS_KEY, filtered)
  return json({ ok: true })
}

export const onRequestPatch = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const body = await request.json().catch(() => null) as { ids: string[] } | null
  if (!body?.ids?.length) return json({ error: 'Missing ids' }, 400)

  const reviews = await kvGet<Review[]>(env.KV, REVIEWS_KEY, [])
  const map = new Map(reviews.map((r) => [r.id, r]))
  const reordered = body.ids.map((id) => map.get(id)).filter(Boolean) as Review[]

  await kvSet(env.KV, REVIEWS_KEY, reordered)
  return json(reordered)
}
