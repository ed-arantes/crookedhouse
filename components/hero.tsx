import Image from 'next/image'
import { Star } from 'lucide-react'
import { REVIEWS, getReviewAverage } from '@/lib/reviews'
import { t, type Locale } from '@/lib/i18n'
import { SearchBar } from './booking/search-bar'

export function Hero({ locale = 'en' }: { locale?: Locale }) {
 return (
  <section id="top" className="relative min-h-[92vh] w-full overflow-hidden">
   <Image
    src="/images/hero-villa.webp"
    alt="Crooked House village apartment near Lake Como at golden hour with mountain backdrop"
    fill
    priority
    sizes="100vw"
    className="object-cover"
   />
   <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 via-foreground/20 to-foreground/60" />

   <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-5 md:px-8">
    <div className="mx-auto w-full max-w-4xl text-center">
     <span className="inline-flex items-center gap-2 rounded-full bg-background/15 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-background backdrop-blur">
      <Star className="h-3.5 w-3.5 fill-background text-background" />
      {t(locale, 'hero.badge', {
       score: getReviewAverage(REVIEWS).toFixed(1),
       count: REVIEWS.length,
      })}
     </span>
      <h1 className="type-display mt-5 whitespace-pre-line font-serif font-medium text-background">
      {t(locale, 'hero.title')}
     </h1>
     <p className="type-body mx-auto mt-4 max-w-none text-justify text-pretty text-background/90">
      {t(locale, 'hero.description')}
     </p>
    </div>

    <div className="mt-8 flex justify-center md:mt-10">
     <SearchBar locale={locale} />
    </div>
   </div>
  </section>
 )
}
