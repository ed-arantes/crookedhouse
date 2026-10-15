import { Star } from 'lucide-react'
import { getReviewAverage } from '@/lib/reviews'
import { useSiteData } from '@/components/site-data-provider'
import { t, type Locale } from '@/lib/i18n'
import { plural } from '@/lib/plural'
import { SearchBar } from './booking/search-bar'
import { RichText } from '@/components/rich-text'
import { PhotoZoom } from '@/components/photo-zoom'

export function Hero({ locale = 'en' }: { locale?: Locale }) {
 const { reviews, images } = useSiteData()
 const heroImg = images.hero?.[0]

 return (
  <section id="top" className="relative min-h-[92vh] w-full overflow-hidden">
   <PhotoZoom
    src={heroImg?.url ?? '/image.webp'}
    alt={heroImg?.alt || 'Crooked House village apartment near Lake Como'}
    priority
    sizes="100vw"
    locale={locale}
    className="absolute inset-0 z-0 rounded-none"
   />
   <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-foreground/50 via-foreground/20 to-foreground/60" />

   <div className="pointer-events-none relative z-10 mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-5 md:px-8 [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
    <div className="mx-auto w-full max-w-4xl text-center">
     {reviews.length > 0 && (
      <span className="inline-flex items-center gap-2 rounded-full bg-background/15 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-background backdrop-blur">
       <Star className="h-3.5 w-3.5 fill-background text-background" />
       {t(locale, 'hero.badge', {
        score: getReviewAverage(reviews).toFixed(1),
        count: reviews.length,
        countLabel: plural(locale, reviews.length, 'widgets.review', 'widgets.reviews'),
       })}
      </span>
     )}
      <h1 className="type-display mt-5 whitespace-pre-line font-serif font-medium text-background">
       <RichText text={t(locale, 'hero.title')} />
      </h1>
      <p className="type-body mx-auto mt-4 max-w-none text-center text-pretty text-background/90">
       <RichText text={t(locale, 'hero.description')} />
      </p>
    </div>

    <div className="mt-8 flex justify-center md:mt-10">
     <SearchBar locale={locale} />
    </div>
   </div>
  </section>
 )
}
