import { SiteShell } from '@/components/site-shell'
import { getLocaleFromPathname, locales, type Locale } from '@/lib/i18n'

export function generateStaticParams() {
 return locales.map((locale) => ({ locale }))
}

export default async function LocalePage({
 params,
}: {
 params: Promise<{ locale: string }>
}) {
 const { locale } = await params
 const safeLocale = getLocaleFromPathname(`/${locale}`) as Locale

 return <SiteShell locale={safeLocale} />
}
