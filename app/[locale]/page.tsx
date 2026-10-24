import type { Metadata } from 'next'
import { LodgingStructuredData } from '@/components/lodging-structured-data'
import { SiteShell } from '@/components/site-shell'
import { getLocaleFromPathname, locales, type Locale } from '@/lib/i18n'
import { getHomeMetadata } from '@/lib/seo'

export function generateStaticParams() {
 return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
 params,
}: {
 params: Promise<{ locale: string }>
}): Promise<Metadata> {
 const { locale } = await params
 return getHomeMetadata(getLocaleFromPathname(`/${locale}`))
}

export default async function LocalePage({
 params,
}: {
 params: Promise<{ locale: string }>
}) {
 const { locale } = await params
 const safeLocale = getLocaleFromPathname(`/${locale}`) as Locale

 return (
  <>
   <LodgingStructuredData />
   <SiteShell locale={safeLocale} />
  </>
 )
}
