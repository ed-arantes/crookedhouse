'use client'

import Image from 'next/image'
import { t, type Locale } from '@/lib/i18n'
import { RichText } from '@/components/rich-text'
import { useSiteData } from '@/components/site-data-provider'

export function Explore({ locale = 'en' }: { locale?: Locale }) {
 const { images } = useSiteData()
 const photos = images.explore

 return (
  <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
   <div className="grid gap-12 md:grid-cols-2 md:gap-16">
    <div className="order-2 grid auto-rows-[180px] grid-cols-2 gap-3 md:order-1 md:auto-rows-[220px] md:gap-4">
     {photos.length > 0 ? (
      photos.map((photo) => (
       <div key={photo.id} className="relative overflow-hidden rounded-2xl">
        <Image
         src={photo.url}
         alt={photo.alt}
         fill
         sizes="(max-width: 768px) 50vw, 25vw"
         className="object-cover"
        />
       </div>
      ))
     ) : (
      [0, 1, 2, 3].map((i) => (
       <div key={i} className="relative overflow-hidden rounded-2xl">
        <Image src="/image.webp" alt="" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
       </div>
      ))
     )}
    </div>

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
