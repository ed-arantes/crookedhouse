'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { t, type Locale } from '@/lib/i18n'

const PHOTOS = [
 { src: '/images/suite-bedroom.png', alt: 'Bedroom with gold iron bed and wood-beamed ceiling' },
 { src: '/images/lounge.png', alt: 'Living room with linen sofa and smart TV' },
 { src: '/images/bathroom.png', alt: 'Modern bathroom with glass walk-in shower' },
 { src: '/images/breakfast.png', alt: 'Fully equipped kitchen with welcome basket' },
 { src: '/images/terrace-pool.png', alt: 'Private garden terrace with mountain views' },
 { src: '/images/garden.png', alt: 'Terraced garden with mountain views' },
 { src: '/images/hero-villa.webp', alt: 'Crooked House nestled in the hills above Lake Como' },
 { src: '/images/village.png', alt: 'The historic village of Naggio among the mountains' },
]

export function StaySection({ locale = 'en' }: { locale?: Locale }) {
 const [active, setActive] = useState<number | null>(null)

 const close = useCallback(() => setActive(null), [])
 const prev = useCallback(
  () => setActive((i) => (i === null ? i : (i + PHOTOS.length - 1) % PHOTOS.length)),
  [],
 )
 const next = useCallback(
  () => setActive((i) => (i === null ? i : (i + 1) % PHOTOS.length)),
  [],
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
  <section id="stay" className="mx-auto max-w-7xl px-5 pb-20 pt-10 md:px-8 md:pb-28 md:pt-16">
   <div className="max-w-2xl">
    <h2 className="type-heading text-balance font-serif font-medium text-foreground">
     {t(locale, 'stay.headline')}
    </h2>
   </div>

   <div className="mt-8 grid auto-rows-[180px] grid-cols-2 gap-3 md:auto-rows-[220px] md:grid-cols-4 md:gap-4">
    {PHOTOS.map((photo, i) => (
     <button
      key={photo.src}
      type="button"
      onClick={() => setActive(i)}
      className="group relative overflow-hidden rounded-2xl"
     >
      <Image
       src={photo.src}
       alt={photo.alt}
       fill
       sizes="(max-width: 768px) 50vw, 25vw"
       className="object-cover"
      />
      <span className="absolute inset-0 bg-foreground/0 transition-colors group-hover:bg-foreground/10" />
     </button>
    ))}
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
       src={PHOTOS[active].src}
       alt={PHOTOS[active].alt}
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
