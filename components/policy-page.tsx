'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiUrl } from '@/lib/api-url'
import { t, type Locale } from '@/lib/i18n'
import { RichText } from '@/components/rich-text'

type PolicyKind = 'privacy' | 'terms'

type PolicySection = {
 title: string
 body: string
}

export function PolicyPage({ locale, kind }: { locale: Locale; kind: PolicyKind }) {
 const prefix = kind === 'privacy' ? 'privacyPage' : 'termsPage'
 const [title, setTitle] = useState(t(locale, `${prefix}.title`))
 const [sections, setSections] = useState<PolicySection[]>([])

 useEffect(() => {
  let active = true
  fetch(apiUrl(`/api/public/content?locale=${locale}`))
   .then(async (response) => {
    if (!response.ok) throw new Error(`Unable to load ${kind} page content`)
    return response.json() as Promise<Record<string, unknown>>
   })
   .then((content) => {
    if (!active) return
    if (typeof content[`${prefix}.title`] === 'string') {
     setTitle(content[`${prefix}.title`] as string)
    }
    const titles = content[`${prefix}.sectionTitles`]
    const bodies = content[`${prefix}.sectionBodies`]
    if (!Array.isArray(titles) || !Array.isArray(bodies)) {
     setSections([])
     return
    }
    setSections(titles.flatMap((sectionTitle, index): PolicySection[] => {
     const body = bodies[index]
     return typeof sectionTitle === 'string' && typeof body === 'string'
      ? [{ title: sectionTitle, body }]
      : []
    }))
   })
   .catch((error: unknown) => {
    console.error(`${kind} page content could not be loaded`, error)
   })
  return () => { active = false }
 }, [kind, locale, prefix])

 return (
  <main lang={locale} className="min-h-screen bg-primary px-5 py-16 text-primary-foreground md:px-8">
   <div className="mx-auto w-full max-w-7xl">
    <Link
     href={`/${locale}`}
     className="text-sm underline underline-offset-4 transition-opacity hover:opacity-80"
    >
     {t(locale, 'policyPage.home')}
    </Link>
    <h1 className="type-heading mt-8 font-serif font-medium">
     <RichText text={title} />
    </h1>
     {sections.map((section, index) => (
     <section key={`${index}-${section.title}`} className="mt-10">
      {section.title && (
       <h2 className="type-heading font-serif font-medium">
        <RichText text={section.title} />
       </h2>
      )}
      {section.body && (
       <div className="mt-4 max-w-3xl whitespace-pre-line text-sm leading-7 text-primary-foreground/80">
        <RichText text={section.body} />
       </div>
      )}
     </section>
    ))}
   </div>
  </main>
 )
}
