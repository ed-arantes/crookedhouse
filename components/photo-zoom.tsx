'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, ZoomIn } from 'lucide-react'
import { t, type Locale } from '@/lib/i18n'

export function PhotoZoom({
  src,
  alt,
  className,
  sizes,
  locale,
  priority = false,
}: {
  src: string
  alt: string
  className: string
  sizes: string
  locale: Locale
  priority?: boolean
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={alt ? `${t(locale, 'gallery.zoomPhoto')}: ${alt}` : t(locale, 'gallery.zoomPhoto')}
        className={`group block overflow-hidden rounded-2xl ${className}`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-foreground/0 text-background opacity-0 transition-all group-hover:bg-foreground/15 group-hover:opacity-100 group-focus-visible:bg-foreground/15 group-focus-visible:opacity-100">
          <ZoomIn className="h-8 w-8 drop-shadow" aria-hidden="true" />
        </span>
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt || t(locale, 'gallery.zoomPhoto')}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/90 p-4"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t(locale, 'gallery.closePhoto')}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/20"
          >
            <X className="h-6 w-6" />
          </button>
          <div
            className="relative h-[80vh] w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image src={src} alt={alt} fill sizes="100vw" className="object-contain" />
          </div>
        </div>
      )}
    </>
  )
}
