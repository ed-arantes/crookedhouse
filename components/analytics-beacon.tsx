'use client'

import { useEffect } from 'react'
import { apiUrl } from '@/lib/api-url'

function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return 'h_' + Math.abs(hash).toString(36)
}

export function AnalyticsBeacon() {
  useEffect(() => {
    try {
      const country = document.cookie
        .split('; ')
        .find((c) => c.startsWith('cf_country='))
        ?.split('=')[1] || ''

      const visitorId = localStorage.getItem('ch_vid') || (() => {
        const id = crypto.randomUUID()
        localStorage.setItem('ch_vid', id)
        return id
      })()

      fetch(apiUrl('/api/analytics/track'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: window.location.pathname,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          country,
          ip_hash: hashString(visitorId),
        }),
        keepalive: true,
      }).catch(() => {})
    } catch { /* analytics should never break the site */ }
  }, [])

  return null
}
