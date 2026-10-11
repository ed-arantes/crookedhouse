'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiUrl } from '@/lib/api-url'
import type { Locale } from '@/lib/i18n'
import { RichText } from '@/components/rich-text'

type ServiceSection = {
 title: string
 body: string
}

export function ServicesDetailsPage({ locale }: { locale: Locale }) {
 const [sections, setSections] = useState<ServiceSection[]>([
  { title: 'Colazioni e pasti', body: '' },
 ])

 useEffect(() => {
  let active = true
  fetch(apiUrl(`/api/public/content?locale=${locale}`))
   .then(async (response) => {
    if (!response.ok) throw new Error('Unable to load services page content')
    return response.json() as Promise<Record<string, unknown>>
   })
   .then((content) => {
    if (!active) return
    const titles = content['servicesPage.sectionTitles']
    const bodies = content['servicesPage.sectionBodies']
    if (Array.isArray(titles) && Array.isArray(bodies)) {
     setSections(titles.flatMap((title, index): ServiceSection[] => {
      const body = bodies[index]
      return typeof title === 'string' && typeof body === 'string'
       ? [{ title, body }]
       : []
     }))
    } else {
     setSections([{
      title: typeof content['servicesPage.title'] === 'string'
       ? content['servicesPage.title']
       : 'Colazioni e pasti',
      body: typeof content['servicesPage.body'] === 'string'
       ? content['servicesPage.body']
       : '',
     }])
    }
   })
   .catch((error: unknown) => {
    console.error('Services page content could not be loaded', error)
   })
  return () => { active = false }
 }, [locale])

 return (
  <main className="min-h-screen bg-accent px-5 py-16 text-accent-foreground md:px-8">
   <div className="mx-auto w-full max-w-7xl">
    <Link
     href={`/${locale}`}
     className="text-sm underline underline-offset-4 transition-opacity hover:opacity-80"
    >
     Torna alla pagina principale
    </Link>
    {sections.map((section, index) => (
     <section key={`${index}-${section.title}`} className={index === 0 ? 'mt-8' : 'mt-12'}>
      {index === 0 ? (
       <h1 className="type-heading font-serif font-medium">
        <RichText text={section.title} />
       </h1>
      ) : (
       <h2 className="type-heading font-serif font-medium">
        <RichText text={section.title} />
       </h2>
      )}
      {section.body && (
       <div className="mt-6 max-w-3xl whitespace-pre-line text-sm leading-7 text-accent-foreground/80">
        <RichText text={section.body} />
       </div>
      )}
     </section>
    ))}
   </div>
  </main>
 )
}