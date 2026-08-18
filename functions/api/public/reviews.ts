import { json, kvGet, type AdminEnv } from '../../_lib/admin'
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

type PagesContext = { request: Request; env: AdminEnv }

export const onRequestGet = async ({ env }: PagesContext): Promise<Response> => {
  let reviews = await kvGet<Review[]>(env.KV, REVIEWS_KEY, [])
  if (reviews.length === 0) {
    reviews = reviewsData.map((r, i) => ({
      ...r,
      id: String(i),
      source: r.source as ReviewSource,
    }))
  }
  return json(reviews)
}
