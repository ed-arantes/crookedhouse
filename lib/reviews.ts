import { BadgeCheck, Globe2, Hotel } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'
import reviewsData from './reviews.json'

export type ReviewSource = 'booking' | 'agoda' | 'airbnb'

export const REVIEW_SOURCES: Record<ReviewSource, {
 name: string
 Icon: ComponentType<SVGProps<SVGSVGElement>>
 label: string
}> = {
 booking: {
  name: 'Booking.com',
  Icon: Hotel,
  label: 'Booking',
 },
 agoda: {
  name: 'Agoda',
  Icon: Globe2,
  label: 'Agoda',
 },
 airbnb: {
  name: 'Airbnb',
  Icon: BadgeCheck,
  label: 'Airbnb',
 },
}

export type Review = {
 name: string
 location: string
 text: string
 rating?: number
 source: ReviewSource
}

export const REVIEWS: Review[] = reviewsData.map((review) => ({
 ...review,
 source: review.source as ReviewSource,
}))

export function getReviewAverage(reviews: Review[]) {
 const scoredReviews = reviews.filter((review) => review.source !== 'airbnb' && typeof review.rating === 'number')
 if (scoredReviews.length === 0) return 0
 return scoredReviews.reduce((sum, review) => sum + (review.rating ?? 0), 0) / scoredReviews.length
}
