'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { setContentOverrides, t, type Locale } from '@/lib/i18n'
import { useContentVersion } from '@/hooks/use-content-version'
import type { Review } from '@/lib/reviews'
import type { ImageItem, ImageSection } from '@/lib/images'
import { apiUrl } from '@/lib/api-url'

type SiteData = {
  reviews: Review[]
  images: Record<ImageSection, ImageItem[]>
}

const SiteDataContext = createContext<SiteData>({
  reviews: [],
  images: { hero: [], apartment: [], layout: [], location: [], explore: [] },
})

export function useSiteData() {
  return useContext(SiteDataContext)
}

function ContentSync({ children }: { children: ReactNode }) {
  const v = useContentVersion()
  return <div key={`content-v${v}`}>{children}</div>
}

const EMPTY_IMAGES: Record<ImageSection, ImageItem[]> = {
  hero: [], apartment: [], layout: [], location: [], explore: [],
}

export function SiteDataProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [images, setImages] = useState<Record<ImageSection, ImageItem[]>>(EMPTY_IMAGES)
  const [contentError, setContentError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const load = useCallback(async () => {
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
    } catch {
      setReviews([])
      setImages(EMPTY_IMAGES)
      setContentError(true)
    }
  }, [locale, attempt])

  useEffect(() => { load() }, [load])

  return (
    <SiteDataContext.Provider value={{ reviews, images }}>
      <ContentSync>{children}</ContentSync>
      {contentError && (
        <div
          role="alert"
          className="fixed inset-x-4 bottom-4 z-50 mx-auto flex w-fit max-w-2xl items-center gap-4 rounded-xl bg-foreground px-5 py-3 text-sm text-background shadow-lg"
        >
          <p>{t(locale, 'errors.contentUnavailable')}</p>
          <button
            className="font-medium underline underline-offset-4"
            onClick={() => setAttempt((value) => value + 1)}
          >
            {t(locale, 'actions.retry')}
          </button>
        </div>
      )}
    </SiteDataContext.Provider>
  )
}
