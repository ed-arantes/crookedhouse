'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { t, type Locale } from '@/lib/i18n'
import type { ImageItem } from '@/lib/images'

export function PhotoLightbox({
 photos,
 locale,
 children,
}: {
 photos: ImageItem[]
 locale: Locale
 children: (openPhoto: (index: number) => void) => ReactNode
}) {
 const [active, setActive] = useState<number | null>(null)
 const close = useCallback(() => setActive(null), [])
 const prev = useCallback(
  () => setActive((index) => index === null ? index : (index + photos.length - 1) % photos.length),
  [photos.length],
 )
 const next = useCallback(
  () => setActive((index) => index === null ? index : (index + 1) % photos.length),
  [photos.length],
 )

 useEffect(() => {
  if (active === null) return

  function onKey(event: KeyboardEvent) {
   if (event.key === 'Escape') close()
   if (event.key === 'ArrowLeft') prev()
   if (event.key === 'ArrowRight') next()
  }

  document.addEventListener('keydown', onKey)
  return () => document.removeEventListener('keydown', onKey)
 }, [active, close, next, prev])

 return (
  <>
   {children(setActive)}
   {active !== null && photos[active] && (
    <div
     className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/90 p-4"
     role="dialog"
     aria-modal="true"
     onClick={close}
    >
     <button
      type="button"
      onClick={close}
      aria-label={t(locale, 'gallery.closePhoto')}
      className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/20"
     >
      <X className="h-6 w-6" />
     </button>
     <button
      type="button"
      onClick={(event) => {
       event.stopPropagation()
       prev()
      }}
      aria-label={t(locale, 'gallery.previousPhoto')}
      className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/20"
     >
      <ChevronLeft className="h-6 w-6" />
     </button>
     <div
      className="relative h-[70vh] w-full max-w-5xl"
      onClick={(event) => event.stopPropagation()}
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
      onClick={(event) => {
       event.stopPropagation()
       next()
      }}
      aria-label={t(locale, 'gallery.nextPhoto')}
      className="absolute right-4 flex h-11 w-11 items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/20"
     >
      <ChevronRight className="h-6 w-6" />
     </button>
    </div>
   )}
  </>
 )
}
