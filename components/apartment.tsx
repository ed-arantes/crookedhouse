'use client'

import { t, type Locale } from '@/lib/i18n'
import { RichText } from '@/components/rich-text'
import { useSiteData } from '@/components/site-data-provider'
import { PhotoZoom } from '@/components/photo-zoom'

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
      <p className="type-body mt-4 text-pretty text-muted-foreground">
       <RichText text={t(locale, 'about.p3')} />
      </p>
    </div>

    <div className="grid grid-cols-2 gap-4">
     {photos.length >= 2 ? (
      photos.slice(0, 2).map((photo) => (
       <PhotoZoom
        key={photo.id}
        src={photo.url}
        alt={photo.alt}
        sizes="(max-width: 768px) 50vw, 25vw"
        locale={locale}
        className="aspect-[3/4]"
       />
      ))
     ) : (
      <>
       {[0, 1].map((index) => (
        <PhotoZoom
         key={index}
         src="/image.webp"
         alt=""
         sizes="(max-width: 768px) 50vw, 25vw"
         locale={locale}
         className="aspect-[3/4]"
        />
       ))}
      </>
     )}
    </div>
   </div>
  </section>
 )
}
