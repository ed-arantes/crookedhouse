'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { setContentOverrides, type Locale } from '@/lib/i18n'
import { useContentVersion } from '@/hooks/use-content-version'
import type { Review } from '@/lib/reviews'
import { apiUrl } from '@/lib/api-url'

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
  const [contentError, setContentError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const load = useCallback(async () => {
    setLoaded(false)
    setContentError(false)

    try {
      const [reviewsRes, contentRes] = await Promise.all([
        fetch(apiUrl('/api/public/reviews')).then((r) => r.ok ? r.json() : null).catch(() => null),
        fetch(apiUrl(`/api/public/content?locale=${locale}`)).then((r) => {
          if (!r.ok) throw new Error('Content unavailable')
          return r.json()
        }),
      ])

      setReviews(reviewsRes ?? [])
      setContentOverrides(locale, contentRes)
      setLoaded(true)
    } catch {
      setReviews([])
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
    <SiteDataContext.Provider value={{ reviews, loaded }}>
      <ContentSync>{children}</ContentSync>
    </SiteDataContext.Provider>
  )
}
