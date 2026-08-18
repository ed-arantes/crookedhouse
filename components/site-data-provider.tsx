'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { setContentOverrides, type Locale } from '@/lib/i18n'
import { useContentVersion } from '@/hooks/use-content-version'
import type { Review } from '@/lib/reviews'
import reviewsStatic from '@/lib/reviews.json'
import type { ReviewSource } from '@/lib/reviews'

type SiteData = {
  reviews: Review[]
  loaded: boolean
}

const SiteDataContext = createContext<SiteData>({ reviews: [], loaded: false })

export function useSiteData() {
  return useContext(SiteDataContext)
}

function ContentSync({ children }: { children: ReactNode }) {
  const v = useContentVersion()
  return <div key={`content-v${v}`}>{children}</div>
}

export function SiteDataProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    const fallback: Review[] = reviewsStatic.map((r, i) => ({
      ...r,
      id: String(i),
      source: r.source as ReviewSource,
    }))

    try {
      const [reviewsRes, contentRes] = await Promise.all([
        fetch('/api/public/reviews').then((r) => r.ok ? r.json() : null),
        fetch(`/api/public/content?locale=${locale}`).then((r) => r.ok ? r.json() : null),
      ])

      if (reviewsRes?.length) {
        setReviews(reviewsRes.map((r: Review & { id?: string }, i: number) => ({
          ...r,
          id: r.id || String(i),
        })))
      } else {
        setReviews(fallback)
      }

      if (contentRes) {
        setContentOverrides(locale, contentRes)
      }
    } catch {
      setReviews(fallback)
    }

    setLoaded(true)
  }, [locale])

  useEffect(() => { load() }, [load])

  return (
    <SiteDataContext.Provider value={{ reviews, loaded }}>
      <ContentSync>{children}</ContentSync>
    </SiteDataContext.Provider>
  )
}
