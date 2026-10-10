import { getLocaleFromPathname, locales, type Locale } from '@/lib/i18n'
import { ServicesDetailsPage as ServicesPageContent } from '@/components/services-details-page'

export function generateStaticParams() {
 return locales.map((locale) => ({ locale }))
}

export default async function ServicesDetailsPage({
 params,
}: {
 params: Promise<{ locale: string }>
}) {
 const { locale } = await params
 const safeLocale = getLocaleFromPathname(`/${locale}`) as Locale

 return <ServicesPageContent locale={safeLocale} />
}
