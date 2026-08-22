'use client'

import Image from 'next/image'
import { t, type Locale } from '@/lib/i18n'
import { RichText } from '@/components/rich-text'
import { useSiteData } from '@/components/site-data-provider'

export function Services({ locale = 'en' }: { locale?: Locale }) {
 const { images } = useSiteData()
 const photos = images.services

 return (
  <section className="bg-accent py-20 text-accent-foreground md:py-28">
   <div className="mx-auto max-w-7xl px-5 md:px-8">
    <div className="grid gap-8 md:grid-cols-2 md:gap-16">
     <div className="order-2 grid auto-rows-[180px] grid-cols-1 gap-4 md:order-1 md:auto-rows-[220px]">
      {photos.length >= 2 ? (
       photos.slice(0, 2).map((photo) => (
        <div key={photo.id} className="relative overflow-hidden rounded-2xl">
         <Image
          src={photo.url}
          alt={photo.alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
         />
        </div>
       ))
      ) : (
       <>
        <div className="relative overflow-hidden rounded-2xl">
         <Image src="/image.webp" alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        </div>
        <div className="relative overflow-hidden rounded-2xl">
         <Image src="/image.webp" alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        </div>
       </>
      )}
     </div>

     <div className="order-1 flex flex-col md:order-2">
      <h2 className="type-heading text-balance font-serif font-medium">
       {t(locale, 'services.headline')}
      </h2>
      <p className="type-body mt-6 text-pretty">
       <RichText text={t(locale, 'services.body')} />
      </p>
     </div>
    </div>
   </div>
  </section>
 )
}
