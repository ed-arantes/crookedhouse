import Image from 'next/image'
import { t, type Locale } from '@/lib/i18n'
import { RichText } from '@/components/rich-text'

export function Apartment({ locale = 'en' }: { locale?: Locale }) {
  return (
    <section id="about" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <div className="grid gap-12 md:grid-cols-2 md:gap-16">
        <div className="flex flex-col">
          <h2 className="type-heading mt-4 text-balance font-serif font-medium text-foreground">
            {t(locale, 'about.headline')}
          </h2>
          <p className="type-body mt-6 text-pretty text-muted-foreground">
            {t(locale, 'about.p1')}
          </p>
          <p className="type-body mt-4 text-pretty text-muted-foreground">
            <RichText text={t(locale, 'about.p2')} />
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
