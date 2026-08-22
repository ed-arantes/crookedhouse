import { json, d1ListReviews, type AdminEnv } from '../../_lib/admin'
import type { ReviewSource } from '../../../lib/reviews'

type Review = {
  id: string
  name: string
  location: string
  text: string
  rating?: number
  source: ReviewSource
}

type PagesContext = { request: Request; env: AdminEnv }

export const onRequestGet = async ({ env }: PagesContext): Promise<Response> => {
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
