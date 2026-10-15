'use client'

import Image from 'next/image'
import { t, type Locale } from '@/lib/i18n'
import { RichText } from '@/components/rich-text'
import { useSiteData } from '@/components/site-data-provider'
import { PhotoLightbox } from '@/components/photo-lightbox'

export function Explore({ locale = 'en' }: { locale?: Locale }) {
 const { images } = useSiteData()
 const photos = images.explore

 return (
  <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
   <div className="grid gap-12 md:grid-cols-2 md:gap-16">
    <PhotoLightbox photos={photos} locale={locale}>
    {(openPhoto) => <div className="order-2 grid auto-rows-[180px] grid-cols-2 gap-3 md:order-1 md:auto-rows-[220px] md:gap-4">
     {photos.length > 0 ? (
      photos.map((photo, index) => (
       <button
        key={photo.id}
        type="button"
        onClick={() => openPhoto(index)}
        aria-label={t(locale, 'gallery.openPhoto', { index: index + 1 })}
        className="group relative overflow-hidden rounded-2xl"
       >
        <Image
         src={photo.url}
         alt={photo.alt}
         fill
         sizes="(max-width: 768px) 50vw, 25vw"
         className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-foreground/0 transition-colors group-hover:bg-foreground/10" />
       </button>
      ))
     ) : (
      [0, 1, 2, 3].map((i) => (
       <div key={i} className="relative overflow-hidden rounded-2xl">
        <Image src="/image.webp" alt="" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
       </div>
      ))
     )}
    </div>}
    </PhotoLightbox>

    <div className="order-1 flex flex-col md:order-2">
     <h2 className="type-heading mt-4 text-balance font-serif font-medium text-foreground">
      {t(locale, 'explore.headline')}
     </h2>
     <p className="type-body mt-6 text-pretty text-muted-foreground">
      <RichText text={t(locale, 'explore.body')} />
     </p>
    </div>
   </div>
  </section>
 )
}
