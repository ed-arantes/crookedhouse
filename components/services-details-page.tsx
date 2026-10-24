'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiUrl } from '@/lib/api-url'
import { t, tArray, type Locale } from '@/lib/i18n'
import { RichText } from '@/components/rich-text'

type ServiceSection = {
 title: string
 body: string
}

export function ServicesDetailsPage({ locale }: { locale: Locale }) {
 const [sections, setSections] = useState<ServiceSection[]>(() => {
  const titles = tArray(locale, 'servicesPage.sectionTitles')
  const bodies = tArray(locale, 'servicesPage.sectionBodies')
  const initialSections = titles.flatMap((title, index): ServiceSection[] => {
   const body = bodies[index]
   return typeof body === 'string' ? [{ title, body }] : []
  })
  return initialSections.length > 0
   ? initialSections
   : [{ title: t(locale, 'services.headline'), body: t(locale, 'services.body') }]
 })

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
     const loadedSections = titles.flatMap((title, index): ServiceSection[] => {
      const body = bodies[index]
      return typeof title === 'string' && typeof body === 'string'
       ? [{ title, body }]
       : []
     })
     if (loadedSections.length > 0) setSections(loadedSections)
    } else {
     const fallbackTitles = tArray(locale, 'servicesPage.sectionTitles')
     const fallbackBodies = tArray(locale, 'servicesPage.sectionBodies')
     const fallbackSections = fallbackTitles.flatMap((title, index): ServiceSection[] => {
      const body = fallbackBodies[index]
      return typeof body === 'string' ? [{ title, body }] : []
     })
     setSections(fallbackSections.length > 0 ? fallbackSections : [{
       title: typeof content['servicesPage.title'] === 'string'
        ? content['servicesPage.title']
        : typeof content['services.headline'] === 'string'
         ? content['services.headline']
         : t(locale, 'services.headline'),
       body: typeof content['servicesPage.body'] === 'string'
        ? content['servicesPage.body']
        : typeof content['services.body'] === 'string'
         ? content['services.body']
         : t(locale, 'services.body'),
      }])
    }
   })
   .catch((error: unknown) => {
    console.error('Services page content could not be loaded', error)
   })
  return () => { active = false }
 }, [locale])

 return (
  <main lang={locale} className="min-h-screen bg-accent px-5 py-16 text-accent-foreground md:px-8">
   <div className="mx-auto w-full max-w-7xl">
    <Link
     href={`/${locale}`}
     className="text-sm underline underline-offset-4 transition-opacity hover:opacity-80"
    >
     {t(locale, 'policyPage.home')}
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