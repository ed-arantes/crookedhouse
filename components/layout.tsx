'use client'

import Image from 'next/image'
import { t, type Locale } from '@/lib/i18n'
import { RichText } from '@/components/rich-text'
import { useSiteData } from '@/components/site-data-provider'
import { PhotoLightbox } from '@/components/photo-lightbox'

export function Layout({ locale = 'en' }: { locale?: Locale }) {
 const { images } = useSiteData()
 const photos = images.layout
 const leftColumnCount = Math.ceil(photos.length / 2)
 const leftPhotos = photos.slice(0, leftColumnCount)
 const rightPhotos = photos.slice(leftColumnCount)

 return (
  <section id="layout" className="bg-secondary/60 py-20 md:py-28">
   <div className="mx-auto max-w-7xl px-5 md:px-8">
    <div className="mb-8 flex flex-col gap-3 md:mb-10">
     <div>
      <h2 className="type-heading text-balance font-serif font-medium text-foreground">
        <RichText text={t(locale, 'gallery.headline')} />
       </h2>
     </div>
     <p className="type-body text-pretty text-muted-foreground">
      <RichText text={t(locale, 'gallery.body')} />
     </p>
    </div>

    <PhotoLightbox photos={photos} locale={locale}>
    {(openPhoto) => photos.length > 0 ? (
     <div className="grid gap-3 md:grid-cols-2 md:gap-4">
      {[leftPhotos, rightPhotos].map((columnPhotos, columnIndex) => (
       <div key={columnIndex} className="grid grid-cols-2 gap-3 md:gap-4">
        {columnPhotos.map((photo, photoIndex) => {
         const globalIndex = columnIndex === 0 ? photoIndex : leftColumnCount + photoIndex
         return (
          <button
           key={photo.id}
           type="button"
           onClick={() => openPhoto(globalIndex)}
           aria-label={t(locale, 'gallery.openPhoto', { index: globalIndex + 1 })}
           className="group relative aspect-[3/4] overflow-hidden rounded-2xl md:aspect-auto md:h-[220px]"
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
         )
        })}
       </div>
      ))}
     </div>
    ) : (
     <div className="grid gap-3 md:grid-cols-2 md:gap-4">
      {[0, 1].map((columnIndex) => (
       <div key={columnIndex} className="grid grid-cols-2 gap-3 md:gap-4">
        {[0, 1, 2, 3].map((photoIndex) => (
         <div key={`${columnIndex}-${photoIndex}`} className="relative aspect-[3/4] overflow-hidden rounded-2xl">
          <Image src="/images/image.webp" alt="" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
         </div>
        ))}
       </div>
      ))}
     </div>
    )}
    </PhotoLightbox>
   </div>
  </section>
 )
}
