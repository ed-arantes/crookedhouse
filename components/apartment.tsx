'use client'

import Image from 'next/image'
import { t, type Locale } from '@/lib/i18n'
import { RichText } from '@/components/rich-text'
import { useSiteData } from '@/components/site-data-provider'

export function Apartment({ locale = 'en' }: { locale?: Locale }) {
 const { images } = useSiteData()
 const photos = images.apartment

 return (
  <section id="about" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
   <div className="grid gap-12 md:grid-cols-2 md:gap-16">
    <div className="flex flex-col">
      <h2 className="type-heading mt-4 text-balance font-serif font-medium text-foreground">
       <RichText text={t(locale, 'about.headline')} />
      </h2>
      <p className="type-body mt-6 text-pretty text-muted-foreground">
       <RichText text={t(locale, 'about.p1')} />
      </p>
     <p className="type-body mt-4 text-pretty text-muted-foreground">
      <RichText text={t(locale, 'about.p2')} />
     </p>
    </div>

    <div className="grid grid-cols-2 gap-4">
     {photos.length >= 2 ? (
      photos.slice(0, 2).map((photo) => (
       <div key={photo.id} className="relative aspect-[3/4] overflow-hidden rounded-2xl">
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
      <>
       <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
        <Image src="/image.webp" alt="" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
       </div>
       <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
        <Image src="/image.webp" alt="" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
       </div>
      </>
     )}
    </div>
   </div>
  </section>
 )
}
