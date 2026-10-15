'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Locale } from '@/lib/i18n'

const REDIRECT_SECONDS = 8

const COPY: Record<Locale, { returning: (seconds: number) => string; returnNow: string }> = {
  it: {
    returning: (seconds) => `Ritorno alla home tra ${seconds} secondi`,
    returnNow: 'Torna subito alla home',
  },
  en: {
    returning: (seconds) => `Returning home in ${seconds} seconds`,
    returnNow: 'Return home now',
  },
  fr: {
    returning: (seconds) => `Retour à l’accueil dans ${seconds} secondes`,
    returnNow: 'Retourner à l’accueil',
  },
  de: {
    returning: (seconds) => `Rückkehr zur Startseite in ${seconds} Sekunden`,
    returnNow: 'Jetzt zur Startseite',
  },
  es: {
    returning: (seconds) => `Volverás al inicio en ${seconds} segundos`,
    returnNow: 'Volver al inicio ahora',
  },
  ru: {
    returning: (seconds) => `Возврат на главную через ${seconds} сек.`,
    returnNow: 'Вернуться на главную',
  },
}

export function SuccessRedirect({ locale }: { locale: Locale }) {
  const router = useRouter()
  const [secondsRemaining, setSecondsRemaining] = useState(REDIRECT_SECONDS)
  const copy = COPY[locale]
  const homePath = `/${locale}`

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsRemaining((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(timer)
          router.replace(homePath)
          return 0
        }
        return seconds - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [homePath, router])

  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {copy.returning(secondsRemaining)}
      </p>
      <button
        type="button"
        onClick={() => router.replace(homePath)}
        className="rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        {copy.returnNow}
      </button>
    </div>
  )
}
