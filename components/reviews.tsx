'use client'

import { Star } from 'lucide-react'
import { t, type Locale } from '@/lib/i18n'
import { REVIEW_SOURCES, getReviewAverage } from '@/lib/reviews'
import { useSiteData } from '@/components/site-data-provider'
import { RichText } from '@/components/rich-text'

export function Reviews({ locale = 'en' }: { locale?: Locale }) {
  const { reviews } = useSiteData()
  return (
   <section id="reviews" className="bg-primary pb-20 pt-14 text-primary-foreground md:pb-28 md:pt-24">
    <div className="mx-auto max-w-7xl px-5 md:px-8">
     <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-xl">
       <h2 className="type-heading text-balance font-serif font-medium">
        <RichText text={t(locale, 'reviews.headline')} />
       </h2>
      </div>
      <div className="flex items-center gap-3">
       <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
         <Star
          key={i}
          className="h-5 w-5 fill-accent text-accent"
         />
        ))}
       </div>
       <span className="text-lg">
        <strong className="type-heading font-serif">
         {getReviewAverage(reviews).toFixed(1)}
        </strong>{' '}
        <span className="text-primary-foreground/70">
         {t(locale, 'reviews.count', {
          count: reviews.length,
         })}
        </span>
       </span>
      </div>
     </div>

     <div className="mt-12 -mx-5 overflow-x-auto px-5 sm:-mx-0 sm:px-0 scrollbar-accent">
      <div className="flex gap-5 min-w-max pb-3">
       {reviews.map((review, index) => {
        const source = REVIEW_SOURCES[review.source]

        return (
        <figure
         key={`${review.name}-${index}`}
         className="min-w-[20rem] w-[22rem] flex-shrink-0 flex-col rounded-2xl bg-primary-foreground/10 p-6 backdrop-blur-sm"
        >
        <div className="mb-4 flex gap-0.5">
         {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-accent text-accent" />
         ))}
        </div>
        <blockquote className="flex-1 text-pretty text-sm leading-relaxed text-primary-foreground/90">
         &ldquo;{review.text}&rdquo;
        </blockquote>
        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-primary-foreground/70">
         {review.source !== 'airbnb' && typeof review.rating === 'number' ? (
          <span>{review.rating.toFixed(1)}</span>
         ) : (
          <span className="text-xs uppercase tracking-[0.14em] text-primary-foreground/50">
           {source.label}
          </span>
         )}
         <span className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-foreground">
          <source.Icon className="h-4 w-4" />
          {source.label}
         </span>
        </div>
        <figcaption className="mt-5 flex items-center gap-3">
         <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-serif text-base text-accent-foreground">
          {review.name.charAt(0).toUpperCase()}
         </span>
         <span>
          <span className="block text-sm font-medium">
           {review.name}
          </span>
          <span className="block text-xs text-primary-foreground/60">
           {review.location}
          </span>
         </span>
        </figcaption>
        </figure>
       )
       })}
      </div>
     </div>
    </div>
   </section>
  )
}
