'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const REDIRECT_SECONDS = 8

export function SuccessRedirect() {
  const router = useRouter()
  const [secondsRemaining, setSecondsRemaining] = useState(REDIRECT_SECONDS)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsRemaining((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(timer)
          router.replace('/')
          return 0
        }
        return seconds - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [router])

  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Returning home in {secondsRemaining} seconds
      </p>
      <button
        type="button"
        onClick={() => router.replace('/')}
        className="rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        Return home now
      </button>
    </div>
  )
}
