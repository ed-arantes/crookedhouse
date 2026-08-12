import Image from 'next/image'
import { t, type Locale } from '@/lib/i18n'
import { REVIEWS, getReviewAverage } from '@/lib/reviews'

export function About({ locale = 'en' }: { locale?: Locale }) {
  const STATS = [
    { value: getReviewAverage(REVIEWS).toFixed(1), label: t(locale, 'about.stats.rating') },
    { value: String(REVIEWS.length), label: t(locale, 'about.stats.guests') },
    { value: '', label: t(locale, 'about.stats.pets') },
  ]

  return (
    <section id="about" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <h2 className="type-heading mt-4 text-center font-serif font-medium text-foreground">
        {t(locale, 'about.headline')}
      </h2>
      <div className="mt-10 grid gap-12 md:grid-cols-2 md:gap-16">
        <div className="flex flex-col justify-center">
          <p className="type-body text-pretty text-muted-foreground">
            {t(locale, 'about.p1')}
          </p>
          <p className="type-body mt-4 text-pretty text-muted-foreground">
            {t(locale, 'about.p2')}
          </p>

          <dl className="mt-10 flex flex-wrap items-center justify-start gap-6 border-t border-border pt-8 text-sm text-muted-foreground">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                {stat.value ? <span>{stat.value}</span> : null}
                <span>{stat.label}</span>
              </div>
            ))}
          </dl>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-10">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
            <Image
              src="/images/lounge.png"
              alt="Cosy living room with linen sofa and wood-beamed ceiling"
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
            <Image
              src="/images/garden.png"
              alt="Terraced lakeside garden with stone pathway and lavender"
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
