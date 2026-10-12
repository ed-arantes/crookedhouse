'use client'

import Link from 'next/link'
import { t, type Locale } from '@/lib/i18n'
import { RichText } from '@/components/rich-text'

export function Services({ locale = 'en' }: { locale?: Locale }) {
 return (
  <section className="bg-accent py-20 text-accent-foreground md:py-28">
   <div className="mx-auto max-w-7xl px-5 md:px-8">
     <div className="flex flex-col items-start text-left">
      <h2 className="type-heading text-balance font-serif font-medium">
       {t(locale, 'services.headline')}
      </h2>
      <p className="type-body mt-6 text-pretty">
       <RichText text={t(locale, 'services.body')} />
      </p>
      <p className="type-body mt-4">
       <Link
        href={`/${locale}/servizi`}
        className="font-medium underline underline-offset-4 transition-opacity hover:opacity-80"
       >
        Scopri di più
        </Link>
      </p>
     </div>
   </div>
  </section>
 )
}
