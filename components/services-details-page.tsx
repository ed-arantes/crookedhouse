'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiUrl } from '@/lib/api-url'
import type { Locale } from '@/lib/i18n'
import { RichText } from '@/components/rich-text'

export function ServicesDetailsPage({ locale }: { locale: Locale }) {
 const [title, setTitle] = useState('Colazioni e pasti')
 const [body, setBody] = useState('')

 useEffect(() => {
  let active = true
  fetch(apiUrl(`/api/public/content?locale=${locale}`))
   .then(async (response) => {
    if (!response.ok) throw new Error('Unable to load services page content')
    return response.json() as Promise<Record<string, unknown>>
   })
   .then((content) => {
    if (!active) return
    if (typeof content['servicesPage.title'] === 'string') setTitle(content['servicesPage.title'])
    if (typeof content['servicesPage.body'] === 'string') setBody(content['servicesPage.body'])
   })
   .catch((error: unknown) => {
    console.error('Services page content could not be loaded', error)
   })
  return () => { active = false }
 }, [locale])

 return (
  <main className="flex min-h-screen items-center bg-accent py-20 text-accent-foreground">
   <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
    <Link
     href={`/${locale}`}
     className="text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-80"
    >
     Torna alla pagina principale
    </Link>
    <h1 className="type-heading mt-10 font-serif font-medium">
     <RichText text={title} />
    </h1>
    {body && (
     <div className="mt-6 max-w-3xl whitespace-pre-line text-sm leading-7 text-accent-foreground/80">
      <RichText text={body} />
     </div>
    )}
   </div>
  </main>
 )
}