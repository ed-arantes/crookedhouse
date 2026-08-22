import { SiteShell } from '@/components/site-shell'
import { getLocaleFromPathname, type Locale } from '@/lib/i18n'
import { redirect } from 'next/navigation'

export function generateStaticParams() {
 return [{ locale: 'it' }]
}

export default async function LocalePage({
 params,
}: {
 params: Promise<{ locale: string }>
}) {
 const { locale } = await params
 if (locale !== 'it') redirect('/it')
 const safeLocale = getLocaleFromPathname(`/${locale}`) as Locale

 return <SiteShell locale={safeLocale} />
}
