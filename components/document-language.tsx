'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getLocaleFromPathname } from '@/lib/i18n'

export function DocumentLanguage() {
 const pathname = usePathname()

 useEffect(() => {
  document.documentElement.lang = getLocaleFromPathname(pathname)
 }, [pathname])

 return null
}
