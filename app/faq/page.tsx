'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SiteFooter } from '@/components/site-footer'
import { RichText } from '@/components/rich-text'
import { apiUrl } from '@/lib/api-url'
import { DEFAULT_FAQ_ITEMS, type FaqItem } from '@/lib/faq-content'

export default function FaqPage() {
  const [faqs, setFaqs] = useState(DEFAULT_FAQ_ITEMS)

  useEffect(() => {
    let active = true
    fetch(apiUrl('/api/public/content?locale=it'))
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load FAQ content')
        return response.json() as Promise<Record<string, unknown>>
      })
      .then((content) => {
        const questions = content['faq.questions']
        const answers = content['faq.answers']
        if (!active || !Array.isArray(questions) || !Array.isArray(answers)) return
        setFaqs(questions.flatMap((question, index): FaqItem[] => {
          const answer = answers[index]
          return typeof question === 'string' && typeof answer === 'string'
            ? [{ question, answer }]
            : []
        }))
      })
      .catch((error: unknown) => {
        console.error('FAQ content could not be loaded', error)
      })
    return () => { active = false }
  }, [])

  return (
    <>
      <main className="min-h-screen bg-background px-5 pb-20 pt-16 md:px-8">
        <div className="mx-auto max-w-3xl">
          <Link href="/" className="text-sm underline underline-offset-4">
            Torna alla home
          </Link>
          <p className="mt-8 text-sm font-medium uppercase tracking-widest text-accent">Crooked House</p>
          <h1 className="type-heading mt-3 font-serif text-4xl font-medium text-foreground">
            Domande frequenti
          </h1>
          <div className="mt-10 divide-y divide-border border-y border-border">
            {faqs.map(({ question, answer }) => (
              <details key={question} className="group py-5">
                <summary className="cursor-pointer list-none pr-8 text-lg font-medium text-foreground marker:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {question}
                    <span aria-hidden="true" className="text-accent transition-transform group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <div className="mt-3 max-w-2xl whitespace-pre-line text-sm leading-7 text-muted-foreground">
                  <RichText text={answer} />
                </div>
              </details>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter locale="it" />
    </>
  )
}
