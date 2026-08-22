'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { setContentOverrides, type Locale } from '@/lib/i18n'
import { useContentVersion } from '@/hooks/use-content-version'
import type { Review } from '@/lib/reviews'
import type { ImageItem, ImageSection } from '@/lib/images'
import { apiUrl } from '@/lib/api-url'

type SiteData = {
  reviews: Review[]
  images: Record<ImageSection, ImageItem[]>
  loaded: boolean
}

const SiteDataContext = createContext<SiteData>({
  reviews: [],
  images: { hero: [], gallery: [], apartment: [], layout: [], services: [], location: [], explore: [] },
  loaded: false,
})

export function useSiteData() {
  return useContext(SiteDataContext)
}

function ContentSync({ children }: { children: ReactNode }) {
  const v = useContentVersion()
  return <div key={`content-v${v}`}>{children}</div>
}

const EMPTY_IMAGES: Record<ImageSection, ImageItem[]> = {
  hero: [], gallery: [], apartment: [], layout: [], services: [], location: [], explore: [],
}

export function SiteDataProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [images, setImages] = useState<Record<ImageSection, ImageItem[]>>(EMPTY_IMAGES)
  const [loaded, setLoaded] = useState(false)
  const [contentError, setContentError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const load = useCallback(async () => {
    setLoaded(false)
    setContentError(false)

    try {
      const [reviewsRes, contentRes, imagesRes] = await Promise.all([
        fetch(apiUrl('/api/public/reviews')).then((r) => r.ok ? r.json() : null).catch(() => null),
        fetch(apiUrl(`/api/public/content?locale=${locale}`)).then((r) => {
          if (!r.ok) throw new Error('Content unavailable')
          return r.json()
        }),
        fetch(apiUrl('/api/images')).then((r) => r.ok ? r.json() : null).catch(() => null),
      ])

      setReviews(reviewsRes ?? [])
      setImages(imagesRes ?? EMPTY_IMAGES)
      setContentOverrides(locale, contentRes)
      setLoaded(true)
    } catch {
      setReviews([])
      setImages(EMPTY_IMAGES)
      setContentError(true)
    }
  }, [locale, attempt])

  useEffect(() => { load() }, [load])

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
        {contentError ? (
          <div className="space-y-4">
            <p className="text-foreground">I contenuti non sono disponibili al momento.</p>
            <button className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground" onClick={() => setAttempt((value) => value + 1)}>
              Riprova
            </button>
          </div>
        ) : <p className="text-sm text-muted-foreground">Caricamento...</p>}
      </div>
    )
  }

  return (
    <SiteDataContext.Provider value={{ reviews, images, loaded }}>
      <ContentSync>{children}</ContentSync>
    </SiteDataContext.Provider>
  )
}
