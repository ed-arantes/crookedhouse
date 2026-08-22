'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { t, type Locale } from '@/lib/i18n'
import { RichText } from '@/components/rich-text'
import { useSiteData } from '@/components/site-data-provider'

export function Layout({ locale = 'en' }: { locale?: Locale }) {
 const { images } = useSiteData()
 const photos = images.layout
 const [active, setActive] = useState<number | null>(null)

 const close = useCallback(() => setActive(null), [])
 const prev = useCallback(
  () => setActive((i) => (i === null ? i : (i + photos.length - 1) % photos.length)),
  [photos.length],
 )
 const next = useCallback(
  () => setActive((i) => (i === null ? i : (i + 1) % photos.length)),
  [photos.length],
 )

 useEffect(() => {
  if (active === null) return
  function onKey(e: KeyboardEvent) {
   if (e.key === 'Escape') close()
   if (e.key === 'ArrowLeft') prev()
   if (e.key === 'ArrowRight') next()
  }
  document.addEventListener('keydown', onKey)
  return () => document.removeEventListener('keydown', onKey)
 }, [active, close, prev, next])

 return (
  <section id="gallery" className="bg-secondary/60 py-20 md:py-28">
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

    {photos.length > 0 ? (
     <div className="grid auto-rows-[180px] grid-cols-2 gap-3 md:auto-rows-[220px] md:grid-cols-4 md:gap-4">
      {photos.map((photo, i) => (
       <button
        key={photo.id}
        type="button"
        onClick={() => setActive(i)}
        className={cn(
         'group relative overflow-hidden rounded-2xl',
         i === 0 ? 'md:col-span-2 md:row-span-2' : '',
         photo.span,
        )}
       >
        <Image
         src={photo.url}
         alt={photo.alt}
         fill
         sizes={i === 0 ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
         className="object-cover"
        />
        <span className="absolute inset-0 bg-foreground/0 transition-colors group-hover:bg-foreground/10" />
       </button>
      ))}
     </div>
    ) : (
     <div className="grid auto-rows-[180px] grid-cols-2 gap-3 md:auto-rows-[220px] md:grid-cols-4 md:gap-4">
      <div className="relative overflow-hidden rounded-2xl md:col-span-2 md:row-span-2">
       <Image src="/image.webp" alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
      </div>
      {[0, 1, 2, 3].map((i) => (
       <div key={i} className="relative overflow-hidden rounded-2xl">
        <Image src="/image.webp" alt="" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
       </div>
      ))}
     </div>
    )}
   </div>

   {active !== null && (
    <div
     className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/90 p-4"
     role="dialog"
     aria-modal="true"
     onClick={close}
    >
     <button
      type="button"
      onClick={close}
      aria-label="Close gallery"
      className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/20"
     >
      <X className="h-6 w-6" />
     </button>
     <button
      type="button"
      onClick={(e) => {
       e.stopPropagation()
       prev()
      }}
      aria-label="Previous photo"
      className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/20"
     >
      <ChevronLeft className="h-6 w-6" />
     </button>
     <div
      className="relative h-[70vh] w-full max-w-5xl"
      onClick={(e) => e.stopPropagation()}
     >
      <Image
       src={photos[active].url}
       alt={photos[active].alt}
       fill
       sizes="100vw"
       className="rounded-2xl object-contain"
      />
     </div>
     <button
      type="button"
      onClick={(e) => {
       e.stopPropagation()
       next()
      }}
      aria-label="Next photo"
      className="absolute right-4 flex h-11 w-11 items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/20"
     >
      <ChevronRight className="h-6 w-6" />
     </button>
    </div>
   )}
  </section>
 )
}
